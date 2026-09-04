import os
import joblib
import numpy as np
import pandas as pd

try:
    import shap
    HAS_SHAP = True
except ImportError:
    shap = None
    HAS_SHAP = False


def _patch_shap_xgb3_base_score():
    """Monkey-patch SHAP 0.49.x to handle XGBoost 3.x vector-style base_score.

    XGBoost >= 3.0 serializes base_score as a vector string (e.g. '[5.3953125E1]')
    in the UBJ model dump. SHAP 0.49.1's XGBTreeModelLoader calls float() on that
    value directly, which raises ``ValueError: could not convert string to float``.

    This patch wraps ``decode_ubjson_buffer`` in ``shap.explainers._tree`` to
    post-process the decoded dict and normalize ``learner_model_param["base_score"]``
    from vector notation to a plain scalar string before SHAP ever sees it.

    The patch is idempotent — calling it multiple times is safe.
    """
    try:
        import shap.explainers._tree as _tree_mod
        import functools

        _orig_decode = _tree_mod.decode_ubjson_buffer

        # Guard against double-patching
        if getattr(_orig_decode, "_railoptix_patched", False):
            return

        @functools.wraps(_orig_decode)
        def _patched_decode(fp):
            result = _orig_decode(fp)
            # Normalise vector-style base_score → scalar
            try:
                lmp = result["learner"]["learner_model_param"]
                bs = lmp.get("base_score", "0.5")
                if isinstance(bs, str) and bs.startswith("["):
                    lmp["base_score"] = bs.strip("[]").split(",")[0].strip()
            except (KeyError, TypeError, AttributeError):
                pass
            return result

        _patched_decode._railoptix_patched = True
        _tree_mod.decode_ubjson_buffer = _patched_decode
    except Exception as exc:
        print(f"Warning: Could not apply SHAP/XGBoost 3.x base_score patch: {exc}")


# Apply the patch before any TreeExplainer is constructed
if HAS_SHAP:
    _patch_shap_xgb3_base_score()

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Human-readable names for the 8 model features
FEATURE_LABELS = {
    "defectSeverity": "Defect severity",
    "assetCriticality": "Asset criticality",
    "historicalFailures": "Historical failure count",
    "overdueDays": "Overdue maintenance days",
    "trainTraffic": "Train traffic level",
    "safetyRisk": "Safety risk rating",
    "expectedDegradation": "Expected degradation rate",
    "assetAgeYears": "Asset age",
}

FEATURE_COLS = list(FEATURE_LABELS.keys())

# Domain baselines — values representing an "average" asset
BASELINES = {
    "defectSeverity": 5.0, "assetCriticality": 5.0, "historicalFailures": 1.0,
    "overdueDays": 0.0, "trainTraffic": 50.0, "safetyRisk": 5.0,
    "expectedDegradation": 0.5, "assetAgeYears": 10.0,
}


class ExplainableAIEngine:
    def __init__(self):
        self._model = self._load_priority_model()
        self._explainer = None
        if self._model is not None and HAS_SHAP:
            try:
                self._explainer = shap.TreeExplainer(self._model)
            except Exception as e:
                print(f"Warning: Could not initialize TreeExplainer: {e}")
                self._explainer = None

    def _load_priority_model(self):
        path = os.path.join(MODELS_DIR, "priority_score_model.joblib")
        if os.path.exists(path):
            try:
                return joblib.load(path)
            except Exception as e:
                print(f"Warning: Failed to load priority model for XAI: {e}")
        return None

    def get_explanation(self, run_id: str, input_data: dict = None,
                        schedule: list = None) -> dict:
        """Return per-prediction TreeSHAP feature contributions.

        Parameters
        ----------
        run_id : str
            The optimization run identifier.
        input_data : dict, optional
            A single prediction's feature values.
        schedule : list[dict], optional
            The optimization schedule (list of tasks with feature columns).
        """
        if self._model is None:
            return {
                "success": True,
                "runId": run_id,
                "baseValue": 0.0,
                "whyOptimal": [
                    {"factor": "Model not loaded", "impact": "neutral", "score": 0}
                ],
            }

        # Build feature input DataFrame
        if input_data is not None:
            rows = [{f: float(input_data.get(f, BASELINES[f])) for f in FEATURE_COLS}]
        elif schedule:
            rows = []
            for task in schedule:
                rows.append({f: float(task.get(f, BASELINES[f])) for f in FEATURE_COLS})
            if not rows:
                rows = [{f: BASELINES[f] for f in FEATURE_COLS}]
        else:
            rows = [{f: BASELINES[f] for f in FEATURE_COLS}]

        df_input = pd.DataFrame(rows)

        # Lazy-initialize explainer if shap imported later
        if self._explainer is None and HAS_SHAP and self._model is not None:
            try:
                self._explainer = shap.TreeExplainer(self._model)
            except Exception:
                self._explainer = None

        if self._explainer is not None:
            try:
                raw_shap = self._explainer.shap_values(df_input)
                if isinstance(raw_shap, list):
                    raw_shap = raw_shap[0]
                if raw_shap.ndim > 1:
                    mean_shap = np.mean(raw_shap, axis=0)
                else:
                    mean_shap = raw_shap

                exp_val = self._explainer.expected_value
                if isinstance(exp_val, (list, np.ndarray)):
                    base_val = float(exp_val[0])
                else:
                    base_val = float(exp_val)
            except Exception as e:
                print(f"Warning: TreeSHAP calculation error: {e}")
                mean_shap = None
                base_val = 50.0
        else:
            mean_shap = None
            base_val = 50.0

        if mean_shap is not None:
            factors = []
            for idx, feat in enumerate(FEATURE_COLS):
                s_val = float(mean_shap[idx])
                score = round(abs(s_val), 2)
                factors.append({
                    "feature": feat,
                    "factor": FEATURE_LABELS[feat],
                    "shapValue": round(s_val, 4),
                    "impact": "positive" if s_val >= 0 else "negative",
                    "score": score,
                })
            factors.sort(key=lambda f: f["score"], reverse=True)
            return {
                "success": True,
                "runId": run_id,
                "targetModel": "priority_score_model.joblib",
                "explanationType": "model_priority_prediction",
                "baseValue": round(base_val, 4),
                "whyOptimal": factors,
            }
        else:
            # Fallback to feature importances
            global_imp = getattr(self._model, "feature_importances_", np.ones(len(FEATURE_COLS)) / len(FEATURE_COLS))
            values = df_input.mean(axis=0).values
            baseline_arr = np.array([BASELINES[f] for f in FEATURE_COLS])
            diffs = values - baseline_arr
            raw_scores = global_imp * diffs
            total = np.abs(raw_scores).sum()
            total = total if total > 0 else 1.0
            pct_scores = (raw_scores / total) * 100.0

            factors = []
            for idx, feat in enumerate(FEATURE_COLS):
                score = round(float(pct_scores[idx]), 1)
                factors.append({
                    "feature": feat,
                    "factor": FEATURE_LABELS[feat],
                    "shapValue": round(float(raw_scores[idx]), 4),
                    "impact": "positive" if score >= 0 else "negative",
                    "score": abs(score),
                })
            factors.sort(key=lambda f: f["score"], reverse=True)
            return {
                "success": True,
                "runId": run_id,
                "targetModel": "priority_score_model.joblib",
                "explanationType": "model_priority_prediction",
                "baseValue": 50.0,
                "whyOptimal": factors,
            }




explainable_ai = ExplainableAIEngine()
