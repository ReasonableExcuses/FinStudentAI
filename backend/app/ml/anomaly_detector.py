import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """
    Statistical and Machine-Learning Anomaly Detection for Student Transactions.
    Uses:
    1. Robust Z-score via Median and Median Absolute Deviation (MAD)
    2. Category-specific relative multiplier (> 3.0x historical average)
    3. Isolation Forest for multi-dimensional outlier confirmation
    """

    def __init__(self, z_threshold: float = 2.5, min_samples_for_ml: int = 4):
        self.z_threshold = z_threshold
        self.min_samples_for_ml = min_samples_for_ml

    def evaluate_transaction(
        self,
        amount: float,
        category: str,
        historical_amounts: List[float]
    ) -> Dict[str, Any]:
        """
        Evaluates whether a transaction is unusual compared to historical transactions
        in the same category.
        """
        # If there are fewer than 3 historical samples, cannot reliably determine outlier
        if not historical_amounts or len(historical_amounts) < 3:
            return {
                "is_anomaly": False,
                "anomaly_score": 0.05,
                "historical_average": amount,
                "deviation_percent": 0.0,
                "anomaly_reason": "Insufficient historical data for anomaly assessment."
            }

        amounts_arr = np.array(historical_amounts, dtype=float)
        mean_val = float(np.mean(amounts_arr))
        median_val = float(np.median(amounts_arr))
        std_val = float(np.std(amounts_arr)) if len(amounts_arr) > 1 else 0.0

        # Calculate Median Absolute Deviation (MAD)
        mad = float(np.median(np.abs(amounts_arr - median_val)))
        if mad == 0:
            mad = std_val if std_val > 0 else 1.0

        # Robust Z-Score: (x - median) / (1.4826 * MAD)
        robust_z = (amount - median_val) / (1.4826 * mad) if mad > 0 else 0.0
        deviation_pct = round(((amount - mean_val) / mean_val) * 100, 1) if mean_val > 0 else 0.0

        # Anomaly scoring logic
        is_anomaly = False
        reason = "Normal spending within typical range."
        score = min(1.0, max(0.0, abs(robust_z) / 5.0))

        # Check conditions:
        # A transaction is an outlier if amount is significantly higher than historical average:
        # 1. robust_z > 2.5 and amount is at least 2.5x the median
        # 2. Or amount > 3x mean and deviation > 200% with absolute difference >= ₹500
        if (robust_z > self.z_threshold and amount >= 2.5 * median_val and amount - median_val >= 400) or \
           (amount >= 3.0 * mean_val and deviation_pct >= 200.0 and amount - mean_val >= 500):
            is_anomaly = True
            score = min(0.98, max(0.75, 0.70 + (robust_z / 10.0)))
            reason = (
                f"Transaction of ₹{amount:,.0f} is {deviation_pct:+0.1f}% higher than your "
                f"typical {category} spending average of ₹{mean_val:,.0f}."
            )

        # Optional ML Confirmation via IsolationForest if enough samples
        if len(historical_amounts) >= self.min_samples_for_ml:
            try:
                # Features: [amount, ratio_to_mean]
                X = np.column_stack([
                    amounts_arr,
                    amounts_arr / (mean_val if mean_val > 0 else 1.0)
                ])
                clf = IsolationForest(contamination=0.1, random_state=42)
                clf.fit(X)

                current_x = np.array([[amount, amount / (mean_val if mean_val > 0 else 1.0)]])
                pred = clf.predict(current_x)[0]  # -1 for anomaly, 1 for normal
                if pred == -1 and amount > mean_val:
                    # ML model agrees it's an outlier
                    if is_anomaly:
                        score = max(score, 0.88)
            except Exception:
                pass

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(score, 2),
            "historical_average": round(mean_val, 2),
            "deviation_percent": deviation_pct,
            "anomaly_reason": reason
        }

anomaly_detector = AnomalyDetector()
