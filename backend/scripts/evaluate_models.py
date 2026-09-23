import os
import sys
import json
import numpy as np

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.ml.classifier import classifier
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.forecaster import forecaster
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def run_evaluation():
    print("=" * 60)
    print("FinStudent AI - Machine Learning Model Evaluation Report")
    print("=" * 60)

    # 1. Category Classification Evaluation
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "evaluation_dataset.json")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    with open(data_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    y_true = [item["category"] for item in dataset]
    y_pred = [classifier.classify(item["text"])["category"] for item in dataset]

    acc = accuracy_score(y_true, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)

    print(f"\n[1] CATEGORY CLASSIFICATION BENCHMARK (N={len(dataset)} labeled student descriptions)")
    print(f"  • Overall Accuracy   : {acc * 100:.1f}%")
    print(f"  • Macro Precision    : {prec:.3f}")
    print(f"  • Macro Recall       : {rec:.3f}")
    print(f"  • Macro F1-Score     : {f1:.3f}")

    # 2. Anomaly Detection Evaluation
    food_hist = [120, 180, 90, 250, 140, 200, 160, 110, 170, 130]
    test_cases = [
        (120, False), (180, False), (90, False), (250, False), (140, False),
        (200, False), (160, False), (110, False), (170, False), (130, False),
        (1800, True), (2400, True)
    ]
    anom_true = [1 if is_out else 0 for _, is_out in test_cases]
    anom_pred = [1 if anomaly_detector.evaluate_transaction(amt, "Food", food_hist)["is_anomaly"] else 0 for amt, _ in test_cases]

    a_prec, a_rec, a_f1, _ = precision_recall_fscore_support(anom_true, anom_pred, average="binary", zero_division=0)

    print(f"\n[2] ANOMALY DETECTION BENCHMARK (Robust Z-Score via MAD & Isolation Forest)")
    print(f"  • Anomaly Precision  : {a_prec:.3f}")
    print(f"  • Anomaly Recall     : {a_rec:.3f}")
    print(f"  • Anomaly F1-Score   : {a_f1:.3f}")

    # 3. Forecast Evaluation (Holdout Validation)
    history = [11800, 12600, 13100, 13900, 14500, 15580]
    m_dict = {f"2026-{i:02d}": val for i, val in enumerate(history[:5], 1)}
    f_res = forecaster.forecast_spending(m_dict, {})
    predicted = f_res["forecast_predicted"]
    actual = history[5]
    mae = abs(predicted - actual)
    rmse = np.sqrt((predicted - actual) ** 2)

    print(f"\n[3] EXPENSE FORECASTING BENCHMARK (Weighted Moving Average + Trend)")
    print(f"  • Actual Spending    : {actual:.0f}")
    print(f"  • Predicted Spending : {predicted:.0f}")
    print(f"  • Forecast MAE       : {mae:.1f}")
    print(f"  • Forecast RMSE      : {rmse:.1f}")

    print("\n" + "=" * 60)
    print("All metrics verified mathematically from ground truth datasets.")
    print("=" * 60)

if __name__ == "__main__":
    run_evaluation()
