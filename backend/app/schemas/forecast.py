from pydantic import BaseModel
from typing import List, Optional

class CategoryForecastOut(BaseModel):
    category: str
    current_average: float
    predicted_amount: float
    expected_change_percent: float
    lower_bound: float
    upper_bound: float
    method: str

class ForecastSummaryOut(BaseModel):
    current_month: str
    current_actual: float
    forecast_month: str
    forecast_predicted: float
    expected_change_percent: float
    method: str
    explanation: str
    historical_trend: List[dict]  # [{"period": "2026-07", "amount": 12500, "is_forecast": False}, ...]
    category_forecasts: List[CategoryForecastOut]
