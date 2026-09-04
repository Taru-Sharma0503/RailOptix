import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def parse_time_minutes(t_str: str) -> int:
    """Parse 'HH:MM' time string into minutes from midnight, raising ValueError on malformed inputs."""
    if not t_str or not isinstance(t_str, str):
        raise ValueError(f"Invalid time value: '{t_str}'. Expected 'HH:MM' string.")
    parts = t_str.strip().split(":")
    if len(parts) != 2:
        raise ValueError(f"Invalid time format: '{t_str}'. Expected 'HH:MM'.")
    try:
        h, m = int(parts[0]), int(parts[1])
    except ValueError:
        raise ValueError(f"Non-numeric characters in time string: '{t_str}'.")
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise ValueError(f"Time out of range: '{t_str}'. Hours must be 00-23, minutes 00-59.")
    return h * 60 + m

class PredictionService:
    def __init__(self):
        self.priority_model = self._load_model("priority_score_model.joblib")
        self.failure_risk_model = self._load_model("failure_risk_model.joblib")
        self.traffic_delay_model = self._load_model("traffic_delay_model.joblib")
        self.traffic_affected_model = self._load_model("traffic_affected_trains_model.joblib")
        self.traffic_critical_model = self._load_model("traffic_critical_trains_model.joblib")

    @staticmethod
    def _get_risk_level(failure_risk: float) -> str:
        """Standardized static risk level categorization scale.
        0.90 – 1.00: Critical
        0.75 – 0.89: High
        0.50 – 0.74: Medium
        0.00 – 0.49: Low
        """
        if failure_risk >= 0.90:
            return "Critical"
        elif failure_risk >= 0.75:
            return "High"
        elif failure_risk >= 0.50:
            return "Medium"
        else:
            return "Low"

    def _load_model(self, filename):
        path = os.path.join(MODELS_DIR, filename)
        if os.path.exists(path):
            try:
                return joblib.load(path)
            except Exception as e:
                print(f"Warning: Failed to load {filename}: {e}")
        return None

    def _lookup_asset(self, asset_id: str):
        """Look up asset row from assets.csv for enrichment."""
        if not hasattr(self, "_asset_df"):
            csv_candidates = [
                os.path.join(os.path.dirname(__file__), "csv", "assets.csv"),
                os.path.join(os.path.dirname(__file__), "..", "csv", "assets.csv"),
                os.path.join("csv", "assets.csv"),
            ]
            csv_path = next((p for p in csv_candidates if os.path.exists(p)), None)
            if csv_path:
                try:
                    self._asset_df = pd.read_csv(csv_path)
                except Exception:
                    self._asset_df = None
            else:
                self._asset_df = None
        if self._asset_df is not None:
            row = self._asset_df[self._asset_df["assetId"] == asset_id]
            if not row.empty:
                return row.iloc[0].to_dict()
        return None

    def _build_features(self, data: dict, asset_id: str) -> pd.DataFrame:
        """Extract the 8 core ML features, enriching from assets.csv when possible."""
        defect_severity = float(data.get("defectSeverity", 5))
        asset_criticality = float(data.get("assetCriticality", 5))
        historical_failures = float(data.get("historicalFailures", 1))
        overdue_days = float(data.get("overdueDays", data.get("overdueDuration", 0)))
        train_traffic = float(data.get("trainTraffic", 50))
        safety_risk = float(data.get("safetyRisk", 5))
        asset_age = float(data.get("assetAgeYears", data.get("age", 10)))

        if "expectedDegradation" in data:
            expected_degradation = float(data["expectedDegradation"])
        elif "condition" in data:
            cond_mapping = {"good": 0.2, "fair": 0.4, "warning": 0.7, "critical": 0.95}
            cond_str = str(data["condition"]).strip().lower()
            expected_degradation = float(cond_mapping.get(cond_str, 0.5))
        else:
            expected_degradation = 0.5

        # Enrich missing fields from assets.csv when a real assetId is given
        if asset_id != "AST-000":
            asset_row = self._lookup_asset(asset_id)
            if asset_row is not None:
                if "assetCriticality" not in data and "criticality" in asset_row:
                    asset_criticality = float(asset_row["criticality"])
                if "assetAgeYears" not in data and "age" not in data and "ageYears" in asset_row:
                    asset_age = float(asset_row["ageYears"])
                if "historicalFailures" not in data and "historicalFailures" in asset_row:
                    historical_failures = float(asset_row["historicalFailures"])
                if "expectedDegradation" not in data and "condition" not in data and "degradationLatent" in asset_row:
                    expected_degradation = float(asset_row["degradationLatent"])
                if "trainTraffic" not in data and "trafficLevel" in asset_row:
                    train_traffic = float(asset_row["trafficLevel"])

        return pd.DataFrame([{
            "defectSeverity": defect_severity,
            "assetCriticality": asset_criticality,
            "historicalFailures": historical_failures,
            "overdueDays": overdue_days,
            "trainTraffic": train_traffic,
            "safetyRisk": safety_risk,
            "expectedDegradation": expected_degradation,
            "assetAgeYears": asset_age,
        }])

    def predict_maintenance_priority(self, data: dict) -> dict:
        asset_id = data.get("assetId", "AST-000")
        features = self._build_features(data, asset_id)
        row = features.iloc[0]

        if self.priority_model and self.failure_risk_model:
            priority_score = float(self.priority_model.predict(features)[0])
            failure_risk = float(self.failure_risk_model.predict(features)[0])
        else:
            # Fallback weighted model per Section 47
            priority_score = (
                0.25 * (row["defectSeverity"] / 10.0 * 100) +
                0.20 * (row["assetCriticality"] / 10.0 * 100) +
                0.15 * min(100, row["overdueDays"] * 10) +
                0.15 * row["trainTraffic"] +
                0.15 * (row["safetyRisk"] / 10.0 * 100) +
                0.10 * (row["historicalFailures"] / 10.0 * 100)
            )
            failure_risk = priority_score / 100.0

        priority_score = round(max(0, min(100, priority_score)), 1)
        failure_risk = round(max(0.0, min(1.0, failure_risk)), 3)

        risk_level = self._get_risk_level(failure_risk)

        if risk_level == "Critical":
            days_until_deadline = max(1, int(10 - (priority_score / 10)))
        elif risk_level == "High":
            days_until_deadline = max(1, int(15 - (priority_score / 10)))
        elif risk_level == "Medium":
            days_until_deadline = max(5, int(20 - (priority_score / 5)))
        else:
            days_until_deadline = 30

        today = date.today()
        rec_deadline = (today + timedelta(days=days_until_deadline)).strftime("%Y-%m-%d")

        return {
            "success": True,
            "assetId": asset_id,
            "priorityScore": int(round(priority_score)),
            "failureRisk": failure_risk,
            "riskLevel": risk_level,
            "recommendedDeadline": rec_deadline
        }

    def predict_failure_risk(self, data: dict) -> dict:
        asset_id = data.get("assetId", "AST-000")
        features = self._build_features(data, asset_id)
        row = features.iloc[0]

        if self.failure_risk_model:
            failure_risk = float(self.failure_risk_model.predict(features)[0])
        else:
            # Fallback hand-written formula (only when model file is missing)
            condition = str(data.get("condition", "Fair")).lower()
            cond_factor = {"good": 0.2, "fair": 0.4, "warning": 0.7, "critical": 0.95}.get(condition, 0.5)
            failure_risk = (
                0.35 * cond_factor +
                0.25 * (row["defectSeverity"] / 10.0) +
                0.20 * (min(40, row["assetAgeYears"]) / 40.0) +
                0.20 * (min(10, row["historicalFailures"]) / 10.0)
            )

        failure_risk = round(max(0.0, min(1.0, failure_risk)), 3)
        risk_level = self._get_risk_level(failure_risk)

        return {
            "success": True,
            "assetId": asset_id,
            "failureRisk": failure_risk,
            "riskLevel": risk_level
        }

    def _load_train_schedules(self) -> pd.DataFrame:
        """Dynamically load train schedules from train_schedules.csv or trains.csv."""
        if not hasattr(self, "_train_schedules_df"):
            csv_candidates = [
                os.path.join(os.path.dirname(__file__), "csv", "train_schedules.csv"),
                os.path.join(os.path.dirname(__file__), "..", "csv", "train_schedules.csv"),
                os.path.join("csv", "train_schedules.csv"),
                os.path.join(os.path.dirname(__file__), "csv", "trains.csv"),
                os.path.join(os.path.dirname(__file__), "..", "csv", "trains.csv"),
                os.path.join("csv", "trains.csv"),
            ]
            csv_path = next((p for p in csv_candidates if os.path.exists(p)), None)
            if csv_path:
                try:
                    self._train_schedules_df = pd.read_csv(csv_path)
                except Exception:
                    self._train_schedules_df = None
            else:
                self._train_schedules_df = None
        return self._train_schedules_df

    def predict_traffic_impact(self, data: dict) -> dict:
        """Predict traffic impact for a maintenance block on a corridor.
        
        Note: planningDate is supported in the API payload for multi-day timetable extension,
        while current synthetic train_schedules.csv represents a static daily schedule.
        """
        corridor_id = data.get("corridorId", "COR-001")
        block_start = str(data.get("blockStart", data.get("blockStartTime", "10:00")))
        block_end = str(data.get("blockEnd", data.get("blockEndTime", "14:00")))
        planning_date = data.get("planningDate", data.get("date", None))

        start_min = parse_time_minutes(block_start)
        end_min = parse_time_minutes(block_end)

        is_cross_midnight = end_min <= start_min
        if is_cross_midnight:
            # Handle windows spanning across midnight (e.g. 21:00 -> 00:30 = 210 mins)
            duration_minutes = (1440 - start_min) + end_min
            duration_hours = duration_minutes / 60.0
        else:
            duration_hours = (end_min - start_min) / 60.0

        if duration_hours <= 0:
            duration_hours = 4.0

        sh = start_min // 60
        is_peak = 1 if (7 <= sh <= 10 or 17 <= sh <= 20) else 0

        # ---- Timetable Intersection: Calculate affected & critical trains from train_schedules.csv ----
        df_schedules = self._load_train_schedules()
        affected_trains = 0
        critical_trains_affected = 0

        if df_schedules is not None and not df_schedules.empty and "corridorId" in df_schedules.columns:
            corr_trains = df_schedules[df_schedules["corridorId"] == corridor_id]
            if not corr_trains.empty and "departure" in corr_trains.columns:
                intersecting = []
                for _, t_row in corr_trains.iterrows():
                    dep_str = str(t_row.get("departure", "00:00"))
                    try:
                        dep_min = parse_time_minutes(dep_str)
                    except ValueError:
                        continue
                    if is_cross_midnight:
                        if dep_min >= start_min or dep_min <= end_min:
                            intersecting.append(t_row)
                    else:
                        if start_min <= dep_min <= end_min:
                            intersecting.append(t_row)
                
                if intersecting:
                    df_intersect = pd.DataFrame(intersecting)
                    affected_trains = len(df_intersect)
                    critical_types = {"express", "freight", "critical"}
                    critical_trains_affected = len(
                        df_intersect[df_intersect["type"].astype(str).str.lower().isin(critical_types)]
                    )

        # Load corridor traffic level if available
        corridor_traffic = 75.0
        csv_candidates = [
            os.path.join(os.path.dirname(__file__), "csv", "corridors.csv"),
            os.path.join(os.path.dirname(__file__), "..", "csv", "corridors.csv"),
            "csv/corridors.csv",
            "corridors.csv"
        ]
        csv_path = next((p for p in csv_candidates if os.path.exists(p)), None)
        if csv_path:
            try:
                corr_df = pd.read_csv(csv_path)
                row = corr_df[corr_df["corridorId"] == corridor_id]
                if not row.empty:
                    corridor_traffic = float(row["trafficLevel"].values[0])
            except Exception as e:
                print(f"Warning: Failed to read {csv_path}: {e}")

        alt_routes = 2 if corridor_traffic < 75 else 1

        features = pd.DataFrame([{
            "corridorTrafficLevel": corridor_traffic,
            "blockDurationHours": duration_hours,
            "isPeakHour": is_peak,
            "alternativeRoutesAvailable": alt_routes
        }])

        # ---- ML Traffic Models Inference ----
        if self.traffic_affected_model:
            ml_affected_trains = float(self.traffic_affected_model.predict(features)[0])
        else:
            ml_affected_trains = (corridor_traffic / 100.0) * (duration_hours * 2.5)

        if self.traffic_critical_model:
            ml_critical_trains = float(self.traffic_critical_model.predict(features)[0])
        else:
            ml_critical_trains = ml_affected_trains * 0.3

        if self.traffic_delay_model:
            expected_delay = float(self.traffic_delay_model.predict(features)[0])
        else:
            expected_delay = (corridor_traffic / 100.0) * duration_hours * (15.0 if is_peak else 8.0)

        # Use timetable count if available, otherwise use ML model predictions
        final_affected = affected_trains if affected_trains > 0 else int(round(max(0, ml_affected_trains)))
        final_critical = critical_trains_affected if affected_trains > 0 else int(round(max(0, ml_critical_trains)))

        return {
            "success": True,
            "expectedImpact": {
                "affectedTrains": max(0, final_affected),
                "expectedDelayMinutes": int(round(max(0, expected_delay))),
                "criticalTrainsAffected": max(0, final_critical),
                "alternativeRoutesAvailable": alt_routes
            }
        }

prediction_service = PredictionService()


