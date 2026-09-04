"""
RailOptix — Real-Data Grounding Layer
========================================
Does NOT join the two uploaded files together (they're different grains
and joining them would just decorate synthetic delay records with real
route metadata, without making the delay labels any more real).

Instead, pulls out ONE real, defensible signal from each file separately:

  1. real_corridor_traffic.csv
     From Train_details_22122017.csv (REAL Indian Railways timetable,
     186K rows, 11,115 trains, 8,151 stations). For each of our 10
     synthetic corridors, counts the ACTUAL number of distinct trains
     whose route passes through both endpoint stations. This replaces
     the made-up 0-100 trafficLevel score in corridors.csv with a real,
     verifiable number.

  2. delay_cause_profile.csv
     From ir_train-part-004.csv (synthetic per-journey delay data —
     confirmed synthetic: is_delayed is a hard-thresholded restatement
     of delay_minutes with a clean 14/40-minute gap, which real-world
     delay data would never show). Even though the labels are
     synthetic, the CAUSE CATEGORIES themselves (Track Congestion,
     Flooding, Signal Failure, etc.) and their relative severity/
     frequency are a reasonable, internally-consistent basis for
     replacing our historical_failures.csv random cause assignment
     with something more textured than uniform random choice.
     This is clearly labeled as synthetic-derived, not real outcomes.
"""

import pandas as pd

TIMETABLE_PATH = "/mnt/user-data/uploads/Train_details_22122017.csv"
DELAY_PATH = "/mnt/user-data/uploads/ir_train-part-004.csv"
OUT_DIR = "output"

# ---------------------------------------------------------------------------
# 1. REAL corridor traffic from the timetable file
# ---------------------------------------------------------------------------
CORRIDOR_STATION_MAP = {
    "Delhi-Ghaziabad":    ("NDLS", "GZB"),
    "Ghaziabad-Meerut":   ("GZB",  "MTC"),
    "Delhi-Mathura":      ("NDLS", "MTJ"),
    "Kalyan-Pune":        ("KYN",  "PUNE"),
    "Mumbai-Kalyan":      ("CSMT", "KYN"),
    "Howrah-Kharagpur":   ("HWH",  "KGP"),
    "Chennai-Arakkonam":  ("MAS",  "AJJ"),
    "Pune-Lonavala":      ("PUNE", "LNL"),
    "Delhi-Panipat":      ("NDLS", "PNP"),
    "Meerut-Saharanpur":  ("MTC",  "SRE"),
}


def build_real_corridor_traffic():
    tt = pd.read_csv(TIMETABLE_PATH, low_memory=False)
    tt["SEQ"] = pd.to_numeric(tt["SEQ"], errors="coerce")
    tt = tt.dropna(subset=["SEQ"])

    rows = []
    for corridor_name, (a, b) in CORRIDOR_STATION_MAP.items():
        trains_a = set(tt[tt["Station Code"] == a]["Train No"])
        trains_b = set(tt[tt["Station Code"] == b]["Train No"])
        real_trains = len(trains_a & trains_b)
        rows.append({
            "corridorName": corridor_name,
            "stationA": a,
            "stationB": b,
            "realTrainsOnCorridor": real_trains,
        })

    df = pd.DataFrame(rows)

    # Normalize to the same 0-100 trafficLevel scale corridors.csv already
    # uses, so it's a drop-in replacement — min-max scaled, floor of 20
    # so no real corridor reads as "zero traffic" (every one of these has
    # dozens of trains in reality).
    lo, hi = df["realTrainsOnCorridor"].min(), df["realTrainsOnCorridor"].max()
    df["trafficLevel"] = (20 + (df["realTrainsOnCorridor"] - lo) / (hi - lo) * 80).round().astype(int)

    df.to_csv(f"{OUT_DIR}/real_corridor_traffic.csv", index=False)
    print("--- real_corridor_traffic.csv ---")
    print(df.to_string(index=False))
    print()
    return df


# ---------------------------------------------------------------------------
# 2. Delay-cause severity profile from the (synthetic-origin) delay file
# ---------------------------------------------------------------------------
def build_delay_cause_profile():
    delay = pd.read_csv(DELAY_PATH)

    profile = (
        delay.groupby("primary_delay_cause")
        .agg(
            occurrences=("delay_minutes", "count"),
            meanDelayMinutes=("delay_minutes", "mean"),
            medianDelayMinutes=("delay_minutes", "median"),
            monsoonShare=("is_monsoon_season", "mean"),
            festivalShare=("is_festival_season", "mean"),
        )
        .reset_index()
        .rename(columns={"primary_delay_cause": "cause"})
    )
    profile = profile[profile["cause"] != "On Time"].copy()
    profile["meanDelayMinutes"] = profile["meanDelayMinutes"].round(1)
    profile["medianDelayMinutes"] = profile["medianDelayMinutes"].round(1)
    profile["monsoonShare"] = profile["monsoonShare"].round(3)
    profile["festivalShare"] = profile["festivalShare"].round(3)
    profile["frequencyShare"] = (profile["occurrences"] / profile["occurrences"].sum()).round(4)
    profile = profile.sort_values("occurrences", ascending=False).reset_index(drop=True)

    profile.to_csv(f"{OUT_DIR}/delay_cause_profile.csv", index=False)
    print("--- delay_cause_profile.csv ---")
    print(profile.to_string(index=False))
    print()
    return profile


if __name__ == "__main__":
    build_real_corridor_traffic()
    build_delay_cause_profile()
