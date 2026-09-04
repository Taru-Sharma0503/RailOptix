import unittest
import json
from fastapi.testclient import TestClient
from ai_engine.app import app

class TestRailOptixAIEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_maintenance_priority_prediction(self):
        payload = {
            "assetId": "AST-001",
            "defectSeverity": 8,
            "assetCriticality": 9,
            "historicalFailures": 3,
            "overdueDuration": 5,
            "trainTraffic": 87,
            "safetyRisk": 8,
            "expectedDegradation": 0.72
        }
        res = self.client.post("/api/predictions/maintenance-priority", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["assetId"], "AST-001")
        self.assertIn("priorityScore", data)
        self.assertIn("failureRisk", data)
        self.assertIn("riskLevel", data)
        self.assertIn("recommendedDeadline", data)
        print("[PASS] Maintenance Priority Prediction API verified:", data)

    def test_02_failure_risk_prediction(self):
        payload = {
            "assetId": "AST-0001",
            "defectSeverity": 8,
            "assetCriticality": 9,
            "historicalFailures": 3,
            "overdueDays": 5,
            "trainTraffic": 87,
            "safetyRisk": 8,
            "expectedDegradation": 0.72,
            "assetAgeYears": 12
        }
        res = self.client.post("/api/predictions/failure-risk", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["assetId"], "AST-0001")
        self.assertIn("failureRisk", data)
        self.assertIn("riskLevel", data)
        # Verify consistency with maintenance-priority endpoint
        prio_res = self.client.post("/api/predictions/maintenance-priority", json=payload)
        prio_data = prio_res.json()
        self.assertAlmostEqual(data["failureRisk"], prio_data["failureRisk"], places=2,
                               msg="failure-risk and maintenance-priority should return consistent failureRisk")
        print("[PASS] Failure Risk Prediction API verified:", data)

    def test_03_traffic_impact_prediction(self):
        payload = {
            "corridorId": "COR-001",
            "blockStart": "10:00",
            "blockEnd": "14:00",
            "trainType": "all",
            "maintenanceDuration": 240
        }
        res = self.client.post("/api/predictions/traffic-impact", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("expectedImpact", data)
        impact = data["expectedImpact"]
        self.assertIn("affectedTrains", impact)
        self.assertIn("expectedDelayMinutes", impact)
        self.assertIn("criticalTrainsAffected", impact)
        self.assertGreaterEqual(impact["affectedTrains"], 1, "Timetable intersection should identify affected trains in payload window")
        print("[PASS] Traffic Impact Prediction API verified:", data)

    def test_04_optimization_cp_sat(self):
        payload = {
            "corridorId": "COR-001",
            "planningDate": "2026-09-12",
            "maintenanceTaskIds": ["MT-00001", "MT-00002", "MT-00003"],
            "blockIds": ["BLK-001", "BLK-002"],
            "objective": {
                "assetAvailability": 0.35,
                "trainDisruption": 0.30,
                "conflicts": 0.15,
                "blockWastage": 0.10,
                "safetyRisk": 0.10
            }
        }
        res = self.client.post("/api/optimize", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("runId", data)
        run_id = data["runId"]

        # Check result
        res_res = self.client.get(f"/api/optimize/{run_id}/result")
        self.assertEqual(res_res.status_code, 200)
        res_data = res_res.json()
        self.assertIn("schedule", res_data)
        self.assertIn("metrics", res_data)
        # Verify block_ids constraint: schedule should only use BLK-001 or BLK-002
        allowed_blocks = {"BLK-001", "BLK-002"}
        for entry in res_data["schedule"]:
            self.assertIn(entry["blockId"], allowed_blocks,
                          f"Task {entry['maintenanceTaskId']} assigned to {entry['blockId']} outside allowed blocks")
            self.assertIn("start", entry)
            self.assertIn("end", entry)
            self.assertNotEqual(entry["start"], entry["end"], "Task start and end times should reflect non-zero duration")
        print("[PASS] OR-Tools CP-SAT Optimizer API verified:", res_data)

    def test_05_explainable_ai(self):
        # First create an optimization run so XAI has real context
        opt_payload = {
            "corridorId": "COR-001",
            "maintenanceTaskIds": ["MT-00001", "MT-00002", "MT-00003"],
        }
        opt_res = self.client.post("/api/optimize", json=opt_payload)
        run_id = opt_res.json()["runId"]

        res = self.client.get(f"/api/optimize/{run_id}/explanation")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("whyOptimal", data)
        self.assertGreater(len(data["whyOptimal"]), 0)
        # Verify explanations are per-prediction (not all identical scores)
        scores = [f["score"] for f in data["whyOptimal"]]
        self.assertFalse(all(s == scores[0] for s in scores),
                         "All explanation scores are identical — likely still hardcoded")
        print("[PASS] Explainable AI API verified:", data)

    def test_06_conflict_negotiator(self):
        payload = {"conflictId": "CON-001"}
        res = self.client.post("/api/conflicts/negotiate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("recommendation", data)
        self.assertIn("departments", data)
        print("[PASS] AI Conflict Negotiator API verified:", data)

    def test_07_what_if_simulation(self):
        payload = {
            "corridorId": "COR-001",
            "block": {"start": "10:00", "end": "14:00"},
            "maintenanceTaskIds": ["MT-00001", "MT-00002"],
            "trainScheduleDate": "2026-09-12"
        }
        res = self.client.post("/api/simulation", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("results", data)
        self.assertIn("alternativeBlocks", data)
        print("[PASS] Digital Twin Simulation API verified:", data)

    def test_08_condition_impact(self):
        from ai_engine.prediction_service import prediction_service
        # Payload for an unknown asset (no CSV enrichment)
        base_data = {
            "assetId": "AST-9999",
            "defectSeverity": 5, 
            "assetAgeYears": 10, 
            "historicalFailures": 1
        }
        
        # Predict with "Good" condition
        good_data = base_data.copy()
        good_data["condition"] = "Good"
        res_good = prediction_service.predict_failure_risk(good_data)
        
        # Predict with "Critical" condition
        crit_data = base_data.copy()
        crit_data["condition"] = "Critical"
        res_crit = prediction_service.predict_failure_risk(crit_data)
        
        # Assertions
        self.assertNotEqual(
            res_good["failureRisk"], res_crit["failureRisk"], 
            "Condition parameter is being silently ignored!"
        )
        self.assertLess(
            res_good["failureRisk"], res_crit["failureRisk"], 
            "A 'Good' condition should result in a lower risk score than 'Critical'."
        )
        print(f"\n[PASS] Condition Impact verified: Good Risk ({res_good['failureRisk']}) < Critical Risk ({res_crit['failureRisk']})")

    def test_09_invalid_task_id_returns_error(self):
        payload = {
            "corridorId": "COR-001",
            "maintenanceTaskIds": ["MT-INVALID999"]
        }
        res = self.client.post("/api/optimize", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Task ID(s) not found", res.json()["detail"])
        print("[PASS] Invalid task ID validation verified")

    def test_10_invalid_block_id_returns_error(self):
        payload = {
            "corridorId": "COR-001",
            "blockIds": ["BLK-INVALID999"]
        }
        res = self.client.post("/api/optimize", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Block ID(s) not found", res.json()["detail"])
        print("[PASS] Invalid block ID validation verified")

    def test_11_invalid_time_format_returns_error(self):
        payload = {
            "corridorId": "COR-001",
            "blockStart": "25:99",
            "blockEnd": "14:00"
        }
        res = self.client.post("/api/predictions/traffic-impact", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Time out of range", res.json()["detail"])
        print("[PASS] Invalid time format validation verified")

    def test_12_infeasible_schedule_handling(self):
        # Attempting to schedule multiple tasks into a single block with capacity smaller than task durations
        from ai_engine.optimizer import optimizer
        payload = {
            "corridorId": "COR-001",
            "maintenanceTaskIds": ["MT-00001", "MT-00002"],
            "blockIds": ["BLK-001"] # BLK-001 has 12 slots (180 mins). If tasks exceed capacity or overlap constraints occur
        }
        res = self.client.post("/api/optimize", json=payload)
        self.assertIn(res.status_code, (200, 400))
        print("[PASS] Infeasible schedule status handling verified")

    def test_13_objective_weight_sensitivity(self):
        # Verify objective weights change objective calculation or schedule
        payload1 = {
            "corridorId": "COR-001",
            "maintenanceTaskIds": ["MT-00001", "MT-00002"],
            "objective": {"assetAvailability": 1.0, "trainDisruption": 0.0, "conflicts": 0.0, "blockWastage": 0.0, "safetyRisk": 0.0}
        }
        payload2 = {
            "corridorId": "COR-001",
            "maintenanceTaskIds": ["MT-00001", "MT-00002"],
            "objective": {"assetAvailability": 0.0, "trainDisruption": 1.0, "conflicts": 0.0, "blockWastage": 0.0, "safetyRisk": 0.0}
        }
        res1 = self.client.post("/api/optimize", json=payload1)
        res2 = self.client.post("/api/optimize", json=payload2)
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)
        r1_data = self.client.get(f"/api/optimize/{res1.json()['runId']}/result").json()
        r2_data = self.client.get(f"/api/optimize/{res2.json()['runId']}/result").json()
        self.assertNotEqual(r1_data["schedule"], r2_data["schedule"],
                            "Changing objective weights should alter solver schedule")
        print("[PASS] Objective weight sensitivity verified")

    def test_14_simulation_dynamic_utilization(self):
        payload1 = {
            "corridorId": "COR-001",
            "block": {"start": "10:00", "end": "14:00"},
            "maintenanceTaskIds": ["MT-00001"]
        }
        payload2 = {
            "corridorId": "COR-001",
            "block": {"start": "10:00", "end": "14:00"},
            "maintenanceTaskIds": ["MT-00001", "MT-00002"]
        }
        res1 = self.client.post("/api/simulation", json=payload1).json()
        res2 = self.client.post("/api/simulation", json=payload2).json()
        util1 = res1["results"]["blockUtilization"]
        util2 = res2["results"]["blockUtilization"]
        self.assertNotEqual(util1, util2, "blockUtilization should change dynamically based on task durations")
        print(f"[PASS] Dynamic simulation utilization verified: {util1}% != {util2}%")

    def test_15_negotiator_actual_department_durations(self):
        payload = {
            "conflictId": "CON-001",
            "corridorId": "COR-001",
            "departments": ["Engineering", "S&T"]
        }
        res = self.client.post("/api/conflicts/negotiate", json=payload).json()
        self.assertTrue(res["success"])
        self.assertIn("departments", res)
        depts = res["departments"]
        self.assertTrue(len(depts) > 0)
        print("[PASS] Negotiator department allocations verified:", depts)

    def test_16_date_aware_schedule_lookup(self):
        """Verify prediction API contract accepts planningDate while using static daily timetable."""
        payload = {
            "corridorId": "COR-001",
            "blockStart": "10:00",
            "blockEnd": "14:00",
            "planningDate": "2026-09-12"
        }
        res = self.client.post("/api/predictions/traffic-impact", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        print("[PASS] Static timetable planningDate API contract verified:", data)

    def test_17_cross_midnight_window(self):
        """Regression test: verify cross-midnight block window 21:00 -> 00:30 (210 mins duration) correctly intersects departing trains."""
        payload = {
            "corridorId": "COR-001",
            "blockStart": "21:00",
            "blockEnd": "00:30",
            "maintenanceDuration": 210
        }
        res = self.client.post("/api/predictions/traffic-impact", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        impact = data["expectedImpact"]
        # COR-001 has TRN-0003 at 21:15 and TRN-0016 at 00:15
        self.assertGreaterEqual(impact["affectedTrains"], 2, "Cross-midnight window 21:00-00:30 should capture trains at 21:15 and 00:15")
        print("[PASS] Cross-midnight window regression test verified:", data)

if __name__ == "__main__":
    unittest.main()


