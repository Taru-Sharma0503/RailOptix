import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def get_csv_path(filename):
    candidates = [
        os.path.join(os.path.dirname(__file__), "csv", filename),
        os.path.join(os.path.dirname(__file__), "..", "csv", filename),
        os.path.join("csv", filename),
        os.path.join("ai_engine", "csv", filename),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return os.path.join("csv", filename)

def train_maintenance_priority_model():
    print("\n--- Training Model 1: Maintenance Priority Score & Failure Risk (XGBoost) ---")
    df = pd.read_csv(get_csv_path("maintenance_tasks.csv"))
    
    # Feature columns per PDF Section 34 & 47
    feature_cols = [
        "defectSeverity",
        "assetCriticality",
        "historicalFailures",
        "overdueDays",
        "trainTraffic",
        "safetyRisk",
        "expectedDegradation",
        "assetAgeYears",
    ]
    
    X = df[feature_cols]
    y_priority = df["priorityScore"]
    y_risk = df["failureRisk"]
    
    # Train Priority Score Model
    X_train, X_test, y_p_train, y_p_test = train_test_split(X, y_priority, test_size=0.2, random_state=42)
    p_model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    p_model.fit(X_train, y_p_train)
    p_pred = p_model.predict(X_test)
    p_r2 = r2_score(y_p_test, p_pred)
    p_mae = mean_absolute_error(y_p_test, p_pred)
    print(f"Priority Model Performance (XGBoost): R2 = {p_r2:.4f}, MAE = {p_mae:.4f}")
    
    # Train Failure Risk Model
    X_train, X_test, y_r_train, y_r_test = train_test_split(X, y_risk, test_size=0.2, random_state=42)
    r_model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    r_model.fit(X_train, y_r_train)
    r_pred = r_model.predict(X_test)
    r_r2 = r2_score(y_r_test, r_pred)
    r_mae = mean_absolute_error(y_r_test, r_pred)
    print(f"Failure Risk Model Performance (XGBoost): R2 = {r_r2:.4f}, MAE = {r_mae:.4f}")
    
    # Save models
    joblib.dump(p_model, os.path.join(MODELS_DIR, "priority_score_model.joblib"))
    joblib.dump(r_model, os.path.join(MODELS_DIR, "failure_risk_model.joblib"))
    print("Saved priority_score_model.joblib and failure_risk_model.joblib")


def train_traffic_impact_model():
    print("\n--- Training Model 2: Traffic Impact Predictor (XGBoost) ---")
    df = pd.read_csv(get_csv_path("simulation_traffic_impact.csv"))
    
    feature_cols = [
        "corridorTrafficLevel",
        "blockDurationHours",
        "isPeakHour",
        "alternativeRoutesAvailable",
    ]
    
    X = df[feature_cols]
    y_delay = df["expectedDelayMinutes"]
    y_affected = df["affectedTrains"]
    y_critical = df["criticalTrainsAffected"]
    
    # Train Delay Predictor
    X_train, X_test, y_d_train, y_d_test = train_test_split(X, y_delay, test_size=0.2, random_state=42)
    delay_model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    delay_model.fit(X_train, y_d_train)
    d_pred = delay_model.predict(X_test)
    print(f"Traffic Delay Model R2: {r2_score(y_d_test, d_pred):.4f}, MAE: {mean_absolute_error(y_d_test, d_pred):.4f} mins")
    
    # Train Affected Trains Predictor
    X_train_a, X_test_a, y_a_train, y_a_test = train_test_split(X, y_affected, test_size=0.2, random_state=42)
    affected_model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    affected_model.fit(X_train_a, y_a_train)
    a_pred = affected_model.predict(X_test_a)
    print(f"Affected Trains Model R2: {r2_score(y_a_test, a_pred):.4f}, MAE: {mean_absolute_error(y_a_test, a_pred):.4f}")
    
    # Train Critical Trains Predictor
    X_train_c, X_test_c, y_c_train, y_c_test = train_test_split(X, y_critical, test_size=0.2, random_state=42)
    critical_model = XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42)
    critical_model.fit(X_train_c, y_c_train)
    c_pred = critical_model.predict(X_test_c)
    print(f"Critical Trains Model R2: {r2_score(y_c_test, c_pred):.4f}, MAE: {mean_absolute_error(y_c_test, c_pred):.4f}")
    
    # Save models
    joblib.dump(delay_model, os.path.join(MODELS_DIR, "traffic_delay_model.joblib"))
    joblib.dump(affected_model, os.path.join(MODELS_DIR, "traffic_affected_trains_model.joblib"))
    joblib.dump(critical_model, os.path.join(MODELS_DIR, "traffic_critical_trains_model.joblib"))
    print("Saved traffic impact prediction models")

if __name__ == "__main__":
    train_maintenance_priority_model()
    train_traffic_impact_model()

