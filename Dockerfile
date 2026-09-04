FROM python:3.10-slim

WORKDIR /app

# Prevent bytecode generation and ensure unbuffered stdout/stderr logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Copy and install dependencies first (leverage Docker build cache)
COPY ai_engine/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Compatibility fix for SHAP 0.49.1 with XGBoost 3.2.0
RUN python -c "from pathlib import Path; p=Path('/usr/local/lib/python3.10/site-packages/shap/explainers/_tree.py'); s=p.read_text(); old='float(learner_model_param[\"base_score\"])'; new='float(str(learner_model_param[\"base_score\"]).strip(\"[]\").split(\",\")[0])'; assert s.count(old) == 2, f'Expected 2 occurrences, found {s.count(old)}'; p.write_text(s.replace(old,new))"

# Copy shared CSV datasets and AI engine microservice code
COPY csv/ /app/csv/
COPY ai_engine/ /app/ai_engine/

EXPOSE 8000

# Health check to monitor container readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Run Uvicorn server
CMD ["uvicorn", "ai_engine.app:app", "--host", "0.0.0.0", "--port", "8000"]
