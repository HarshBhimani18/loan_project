from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
from pathlib import Path


# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="Loan Default Prediction API")


# -----------------------------
# CORS (allow frontend access)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change to your Vercel domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Global model artifacts (lazy load)
# -----------------------------
model = None
scaler = None
feature_columns = None
numeric_columns = None
BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_FILES = {
    "model": BASE_DIR / "rf_model_test.pkl",
    "scaler": BASE_DIR / "scaler.pkl",
    "feature_columns": BASE_DIR / "feature_columns.pkl",
    "numeric_columns": BASE_DIR / "numeric_columns.pkl",
}


def _is_lfs_pointer(path: Path) -> bool:
    try:
        with path.open("r", encoding="utf-8") as f:
            first_line = f.readline().strip()
        return first_line == "version https://git-lfs.github.com/spec/v1"
    except UnicodeDecodeError:
        return False


def _validate_artifact(path: Path):
    if not path.exists():
        raise RuntimeError(f"Missing artifact file: {path.name}")
    if _is_lfs_pointer(path):
        raise RuntimeError(
            f"Artifact '{path.name}' is a Git LFS pointer, not a real model file. "
            "Run: git lfs install && git lfs pull"
        )


def load_artifacts():
    """
    Load model and preprocessing objects only once.
    Prevents unnecessary memory usage on startup.
    """
    global model, scaler, feature_columns, numeric_columns

    if model is None:
        for artifact_path in ARTIFACT_FILES.values():
            _validate_artifact(artifact_path)

        model = joblib.load(ARTIFACT_FILES["model"])
        scaler = joblib.load(ARTIFACT_FILES["scaler"])
        feature_columns = joblib.load(ARTIFACT_FILES["feature_columns"])
        numeric_columns = joblib.load(ARTIFACT_FILES["numeric_columns"])


# -----------------------------
# Request schema
# -----------------------------
class LoanInput(BaseModel):
    data: dict


# -----------------------------
# Health check route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Loan Default Prediction API running"}


# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict(input_data: LoanInput):
    try:
        # Load model and preprocessing tools
        load_artifacts()

        # Convert input to DataFrame
        df = pd.DataFrame([input_data.data])

        # One-hot encode categorical features
        df = pd.get_dummies(df)

        # Align columns with training features
        df = df.reindex(columns=feature_columns, fill_value=0)

        # Scale numeric columns
        df[numeric_columns] = scaler.transform(df[numeric_columns])

        # Predict
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]

        return {
            "prediction": int(prediction),
            "probability": float(probability)
        }

    except Exception as e:
        return {"error": f"{e.__class__.__name__}: {str(e)}"}
