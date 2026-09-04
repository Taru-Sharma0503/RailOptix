"""
RailOptix — Synthetic Data Generator
=====================================
Generates a structurally realistic (correlated, not random-noise) dataset
for training/demoing the AI/ML prediction layer:
  - Maintenance Priority Score
  - Failure Risk
  - Traffic Impact

Outputs (CSV, written to ./output/):
  corridors.csv
  stations.csv
  assets.csv
  historical_failures.csv
  trains.csv
  train_schedules.csv
  maintenance_tasks.csv          <- main ML training table (features + labels)
  simulation_traffic_impact.csv  <- training table for traffic-impact model

Design principles:
  - Relationships are causally wired (older/worse-condition assets fail more,
    high-traffic corridors carry higher risk weight, overdue tasks push
    priority up) rather than independently random, so a trained model
    actually learns signal instead of memorizing noise.
  - Ground-truth failureRisk / priorityScore use a noisy latent function,
    NOT the exact Phase-1 weighted formula — so a Phase-2 ML model has
    real patterns to discover beyond hand-tuned weights.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

os.makedirs("output", exist_ok=True)
rng = np.random.default_rng(42)


# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
N_CORRIDORS = 10
N_STATIONS = 45
N_ASSETS = 800
N_TRAINS = 120
N_HIST_YEARS = 3
N_MAINT_TASKS = 1200

ASSET_TYPES = ["Track", "Signal", "OHE", "Bridge", "Station Equipment"]
ASSET_TYPE_BASE_CRITICALITY = {
    "Track": 7, "Signal": 8, "OHE": 6, "Bridge": 9, "Station Equipment": 4
}
DEPARTMENTS = {
    "Track": "Engineering", "Bridge": "Engineering",
    "Signal": "S&T", "Station Equipment": "S&T",
    "OHE": "Traction Distribution",
}
CONDITION_LEVELS = ["Good", "Fair", "Warning", "Critical"]
TODAY = datetime(2026, 9, 2)

# ---------------------------------------------------------------------------
# 1. CORRIDORS  (traffic_level drives downstream risk/impact)
# ---------------------------------------------------------------------------
corridor_names = [
    "Delhi-Ghaziabad", "Ghaziabad-Meerut", "Delhi-Mathura", "Kalyan-Pune",
    "Mumbai-Kalyan", "Howrah-Kharagpur", "Chennai-Arakkonam", "Pune-Lonavala",
    "Delhi-Panipat", "Meerut-Saharanpur",
]
corridors = pd.DataFrame({
    "corridorId": [f"COR-{i+1:03d}" for i in range(N_CORRIDORS)],
    "name": corridor_names[:N_CORRIDORS],
    "lengthKm": rng.integers(20, 140, N_CORRIDORS),
    # 0-100 baseline traffic intensity (feeds trainTraffic feature)
    "trafficLevel": rng.integers(35, 100, N_CORRIDORS),
})

# --- Real-data override: replace synthetic trafficLevel with REAL train
# counts computed from the IR timetable (see build_real_data.py), when
# available. Falls back to the synthetic value if the file is missing.
try:
    real_traffic = pd.read_csv("output/real_corridor_traffic.csv")
    name_to_real = dict(zip(real_traffic["corridorName"], real_traffic["trafficLevel"]))
    corridors["trafficLevel"] = corridors["name"].map(name_to_real).fillna(corridors["trafficLevel"]).astype(int)
    corridors["trafficSource"] = corridors["name"].map(lambda n: "real_IR_timetable" if n in name_to_real else "synthetic")
    print(f"Grounded {len(name_to_real)}/{N_CORRIDORS} corridors in real IR timetable data.")
except FileNotFoundError:
    corridors["trafficSource"] = "synthetic"

corridors.to_csv("output/corridors.csv", index=False)

# ---------------------------------------------------------------------------
# 2. STATIONS
# ---------------------------------------------------------------------------
stations = pd.DataFrame({
    "stationId": [f"ST-{i+1:03d}" for i in range(N_STATIONS)],
    "name": [f"Station {i+1}" for i in range(N_STATIONS)],
    "corridorId": rng.choice(corridors["corridorId"], N_STATIONS),
    "latitude": rng.uniform(19.0, 29.0, N_STATIONS).round(4),
    "longitude": rng.uniform(72.5, 88.5, N_STATIONS).round(4),
})
stations.to_csv("output/stations.csv", index=False)

# ---------------------------------------------------------------------------
# 3. ASSETS  (age + type + corridor traffic drive condition & criticality)
# ---------------------------------------------------------------------------
asset_type = rng.choice(ASSET_TYPES, N_ASSETS, p=[0.35, 0.25, 0.2, 0.1, 0.1])
corridor_id = rng.choice(corridors["corridorId"], N_ASSETS)
corridor_traffic = corridors.set_index("corridorId").loc[corridor_id, "trafficLevel"].values
age_years = rng.gamma(shape=2.2, scale=5.5, size=N_ASSETS).clip(0, 40).round(1)

# Latent degradation: older + higher traffic -> worse condition (with noise)
degradation_latent = (
    0.55 * (age_years / 40) +
    0.30 * (corridor_traffic / 100) +
    rng.normal(0, 0.12, N_ASSETS)
).clip(0, 1)

def condition_from_latent(x):
    if x < 0.35: return "Good"
    if x < 0.55: return "Fair"
    if x < 0.75: return "Warning"
    return "Critical"

condition = np.array([condition_from_latent(x) for x in degradation_latent])
base_criticality = np.array([ASSET_TYPE_BASE_CRITICALITY[t] for t in asset_type])
# criticality nudged by corridor traffic (busier corridor = higher stakes asset)
criticality = (base_criticality + (corridor_traffic / 100 * 2) + rng.normal(0, 0.6, N_ASSETS)).clip(1, 10).round(0).astype(int)

assets = pd.DataFrame({
    "assetId": [f"AST-{i+1:04d}" for i in range(N_ASSETS)],
    "name": [f"{t} Section {i+1}" for i, t in enumerate(asset_type)],
    "type": asset_type,
    "department": [DEPARTMENTS[t] for t in asset_type],
    "corridorId": corridor_id,
    "ageYears": age_years,
    "installDate": [(TODAY - timedelta(days=int(a*365))).date().isoformat() for a in age_years],
    "condition": condition,
    "criticality": criticality,
    "degradationLatent": degradation_latent.round(3),  # hidden "true" wear signal
    "latitude": rng.uniform(19.0, 29.0, N_ASSETS).round(4),
    "longitude": rng.uniform(72.5, 88.5, N_ASSETS).round(4),
})
assets.to_csv("output/assets.csv", index=False)

# ---------------------------------------------------------------------------
# 4. HISTORICAL FAILURES  (rate driven by degradation_latent)
# ---------------------------------------------------------------------------
# --- Real-data override: cause distribution + downtime informed by the
# delay_cause_profile.csv (built from ir_train-part-004.csv), instead of
# a uniform arbitrary list. Falls back to the generic list if unavailable.
try:
    cause_profile = pd.read_csv("output/delay_cause_profile.csv")
    CAUSE_NAMES = cause_profile["cause"].tolist()
    CAUSE_PROBS = (cause_profile["frequencyShare"] / cause_profile["frequencyShare"].sum()).tolist()
    CAUSE_MEAN_DOWNTIME = dict(zip(cause_profile["cause"], cause_profile["meanDelayMinutes"]))
    print(f"Grounded failure causes in delay_cause_profile.csv ({len(CAUSE_NAMES)} categories).")
except FileNotFoundError:
    CAUSE_NAMES = ["Wear", "Weather", "Overload", "Component fatigue", "External damage"]
    CAUSE_PROBS = [0.4, 0.15, 0.15, 0.2, 0.1]
    CAUSE_MEAN_DOWNTIME = {}

fail_rows = []
for _, a in assets.iterrows():
    # expected failures over N_HIST_YEARS scales with degradation
    expected_failures = a["degradationLatent"] * 4.5
    n_fail = rng.poisson(max(expected_failures, 0.05))
    for _ in range(n_fail):
        days_ago = rng.integers(0, N_HIST_YEARS * 365)
        cause = rng.choice(CAUSE_NAMES, p=CAUSE_PROBS)
        base_downtime = CAUSE_MEAN_DOWNTIME.get(cause, 60 + a["degradationLatent"] * 180)
        fail_rows.append({
            "failureId": f"FLR-{len(fail_rows)+1:05d}",
            "assetId": a["assetId"],
            "date": (TODAY - timedelta(days=int(days_ago))).date().isoformat(),
            "severity": int(np.clip(rng.normal(5 + a["degradationLatent"]*4, 1.5), 1, 10)),
            "downtimeMinutes": int(np.clip(rng.normal(base_downtime, 25), 15, 600)),
            "cause": cause,
        })
historical_failures = pd.DataFrame(fail_rows)
historical_failures.to_csv("output/historical_failures.csv", index=False)

failure_counts = historical_failures.groupby("assetId").size().rename("historicalFailures")
assets = assets.merge(failure_counts, on="assetId", how="left")
assets["historicalFailures"] = assets["historicalFailures"].fillna(0).astype(int)
assets.to_csv("output/assets.csv", index=False)  # rewrite with failure count joined

# ---------------------------------------------------------------------------
# 5. TRAINS  (per-corridor traffic realized as train counts)
# ---------------------------------------------------------------------------
train_types = rng.choice(["Express", "Passenger", "Freight"], N_TRAINS, p=[0.35, 0.35, 0.3])
train_corridor = rng.choice(corridors["corridorId"], N_TRAINS)
trains = pd.DataFrame({
    "trainId": [f"TRN-{i+1:04d}" for i in range(N_TRAINS)],
    "number": rng.integers(10000, 29999, N_TRAINS),
    "type": train_types,
    "corridorId": train_corridor,
    "departure": [f"{h:02d}:{m:02d}" for h, m in zip(rng.integers(0,24,N_TRAINS), rng.choice([0,15,30,45],N_TRAINS))],
    "avgDelayMinutes": rng.gamma(1.5, 6, N_TRAINS).round(1),
})
trains.to_csv("output/trains.csv", index=False)

sched_rows = []
for _, c in corridors.iterrows():
    daily_trains = int(c["trafficLevel"] / 100 * 60 + rng.integers(5, 15))
    for d in range(30):  # one month of schedule density snapshots
        sched_rows.append({
            "corridorId": c["corridorId"],
            "date": (TODAY - timedelta(days=d)).date().isoformat(),
            "trainsScheduled": max(daily_trains + int(rng.normal(0, 4)), 3),
        })
train_schedules = pd.DataFrame(sched_rows)
train_schedules.to_csv("output/train_schedules.csv", index=False)


# ---------------------------------------------------------------------------
# 6. MAINTENANCE TASKS  (main ML training table)
#    -> Phase-2 target: priorityScore, failureRisk, recommendedDeadline
# ---------------------------------------------------------------------------
task_assets = assets.sample(n=N_MAINT_TASKS, replace=True, random_state=7).reset_index(drop=True)

defect_severity = np.clip(rng.normal(4 + task_assets["degradationLatent"]*5, 1.6), 1, 10).round(1)
overdue_days = np.clip(rng.exponential(3 + task_assets["degradationLatent"]*10), 0, 45).round(0).astype(int)
train_traffic = corridors.set_index("corridorId").loc[task_assets["corridorId"], "trafficLevel"].values
safety_risk = np.clip(
    0.5*task_assets["criticality"] + 0.4*defect_severity/10*10 + rng.normal(0, 1.0, N_MAINT_TASKS), 1, 10
).round(1)
expected_degradation = np.clip(task_assets["degradationLatent"] + rng.normal(0, 0.05, N_MAINT_TASKS), 0, 1).round(3)

# ---- ground-truth latent risk (noisy, nonlinear -> real ML signal, not just formula) ----
risk_latent = (
    0.22 * (defect_severity / 10) +
    0.20 * (task_assets["criticality"].values / 10) +
    0.16 * np.tanh(overdue_days / 15) +
    0.14 * (train_traffic / 100) +
    0.16 * (safety_risk / 10) +
    0.12 * expected_degradation +
    rng.normal(0, 0.05, N_MAINT_TASKS)
).clip(0, 1)

failure_risk = risk_latent  # 0-1 probability-like score

# Decoupled priority score incorporating overdue urgency, defect severity, asset criticality, and safety risk
prio_latent = (
    0.35 * (overdue_days / 45.0) * 100 +
    0.25 * (defect_severity / 10.0) * 100 +
    0.20 * (task_assets["criticality"].values / 10.0) * 100 +
    0.20 * (safety_risk / 10.0) * 100 +
    rng.normal(0, 3.0, N_MAINT_TASKS)
)
priority_score = prio_latent.clip(0, 100).round(0).astype(int)


def deadline_from_priority(p):
    if p >= 85: days = rng.integers(1, 4)
    elif p >= 65: days = rng.integers(4, 10)
    elif p >= 40: days = rng.integers(10, 21)
    else: days = rng.integers(21, 45)
    return (TODAY + timedelta(days=int(days))).date().isoformat()

recommended_deadline = [deadline_from_priority(p) for p in priority_score]

def bucket_risk(r):
    if r >= 0.90: return "Critical"
    if r >= 0.75: return "High"
    if r >= 0.50: return "Medium"
    return "Low"
severity_bucket = pd.Series([bucket_risk(r) for r in failure_risk])

status = rng.choice(["pending","in_progress","completed","overdue"], N_MAINT_TASKS, p=[0.45,0.15,0.30,0.10])

maintenance_tasks = pd.DataFrame({
    "taskId": [f"MT-{i+1:05d}" for i in range(N_MAINT_TASKS)],
    "assetId": task_assets["assetId"].values,
    "assetType": task_assets["type"].values,
    "department": task_assets["department"].values,
    "corridorId": task_assets["corridorId"].values,
    # --- features (match the /api/predictions/maintenance-priority contract) ---
    "defectSeverity": defect_severity,
    "assetCriticality": task_assets["criticality"].values,
    "historicalFailures": task_assets["historicalFailures"].values,
    "overdueDays": overdue_days,
    "trainTraffic": train_traffic,
    "safetyRisk": safety_risk,
    "expectedDegradation": expected_degradation,
    "assetAgeYears": task_assets["ageYears"].values,
    # --- labels ---
    "priorityScore": priority_score,
    "failureRisk": failure_risk.round(3),
    "riskLevel": severity_bucket.astype(str),
    "recommendedDeadline": recommended_deadline,
    "status": status,
    "estimatedDurationMinutes": rng.choice([30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240], N_MAINT_TASKS),
})
maintenance_tasks.to_csv("output/maintenance_tasks.csv", index=False)

# ---------------------------------------------------------------------------
# 7. TRAFFIC IMPACT SIMULATION TABLE  (for /api/predictions/traffic-impact)
# ---------------------------------------------------------------------------
n_sim = 500
sim_corridor = rng.choice(corridors["corridorId"], n_sim)
sim_traffic = corridors.set_index("corridorId").loc[sim_corridor, "trafficLevel"].values
block_start_hour = rng.integers(0, 22, n_sim)
block_duration_hr = rng.integers(1, 8, n_sim)

# affected trains scale with traffic level * block duration, peak-hour multiplier
is_peak = np.isin(block_start_hour, [7,8,9,17,18,19]).astype(int)
affected_trains = np.clip(
    (sim_traffic/100 * block_duration_hr * 1.8) * (1 + 0.5*is_peak) + rng.normal(0,1.2,n_sim),
    0, None
).round().astype(int)
expected_delay = np.clip(
    affected_trains * rng.uniform(2.5, 6.0, n_sim) * (1 + 0.4*is_peak) + rng.normal(0,3,n_sim),
    0, None
).round(1)
critical_trains_affected = np.clip((affected_trains * 0.15 * (1+is_peak)).round().astype(int), 0, affected_trains)

traffic_impact = pd.DataFrame({
    "simId": [f"SIM-{i+1:04d}" for i in range(n_sim)],
    "corridorId": sim_corridor,
    "corridorTrafficLevel": sim_traffic,
    "blockStartHour": block_start_hour,
    "blockDurationHours": block_duration_hr,
    "isPeakHour": is_peak,
    "affectedTrains": affected_trains,
    "expectedDelayMinutes": expected_delay,
    "criticalTrainsAffected": critical_trains_affected,
    "alternativeRoutesAvailable": rng.integers(0, 4, n_sim),
})
traffic_impact.to_csv("output/simulation_traffic_impact.csv", index=False)

# ---------------------------------------------------------------------------
print("Generated:")
for name, df in [
    ("corridors", corridors), ("stations", stations), ("assets", assets),
    ("historical_failures", historical_failures), ("trains", trains),
    ("train_schedules", train_schedules), ("maintenance_tasks", maintenance_tasks),
    ("simulation_traffic_impact", traffic_impact),
]:
    print(f"  {name:28s} {len(df):>6d} rows")
