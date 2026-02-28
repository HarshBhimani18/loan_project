from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib


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


def load_artifacts():
    """
    Load model and preprocessing objects only once.
    Prevents unnecessary memory usage on startup.
    """
    global model, scaler, feature_columns, numeric_columns

    if model is None:
        model = joblib.load("rf_model_test.pkl")
        scaler = joblib.load("scaler.pkl")
        feature_columns = joblib.load("feature_columns.pkl")
        numeric_columns = joblib.load("numeric_columns.pkl")


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
        return {"error": str(e)}