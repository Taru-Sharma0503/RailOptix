# 🚆 RailOptix

### AI-Powered Railway Maintenance Digital Twin & Block Optimization Platform

> **Predict maintenance priorities. Resolve departmental conflicts. Generate optimal railway maintenance blocks. Simulate the impact before execution.**

RailOptix is an AI-powered railway maintenance decision-support platform that combines a **Railway Digital Twin, AI-based maintenance prioritization, constraint optimization, conflict resolution, and what-if simulation** to generate maintenance plans that maximize infrastructure availability while minimizing disruption to train operations.

---

## 🎯 Problem Statement

Railway maintenance activities are typically requested independently by different departments:

* 🛤️ Engineering — Track maintenance
* 🚦 S&T — Signal & Telecommunication maintenance
* ⚡ Traction — OHE maintenance

When these requests overlap, manual coordination can lead to:

```text
Independent Maintenance Requests
              ↓
       Manual Coordination
              ↓
     Scheduling Conflicts
              ↓
    Unused Block Windows
              ↓
       Asset Downtime
              ↓
     Train Disruptions
```

RailOptix addresses this problem by bringing maintenance activities, railway assets, train schedules, block availability, and operational constraints into a **single intelligent decision-support system**.

---

## 💡 Our Solution

RailOptix creates a unified **Railway Digital Twin** and uses AI + constraint optimization to determine:

> **What maintenance should be performed, where, and when — while causing the least possible operational disruption?**

The system:

1. Ingests railway assets and maintenance tasks.
2. Calculates maintenance priority and failure risk.
3. Loads train schedules and available block windows.
4. Detects conflicts between maintenance requests.
5. Generates optimized maintenance schedules.
6. Simulates the proposed plan.
7. Compares alternative scenarios.
8. Explains why the recommended schedule is optimal.
9. Allows railway operators to approve or modify the plan.

---

# 🚀 Core Innovation

RailOptix is **not simply an AI schedule generator**.

Our core innovation is:

### **AI + Railway Digital Twin + Constraint Optimization + What-If Simulation**

The platform can answer questions such as:

> **"What happens if I move this maintenance block by 45 minutes?"**

The system can immediately calculate:

* 🚆 Affected trains
* 🛤️ Affected assets
* ⏱️ Expected delays
* 🔄 Alternative block windows
* 🔧 Maintenance completion
* 📊 Infrastructure availability
* 💰 Operational cost
* ⚠️ Risk

This transforms RailOptix from a scheduling dashboard into a **railway maintenance decision-support system**.

---

# 🔥 Key Features

## Must Have

* 📊 Unified maintenance dashboard
* 🛤️ Railway asset registry
* 🔧 Maintenance task ingestion
* 🚆 Train timetable management
* 🚧 Block availability management
* 🤖 AI maintenance priority prediction
* ⚙️ Constraint-based maintenance scheduling
* ⚠️ Conflict detection
* 📅 Weekly maintenance planning
* 🗓️ Monthly maintenance planning
* 🧪 What-if simulation
* 📈 KPI dashboard

## Should Have

* Department-wise maintenance coordination
* Historical maintenance analytics
* Failure-risk prediction
* Alternative schedule generation
* Explainable optimization
* Role-based access control
* Exportable maintenance plans
* REST API layer

---

# 🤯 WOW Features

## 1. What-If Digital Twin

An operator can modify a maintenance block and immediately observe the impact on the railway network.

### Example

**Current Plan**

```text
Maintenance Block
09:00 ───────────── 13:00

Affected Trains: 4
Affected Assets: 2
```

Operator changes the block:

```text
11:30 ───────────── 15:30
```

RailOptix recalculates the scenario:

```text
Affected Trains: 0
Maintenance Activities Merged: 2
Asset Downtime: ↓
Infrastructure Availability: ↑
Operational Disruption: ↓
```

The operator can then compare both scenarios before making a decision.

---

## 2. 🤝 AI Maintenance Negotiator

Multiple departments may request overlapping maintenance windows.

For example:

```text
Engineering → 3 hours
S&T         → 2 hours
Traction    → 2 hours
```

Instead of simply rejecting one request, RailOptix attempts to find a **combined maintenance window**.

Example:

```text
Engineering ───────┐
S&T         ───────┼──→ Combined Block
Traction    ───────┘

Original Total: 7 hours
Optimized Block: 3.5 hours
```

This improves infrastructure utilization while reducing operational disruption.

---

## 3. 🧠 Explainable Optimization

RailOptix does not simply return:

> "Schedule generated."

Instead, it explains **why** the schedule was selected.

### Positive Factors

* Asset criticality
* Train traffic
* Safety constraints
* Historical failure probability

### Negative Factors

* Passenger disruption
* Train delays
* Block wastage
* Scheduling conflicts

This allows railway operators to understand and trust the recommendation.

---

# 🤖 AI / ML Engine

RailOptix uses AI for three major tasks.

## A. Maintenance Priority Prediction

The system predicts which maintenance activity should be prioritized.

### Inputs

* Defect severity
* Asset criticality
* Historical failures
* Overdue duration
* Train traffic
* Safety risk
* Expected degradation

### Outputs

```text
Priority Score
Failure Risk
Recommended Deadline
```

---

## B. Train & Traffic Impact Prediction

The system estimates the operational impact of blocking a particular corridor.

### Inputs

* Train timetable
* Train density
* Train type
* Historical delays
* Alternative routes
* Maintenance duration

### Outputs

```text
Expected Operational Impact
Expected Delay
Affected Trains
```

---

## C. Constraint Optimization

The optimization engine is the core scheduling brain of RailOptix.

Instead of asking an LLM to generate a schedule, RailOptix uses **constraint-based optimization**.

Potential technologies:

* Google OR-Tools
* CP-SAT
* MILP / Constraint Programming

### Objective

```text
MAXIMIZE
    Infrastructure Availability

MINIMIZE
    Maintenance Downtime
    Train Disruption
    Scheduling Conflicts
    Idle Block Time
    Safety Risk
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │                      │
                    │ Dashboard             │
                    │ Railway Map           │
                    │ Gantt Scheduler       │
                    │ What-If Simulation    │
                    │ KPI Dashboard         │
                    └──────────┬───────────┘
                               │
                         REST / WebSocket
                               │
                    ┌──────────▼───────────┐
                    │   Node.js + Express  │
                    │      Backend API     │
                    └──────────┬───────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
      PostgreSQL          AI Service       Optimization
       + PostGIS          / Prediction        Engine
            │                  │                  │
            │                  ▼                  ▼
            │             ML Models          OR-Tools
            │
            ▼
    Railway Digital Twin
            │
            ▼
      Simulation Engine
```

---

# 🛠️ Technology Stack

## Frontend

* React
* JavaScript
* GIS-style railway visualization
* Gantt charts
* Interactive scheduling timeline
* KPI dashboards

## Backend

* Node.js
* Express.js
* REST APIs
* WebSocket / Socket.IO where required

## Database

* PostgreSQL
* PostGIS

PostGIS enables spatial modelling of railway infrastructure such as:

* Stations
* Corridors
* Railway assets
* Track sections
* Geographic relationships

## AI / ML

* Python
* scikit-learn
* XGBoost / LightGBM
* PyTorch where justified
* Time-series models where required

> Deep learning will only be used when the available data justifies it.

## Optimization

* Google OR-Tools
* CP-SAT
* Constraint Programming
* MILP where appropriate

## Infrastructure

* Docker
* PostgreSQL
* Redis for optimization jobs
* Cloud deployment
* WebSockets for real-time simulation

---

# 🧩 Major System Components

### 1. Railway Digital Twin

Maintains a unified representation of:

```text
Assets
Stations
Corridors
Tracks
Maintenance Tasks
Train Schedules
Blocks
Historical Failures
```

---

### 2. Maintenance Priority Engine

Determines:

```text
Which asset?
       ↓
How urgent?
       ↓
What is the failure risk?
       ↓
When should it be maintained?
```

---

### 3. Conflict Detection Engine

Identifies conflicts between:

* Maintenance activities
* Railway corridors
* Train movements
* Department availability
* Safety constraints
* Block windows

---

### 4. Optimization Engine

Generates feasible maintenance schedules while satisfying railway constraints.

---

### 5. Simulation Engine

Simulates proposed maintenance plans and calculates:

* Train delays
* Infrastructure availability
* Conflicts
* Block utilization
* Operational risk

---

### 6. Explainability Engine

Provides the reasoning behind an optimization result.

Example:

```text
Recommended Block: 14:30 – 18:30

Why?

+ High asset criticality
+ Lower train density
+ Compatible department availability
+ Lower historical failure risk
- Minimal passenger disruption
```

---

# 🔄 User Workflow

```text
Railway Operator
       ↓
Login
       ↓
Select Railway Zone / Corridor
       ↓
Load Assets + Maintenance Tasks
       ↓
AI Calculates Maintenance Priority
       ↓
Load Train Timetable
       ↓
Load Available Block Windows
       ↓
Detect Conflicts
       ↓
Optimization Engine
       ↓
Generate Candidate Schedules
       ↓
Simulate Candidates
       ↓
Compare Results
       ↓
Select Best Plan
       ↓
View:
 ├── Optimal Block Plan
 ├── Conflicts
 ├── Expected Disruption
 ├── Asset Availability
 └── Optimization Explanation
       ↓
Approve / Modify
       ↓
Final Maintenance Plan
```

---

# 🗄️ Data Model

Core entities include:

```text
Users
Departments
Assets
MaintenanceTasks
TrainSchedules
Blocks
Corridors
Stations
HistoricalFailures
OptimizationRuns
SimulationScenarios
```

### Relationship Overview

```text
Department
    │
    └── MaintenanceTask
             │
             ├── Asset
             ├── Block
             └── Corridor

TrainSchedule
      │
      └── Corridor

OptimizationRun
      │
      ├── MaintenanceTasks
      ├── Blocks
      └── SimulationScenario
```

---

# 🔌 Backend API

The backend is organized around the major railway operations.

```text
/api/auth
/api/assets
/api/maintenance
/api/trains
/api/blocks
/api/optimize
/api/simulation
/api/predictions
```

### Example

```http
POST /api/optimize
```

Receives:

```json
{
  "corridorId": "COR-001",
  "maintenanceTasks": [],
  "availableBlocks": [],
  "trainSchedule": []
}
```

Returns an optimized maintenance plan containing:

```json
{
  "schedule": [],
  "conflicts": [],
  "affectedTrains": [],
  "assetAvailability": 0,
  "operationalImpact": {},
  "explanation": {}
}
```

---

# 📊 Key Performance Indicators

RailOptix evaluates generated plans using measurable KPIs.

### Infrastructure

* Asset availability
* Asset downtime
* Maintenance completion rate

### Operations

* Number of affected trains
* Expected delay
* Total disruption
* Block utilization

### Scheduling

* Number of conflicts
* Idle block time
* Maintenance activities combined

### Risk

* Asset failure risk
* Safety risk
* Overdue maintenance

---

# 🧪 Example Optimization Scenario

### Input

```text
Engineering:
Track maintenance
Duration: 3 hours

S&T:
Signal maintenance
Duration: 2 hours

Traction:
OHE maintenance
Duration: 2 hours
```

Train traffic is high between:

```text
09:00 – 12:00
```

and lower between:

```text
14:30 – 18:30
```

### Naive Scheduling

```text
09:00 – 12:00
```

Result:

```text
4 trains affected
2 assets unavailable
High operational disruption
```

### RailOptix Recommendation

```text
14:30 – 18:30
```

Result:

```text
0 critical trains affected
Multiple maintenance activities combined
Reduced asset downtime
Higher infrastructure availability
Lower operational disruption
```

---

# 📁 Planned Repository Structure

```text
RailOptix/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
├── ai-service/
│   ├── models/
│   ├── predictions/
│   ├── optimization/
│   ├── simulation/
│   └── requirements.txt
│
├── shared-types/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python
* PostgreSQL
* Docker *(recommended)*

---

## Clone Repository

```bash
git clone https://github.com/<your-username>/RailOptix.git

cd RailOptix
```

---

## Backend Setup

```bash
cd server

npm install

npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

## AI Service Setup

```bash
cd ai-service

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create `.env` files based on `.env.example`.

Example:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=

AI_SERVICE_URL=
REDIS_URL=
```

Never commit real credentials or API keys to the repository.

---

# 🐳 Docker

The project is designed to support containerized deployment.

```bash
docker compose up --build
```

This can be used to run the core services together during development and deployment.

---

# 🏆 Why RailOptix?

Traditional railway maintenance planning often requires coordination between multiple departments and operational constraints.

RailOptix brings these considerations into a **single intelligent platform**.

Instead of:

```text
Request → Manual Coordination → Schedule
```

RailOptix provides:

```text
Railway Data
     ↓
Digital Twin
     ↓
AI Risk & Priority
     ↓
Constraint Optimization
     ↓
Conflict Resolution
     ↓
Simulation
     ↓
Explainable Optimal Plan
```

The result is a system designed to help railway operators make **faster, safer, data-driven maintenance decisions** while maximizing infrastructure availability and minimizing operational disruption.

---

# 🌟 Project Vision

RailOptix aims to evolve into a comprehensive railway maintenance intelligence platform capable of supporting:

* Predictive maintenance
* Automated block planning
* Cross-department coordination
* Railway network simulation
* Operational risk analysis
* Infrastructure digital twins
* Explainable AI-assisted decision making

> **RailOptix — Optimize the maintenance. Minimize the disruption. Keep the railway moving. 🚆**
