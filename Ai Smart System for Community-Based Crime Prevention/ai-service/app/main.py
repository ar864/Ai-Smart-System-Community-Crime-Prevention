from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Crime Risk AI Service", version="1.0.0")


class RiskInput(BaseModel):
    area_crime_rate: float = Field(ge=0, le=100)
    night_time_reports: int = Field(ge=0, le=10000)
    repeat_offender_activity: float = Field(ge=0, le=10)
    police_presence_index: float = Field(ge=0, le=10)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "ai"}


@app.post("/predict")
def predict(data: RiskInput) -> dict:
    # Simple weighted score baseline. Replace with trained model later.
    score = (
        0.45 * data.area_crime_rate
        + 0.25 * min(data.night_time_reports / 10, 100)
        + 0.25 * (data.repeat_offender_activity * 10)
        - 0.20 * (data.police_presence_index * 10)
    )

    score = max(0.0, min(100.0, score))

    if score < 35:
        level = "low"
    elif score < 70:
        level = "medium"
    else:
        level = "high"

    return {
        "risk_score": round(score, 2),
        "risk_level": level,
        "explanation": "Risk is estimated using weighted community indicators."
    }
