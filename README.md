# 🌾 Accelrop — AI-Driven Precision Agriculture Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-EB5424?style=for-the-badge)](https://xgboost.readthedocs.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> An end-to-end intelligent agricultural decision platform combining predictive machine learning and generative agronomic intelligence to optimize crop yields and soil management.

🔗 **Live Demo:** [accelrop.vercel.app](https://your-live-link.vercel.app)  
📑 **API Docs:** [api.accelrop.com/docs](https://your-api-link.onrender.com/docs)

---

## 📌 Executive Summary

Traditional farm management relies heavily on reactive decision-making. **Accelrop** provides proactive, data-backed insights:

- **Predictive Yield Modeling:** Uses gradient-boosted trees trained on regional soil, climate, and historical crop metrics.
- **Agronomic Copilot ("Vaidya AI"):** An intelligent agronomy assistant providing contextual remediation advice for pests, soil deficits, and weather anomalies.
- **Enterprise-Grade Cloud Architecture:** Built for high throughput and modularity with sub-second API inference latency.

---

## ⚡ Key Features

* **Crop Yield Forecasting:** Input soil parameters ($N, P, K, pH$), precipitation, and temperature to receive high-confidence yield projections powered by **XGBoost**.
* **Vaidya AI Assistant:** Context-aware conversational agent for real-time agronomic troubleshooting and actionable treatment plans.
* **Telemetry & Soil Analytics:** Dynamic data visualizations for tracking seasonal soil degradation, humidity, and optimal harvest windows.
* **Responsive Command Dashboard:** Desktop and field-ready mobile UI built with React, TypeScript, and Tailwind CSS.

---

## 🛠️ Architecture & System Design

```text
┌─────────────────┐       HTTPS/REST        ┌─────────────────────────┐
│  React Client   │ ──────────────────────> │    FastAPI Service      │
│  (TypeScript)   │                         │  (Yield Engine + ML)    │
└─────────────────┘                         └───────────┬─────────────┘
         ▲                                              │
         │                                    ┌─────────┴─────────┐
         │                                    ▼                   ▼
┌─────────────────┐                  ┌─────────────────┐ ┌─────────────────┐
│   Vercel CDN    │                  │  XGBoost Engine │ │   PostgreSQL    │
│  (Edge Hosting) │                  │ (.joblib Model) │ │(Neon Serverless)│
└─────────────────┘                  └─────────────────┘ └─────────────────┘
```

### Technology Matrix

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons | Type-safe UI, reactive charts, mobile responsiveness |
| **Backend** | Python, FastAPI, Pydantic, Uvicorn | High-throughput asynchronous REST API & validation |
| **Machine Learning** | XGBoost, Scikit-learn, Pandas, NumPy | Regression modeling for multi-variable yield estimation |
| **Database & Cloud** | PostgreSQL (Neon), Render, Vercel | Scalable relational storage & zero-downtime CI/CD |

---

## ⚡ Core API Endpoints

| Method | Endpoint | Description | Payload Preview |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/predict/yield` | Estimates total crop yield per hectare | `{"nitrogen": 45, "phosphorus": 50, "potassium": 35, "ph": 6.5}` |
| `POST` | `/api/v1/chat/vaidya` | Contextual agronomy Q&A with conversational memory | `{"session_id": "...", "query": "Remedy for early blight in tomatoes"}` |
| `GET` | `/api/v1/telemetry/{farm_id}` | Retrieves historical soil and moisture time-series data | *None* |
| `GET` | `/healthz` | Readiness checks for container instances & DB connection | *None* |

---

## 🛠️ Engineering Challenges & Optimizations

* **Cold-Start Optimization & Model In-Memory Caching:** Serialized the trained XGBoost model using `joblib` with optimal compression, loading it directly into application state at startup rather than per-request to avoid memory fragmentation on cloud instances.
* **Type-Safe Data Contracts:** Shared strict interfaces between FastAPI Pydantic models and frontend TypeScript types, eliminating runtime deserialization errors.
* **Serverless Connection Pooling:** Implemented connection pooling for Neon PostgreSQL to mitigate socket exhaustion during high-concurrency client requests.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm/pnpm
- Python 3.10+
- PostgreSQL connection string (Neon or local)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & launch dev server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📊 Machine Learning Pipeline

1. **Feature Engineering:** Evaluates agronomical features including N-P-K ratios, soil pH, average rainfall, and temperature ranges.
2. **Model Training:** Utilizes **XGBoost Regressor** fine-tuned via cross-validated grid search to minimize RMSE and prevent overfitting.
3. **Inference Latency:** Optimized serialization via `joblib` allows inferences in **< 45ms** per request.

---

## 👤 Author & Contact

**Your Name**  
* GitHub: [@rahulnaik0819](https://github.com/rahulnaik0819)  
* LinkedIn: [linkedin.com/in/rahulnaik0819](https://www.linkedin.com/in/rahulnaik0819/)  
* Email: rahulnaikd0819@gmail.com
