import os
import pandas as pd
from ai_engine.prediction_service import prediction_service

class AIConflictNegotiator:
    def __init__(self):
        pass

    def negotiate_conflict(self, conflict_id: str, payload: dict = None) -> dict:
        if payload is None:
            payload = {}

        corridor_id = payload.get("corridorId", "COR-001")
        req_departments = payload.get("departments", ["Engineering", "S&T"])
        if isinstance(req_departments, list) and req_departments:
            departments_list = [str(d) for d in req_departments]
        else:
            departments_list = ["Engineering", "S&T"]

        # Candidate combined block time windows across non-peak/flexible slots
        candidate_windows = [
            ("10:30", "14:00", 210),
            ("11:30", "14:30", 180),
            ("13:00", "16:30", 210),
            ("14:30", "18:00", 210),
            ("21:00", "00:30", 210),
        ]

        best_window = None
        min_delay = float("inf")

        for c_start, c_end, dur in candidate_windows:
            impact = prediction_service.predict_traffic_impact({
                "corridorId": corridor_id,
                "blockStart": c_start,
                "blockEnd": c_end,
                "maintenanceDuration": dur
            })["expectedImpact"]

            delay = impact["expectedDelayMinutes"]
            if delay < min_delay:
                min_delay = delay
                best_window = (c_start, c_end, dur)

        if not best_window:
            best_window = ("10:30", "14:00", 210)

        best_start, best_end, total_dur = best_window

        # Allocate department durations based on actual task durations from maintenance_tasks.csv
        from ai_engine.optimizer import get_csv_path
        dept_task_durations = {}
        try:
            df_tasks = pd.read_csv(get_csv_path("maintenance_tasks.csv"))
            corr_tasks = df_tasks[df_tasks["corridorId"] == corridor_id]
            for dept in departments_list:
                dept_match = corr_tasks[corr_tasks["department"].astype(str).str.lower() == str(dept).lower()]
                if not dept_match.empty:
                    d_sum = 0.0
                    for _, r in dept_match.iterrows():
                        d_val = r.get("estimatedDurationMinutes", r.get("estimatedDuration", 60))
                        d_sum += float(d_val) if pd.notna(d_val) else 60.0
                    dept_task_durations[dept] = max(30.0, d_sum)
        except Exception:
            pass

        # Sum raw allocations and scale proportionally if total exceeds window duration
        raw_alloc_total = sum(dept_task_durations.get(d, 60.0) for d in departments_list)
        dept_allocations = []
        
        for dept in departments_list:
            raw_val = dept_task_durations.get(dept, 60.0)
            if raw_alloc_total > total_dur:
                # Scale down proportionally to fit in combined maintenance window
                alloc = int(round(raw_val * (total_dur / raw_alloc_total)))
            else:
                alloc = int(round(raw_val))
            dept_allocations.append({
                "department": dept,
                "allocatedDuration": max(15, alloc)
            })

        return {
            "success": True,
            "conflictId": conflict_id,
            "recommendation": {
                "type": "combined_block",
                "start": best_start,
                "end": best_end,
                "duration": total_dur
            },
            "departments": dept_allocations,
            "reason": f"Combining maintenance activities into window {best_start}-{best_end} minimizes corridor traffic impact to {min_delay} mins expected delay."
        }

conflict_negotiator = AIConflictNegotiator()

