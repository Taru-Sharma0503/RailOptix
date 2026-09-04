import os
import uuid
import pandas as pd
from ai_engine.optimizer import get_csv_path, ALL_BLOCKS
from ai_engine.prediction_service import prediction_service, parse_time_minutes

class WhatIfSimulationTwin:
    def __init__(self):
        pass

    def run_simulation(self, request_data: dict) -> dict:
        scenario_id = f"SIM-{uuid.uuid4().hex[:6].upper()}"
        corridor_id = request_data.get("corridorId", "COR-001")
        block = request_data.get("block", {"start": "10:00", "end": "14:00"})
        task_ids = request_data.get("maintenanceTaskIds", [])

        b_start = str(block.get("start", "10:00"))
        b_end = str(block.get("end", "14:00"))

        start_min = parse_time_minutes(b_start)
        end_min = parse_time_minutes(b_end)
        dur = max(60, end_min - start_min)

        # Evaluate current requested block
        impact = prediction_service.predict_traffic_impact({
            "corridorId": corridor_id,
            "blockStart": b_start,
            "blockEnd": b_end,
            "maintenanceDuration": dur
        })["expectedImpact"]

        affected_trains = impact["affectedTrains"]
        expected_delay = impact["expectedDelayMinutes"]

        # Validate task IDs against maintenance_tasks.csv for affected assets & total task duration
        valid_task_count = 0
        total_task_minutes = 0.0
        if task_ids:
            try:
                df_tasks = pd.read_csv(get_csv_path("maintenance_tasks.csv"))
                matched = df_tasks[df_tasks["taskId"].isin(task_ids)]
                valid_task_count = len(matched)
                for _, r in matched.iterrows():
                    d = r.get("estimatedDurationMinutes", r.get("estimatedDuration", 60.0))
                    total_task_minutes += float(d) if pd.notna(d) else 60.0
            except Exception:
                valid_task_count = 0
                total_task_minutes = 0.0

        affected_assets = valid_task_count
        block_utilization = round(min(100.0, (total_task_minutes / max(1.0, float(dur))) * 100.0), 1)

        risk_str = "high" if expected_delay > 30 else ("medium" if expected_delay > 15 else "low")
        avail = round(95.0 - (expected_delay * 0.1), 1)
        conflicts = impact.get("criticalTrainsAffected", 0)

        # Candidate alternative windows using standard corridor blocks (ALL_BLOCKS)
        alternative_blocks = []
        for cand in ALL_BLOCKS:
            if cand["start"] == b_start and cand["end"] == b_end:
                continue

            cand_impact = prediction_service.predict_traffic_impact({
                "corridorId": corridor_id,
                "blockStart": cand["start"],
                "blockEnd": cand["end"],
                "maintenanceDuration": (cand["end_slot"] - cand["start_slot"]) * 15
            })["expectedImpact"]

            cand_delay = cand_impact["expectedDelayMinutes"]
            cand_risk = "high" if cand_delay > 30 else ("medium" if cand_delay > 15 else "low")

            alternative_blocks.append({
                "start": cand["start"],
                "end": cand["end"],
                "expectedDelayMinutes": cand_delay,
                "risk": cand_risk
            })

        if not alternative_blocks:
            alternative_blocks.append({
                "start": "14:30",
                "end": "17:30",
                "expectedDelayMinutes": expected_delay,
                "risk": risk_str
            })

        best_alt = min(alternative_blocks, key=lambda b: b["expectedDelayMinutes"])

        return {
            "success": True,
            "scenarioId": scenario_id,
            "corridorId": corridor_id,
            "block": block,
            "results": {
                "affectedTrains": affected_trains,
                "expectedDelayMinutes": expected_delay,
                "affectedAssets": affected_assets,
                "infrastructureAvailability": avail,
                "conflicts": conflicts,
                "blockUtilization": block_utilization,
                "risk": risk_str
            },
            "alternativeBlocks": alternative_blocks,
            "recommendation": {
                "type": "alternative_block",
                "start": best_alt["start"],
                "end": best_alt["end"]
            }
        }

simulation_twin = WhatIfSimulationTwin()
