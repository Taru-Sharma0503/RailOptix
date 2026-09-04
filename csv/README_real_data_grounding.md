# What changed from v1

Two of your uploaded files were used to ground parts of the synthetic
dataset in real numbers — NOT joined together, since they're different
grains of data (see chat for why).

## 1. `real_corridor_traffic.csv` (NEW)
Built from `Train_details_22122017.csv` — a REAL Indian Railways
timetable (186,124 rows, 11,115 trains, 8,151 real station codes).
For each of your 10 corridors, counts the actual number of distinct
trains whose route passes through both endpoint stations.

This REPLACES the arbitrary `trafficLevel` (previously `rng.integers(35,100)`)
in `corridors.csv` with a real, defensible number, min-max scaled to
the same 0-100 range. `corridors.csv` now has a `trafficSource` column
so you can show judges exactly which numbers are grounded in real data.

## 2. `delay_cause_profile.csv` (NEW)
Built from `ir_train-part-004.csv`. This file is confirmed SYNTHETIC
(is_delayed is a hard-thresholded restatement of delay_minutes — real
data doesn't have a clean gap between 14 and 40 minutes with zero rows
between). But the 14 cause categories and their relative frequency/
severity are internally consistent and more textured than a uniform
random list, so `historical_failures.csv`'s `cause` and
`downtimeMinutes` columns are now drawn from this profile instead of
5 made-up causes with flat probabilities.

Caveat found and worth knowing: "Flooding/Waterlogging" and "Track
Maintenance/PSR" show monsoonShare = 1.000 exactly in the source file
— i.e. those causes ONLY ever occur in monsoon season in that dataset.
That's a synthetic-generation artifact, not something to present as a
verified real-world fact.

## What did NOT change
- `maintenance_tasks.csv` labels (priorityScore, failureRisk) are still
  simulated — no real dataset exists anywhere for maintenance-task
  priority/risk, so this remains honestly synthetic.
- `simulation_traffic_impact.csv` is still fully synthetic — no real
  data exists for "what happens if we close this corridor for N hours."

## Row-count guidance if you use the full delay dataset later
Don't train on all ~200K rows across all `ir_train-part-*.csv` files.
Drop `is_delayed` (leaks from `delay_minutes`). Stratify-sample ~30-40K
rows across zone × season × primary_delay_cause for iteration; do one
full-dataset run only for a final model right before demo day.
