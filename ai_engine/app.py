from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from ai_engine.prediction_service import prediction_service
from ai_engine.optimizer import optimizer
from ai_engine.explainable_ai import explainable_ai
from ai_engine.conflict_negotiator import conflict_negotiator
from ai_engine.simulation_twin import simulation_twin

app = FastAPI(
    title="RailOptix AI & Optimization Engine Microservice",
    description="AI Engine providing predictive maintenance ML models, OR-Tools CP-SAT constraint solver, Explainable AI, Conflict Negotiator, and Digital Twin What-If Simulator.",
    version="2.0.0"
)

# Enable CORS for React UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "RailOptix AI Engine",
        "version": "2.0.0",
        "endpoints": [
            "/api/predictions/maintenance-priority",
            "/api/predictions/failure-risk",
            "/api/predictions/traffic-impact",
            "/api/optimize",
            "/api/optimize/{runId}/result",
            "/api/optimize/{runId}/explanation",
            "/api/conflicts/negotiate",
            "/api/simulation"
        ]
    }

# Pydantic Request Validation Models
class TrafficImpactPayload(BaseModel):
    corridorId: Optional[str] = "COR-001"
    blockStart: Optional[str] = "10:00"
    blockEnd: Optional[str] = "14:00"
    maintenanceDuration: Optional[float] = 240.0
    planningDate: Optional[str] = "2026-09-12"

class OptimizationPayload(BaseModel):
    corridorId: Optional[str] = "COR-001"
    planningDate: Optional[str] = "2026-09-12"
    maintenanceTaskIds: Optional[List[str]] = None
    blockIds: Optional[List[str]] = None
    objective: Optional[Dict[str, float]] = None

class ConflictNegotiatePayload(BaseModel):
    conflictId: Optional[str] = "CON-001"
    corridorId: Optional[str] = "COR-001"
    departments: Optional[List[str]] = ["Engineering", "S&T"]

class SimulationPayload(BaseModel):
    corridorId: Optional[str] = "COR-001"
    block: Optional[Dict[str, str]] = {"start": "10:00", "end": "14:00"}
    maintenanceTaskIds: Optional[List[str]] = None

# -----------------------------------------------------------------------------
# 1. PREDICTION ENDPOINTS (Section 34, 66-68)
# -----------------------------------------------------------------------------

@app.post("/api/predictions/maintenance-priority")
def predict_maintenance_priority(payload: Dict[str, Any]):
    try:
        return prediction_service.predict_maintenance_priority(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.post("/api/predictions/failure-risk")
def predict_failure_risk(payload: Dict[str, Any]):
    try:
        return prediction_service.predict_failure_risk(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.post("/api/predictions/traffic-impact")
def predict_traffic_impact(payload: TrafficImpactPayload):
    try:
        return prediction_service.predict_traffic_impact(payload.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

# -----------------------------------------------------------------------------
# 2. OPTIMIZATION ENDPOINTS (Section 37, 74-77)
# -----------------------------------------------------------------------------

# Cache for optimization runs
optimization_runs_cache = {}

@app.post("/api/optimize")
def start_optimization(payload: OptimizationPayload):
    try:
        req_data = payload.model_dump()
        # Validate weights if provided
        if payload.objective:
            for k, v in payload.objective.items():
                if v < 0:
                    raise ValueError(f"Objective weight for '{k}' cannot be negative: {v}")
        res = optimizer.run_optimization(req_data)
        if not res.get("success", True):
            raise HTTPException(status_code=400, detail=res.get("message", "Optimization infeasible or invalid"))
        optimization_runs_cache[res["runId"]] = res
        return {
            "success": True,
            "runId": res["runId"],
            "status": res.get("status", "completed"),
            "message": "Optimization job finished via OR-Tools CP-SAT solver"
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.get("/api/optimize/{run_id}")
def get_optimization_status(run_id: str):
    if run_id not in optimization_runs_cache:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    return {
        "success": True,
        "runId": run_id,
        "status": "completed",
        "progress": 100,
        "message": "Optimization completed"
    }

@app.get("/api/optimize/{run_id}/result")
def get_optimization_result(run_id: str):
    if run_id not in optimization_runs_cache:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    return optimization_runs_cache[run_id]

@app.get("/api/optimize/{run_id}/explanation")
def get_optimization_explanation(run_id: str):
    # Pass optimisation context so XAI can compute per-run contributions
    if run_id not in optimization_runs_cache:
        raise HTTPException(status_code=404, detail="Optimization run not found")
    run_data = optimization_runs_cache[run_id]
    schedule = run_data.get("schedule", [])

    # Enrich schedule entries with task features from maintenance_tasks.csv
    task_features = []
    if schedule:
        import os as _os, pandas as _pd
        csv_candidates = [
            _os.path.join(_os.path.dirname(__file__), "csv", "maintenance_tasks.csv"),
            _os.path.join(_os.path.dirname(__file__), "..", "csv", "maintenance_tasks.csv"),
            _os.path.join("csv", "maintenance_tasks.csv"),
        ]
        csv_path = next((p for p in csv_candidates if _os.path.exists(p)), None)
        if csv_path:
            try:
                df = _pd.read_csv(csv_path)
                task_id_list = [s["maintenanceTaskId"] for s in schedule]
                matched = df[df["taskId"].isin(task_id_list)]
                task_features = matched.to_dict("records")
            except Exception:
                pass

    return explainable_ai.get_explanation(run_id, schedule=task_features)

# -----------------------------------------------------------------------------
# 3. CONFLICT & NEGOTIATOR ENDPOINTS (Section 40, 78-80)
# -----------------------------------------------------------------------------

@app.post("/api/conflicts/negotiate")
def negotiate_conflict(payload: ConflictNegotiatePayload):
    try:
        req_data = payload.model_dump()
        conflict_id = payload.conflictId or "CON-001"
        return conflict_negotiator.negotiate_conflict(conflict_id, req_data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.post("/api/conflicts/resolve")
def resolve_conflict(payload: Dict[str, Any]):
    conflict_id = payload.get("conflictId", "CON-001")
    return {
        "success": True,
        "message": "Conflict resolved successfully",
        "conflictId": conflict_id,
        "status": "resolved"
    }

# -----------------------------------------------------------------------------
# 4. SIMULATION ENDPOINTS (Section 39, 81-84)
# -----------------------------------------------------------------------------

simulations_cache = {}

@app.post("/api/simulation")
def create_simulation(payload: SimulationPayload):
    try:
        res = simulation_twin.run_simulation(payload.model_dump())
        simulations_cache[res["scenarioId"]] = res
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.get("/api/simulation/{id}")
def get_simulation_status(id: str):
    if id not in simulations_cache:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {
        "success": True,
        "scenario": {
            "id": id,
            "status": "completed",
            "corridorId": simulations_cache[id]["corridorId"],
            "block": simulations_cache[id]["block"]
        }
    }

@app.get("/api/simulation/{id}/results")
def get_simulation_results(id: str):
    if id not in simulations_cache:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {
        "success": True,
        "results": simulations_cache[id]["results"],
        "alternativeBlocks": simulations_cache[id]["alternativeBlocks"],
        "recommendation": simulations_cache[id]["recommendation"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
