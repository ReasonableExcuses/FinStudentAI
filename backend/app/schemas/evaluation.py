from pydantic import BaseModel
from typing import Dict, Any, List

class ClassificationMetrics(BaseModel):
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    sample_count: int
    category_metrics: Dict[str, Dict[str, float]]

class AnomalyMetrics(BaseModel):
    precision: float
    recall: float
    f1: float
    test_cases_count: int
    algorithm: str

class ForecastMetrics(BaseModel):
    mae: float
    rmse: float
    evaluation_periods: int
    model_name: str

class EvaluationReport(BaseModel):
    timestamp: str
    classification: ClassificationMetrics
    anomaly: AnomalyMetrics
    forecast: ForecastMetrics
    notes: List[str]
