import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import defaultdict

class Forecaster:
    """
    Time-Series Expense Forecaster and Budget Projector for Students.
    - Historical monthly trend regression (Weighted Moving Average + Linear Trend)
    - Category-level forecast with prediction uncertainty intervals
    - Budget projection alerts: detects when projected spending will breach user-defined budget.
    """

    def forecast_spending(
        self,
        monthly_expenses: Dict[str, float],  # {"2026-07": 12500, "2026-08": 13400, "2026-09": 15580}
        category_monthly: Dict[str, Dict[str, float]], # {"Food": {"2026-08": 3800, "2026-09": 4500}, ...}
        budgets: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Generates spending forecast for the next period and category projections.
        """
        sorted_periods = sorted(monthly_expenses.keys())

        if len(sorted_periods) < 2:
            return {
                "has_sufficient_data": False,
                "message": "Forecast requires at least 2 months of historical spending data.",
                "historical_trend": [],
                "category_forecasts": [],
                "current_month": sorted_periods[-1] if sorted_periods else "Current",
                "current_actual": monthly_expenses.get(sorted_periods[-1], 0) if sorted_periods else 0,
                "forecast_month": "Next Month",
                "forecast_predicted": 0,
                "expected_change_percent": 0.0,
                "method": "Insufficient data",
                "explanation": "Add more transactions across months to generate a spending forecast."
            }

        amounts = [monthly_expenses[p] for p in sorted_periods]
        n = len(amounts)

        # 1. Total Spending Forecast via Weighted Moving Average with Trend
        # Give higher weights to recent months: weights = [1, 2, ..., n]
        weights = np.arange(1, n + 1)
        weighted_avg = float(np.sum(np.array(amounts) * weights) / np.sum(weights))

        # Linear trend: slope across recent periods
        x = np.arange(n)
        slope, intercept = np.polyfit(x, amounts, 1) if n >= 2 else (0.0, weighted_avg)

        # Blended projection: 60% trend line extrapolation, 40% weighted average
        trend_proj = float(slope * n + intercept)
        predicted_total = round(max(0.0, 0.60 * trend_proj + 0.40 * weighted_avg), -1)

        current_month = sorted_periods[-1]
        current_actual = amounts[-1]

        # Calculate next month name/period (e.g. 2026-09 -> 2026-10)
        try:
            curr_year, curr_m = map(int, current_month.split("-"))
            next_m = curr_m + 1 if curr_m < 12 else 1
            next_y = curr_year if curr_m < 12 else curr_year + 1
            forecast_month = f"{next_y:04d}-{next_m:02d}"
        except Exception:
            forecast_month = "Next Month"

        expected_change = round(((predicted_total - current_actual) / current_actual) * 100, 1) if current_actual > 0 else 0.0

        # Build historical trend list with forecast point
        trend_points = []
        for p in sorted_periods:
            trend_points.append({
                "period": p,
                "amount": round(monthly_expenses[p], 2),
                "is_forecast": False
            })
        trend_points.append({
            "period": forecast_month,
            "amount": round(predicted_total, 2),
            "is_forecast": True
        })

        # 2. Category Level Forecasts
        cat_forecasts = []
        for category, m_data in category_monthly.items():
            cat_periods = sorted(m_data.keys())
            if not cat_periods:
                continue

            cat_amounts = [m_data[p] for p in cat_periods]
            cat_n = len(cat_amounts)
            cat_weights = np.arange(1, cat_n + 1)
            cat_w_avg = float(np.sum(np.array(cat_amounts) * cat_weights) / np.sum(cat_weights))

            if cat_n >= 2:
                c_slope, c_intercept = np.polyfit(np.arange(cat_n), cat_amounts, 1)
                c_trend = float(c_slope * cat_n + c_intercept)
                cat_predicted = round(max(0.0, 0.65 * c_trend + 0.35 * cat_w_avg), -1)
            else:
                cat_predicted = round(cat_w_avg, -1)

            curr_cat_avg = round(float(np.mean(cat_amounts)), 1)
            cat_change = round(((cat_predicted - curr_cat_avg) / curr_cat_avg) * 100, 1) if curr_cat_avg > 0 else 0.0

            # Prediction interval (std error approximation)
            std_err = float(np.std(cat_amounts)) if cat_n > 1 else (cat_predicted * 0.08)
            margin = max(150.0, std_err * 1.2)
            lower_b = round(max(0.0, cat_predicted - margin), -1)
            upper_b = round(cat_predicted + margin, -1)

            cat_forecasts.append({
                "category": category,
                "current_average": curr_cat_avg,
                "predicted_amount": cat_predicted,
                "expected_change_percent": cat_change,
                "lower_bound": lower_b,
                "upper_bound": upper_b,
                "method": "Weighted Moving Average + Trend"
            })

        # Sort categories by predicted amount descending
        cat_forecasts.sort(key=lambda x: x["predicted_amount"], reverse=True)

        return {
            "has_sufficient_data": True,
            "current_month": current_month,
            "current_actual": current_actual,
            "forecast_month": forecast_month,
            "forecast_predicted": predicted_total,
            "expected_change_percent": expected_change,
            "method": "Weighted Moving Average + Linear Trend",
            "explanation": f"Forecast based on your historical monthly spending patterns across {n} recorded months.",
            "historical_trend": trend_points,
            "category_forecasts": cat_forecasts
        }

    def project_budget_status(
        self,
        category: str,
        spent_amount: float,
        budget_amount: float,
        day_of_month: int,
        days_in_month: int,
        predicted_category_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Projects whether the user is on track to breach the entered budget for the current month.
        Formula:
        Current pace = (spent_amount / day_of_month) * days_in_month
        Blended projection = 0.5 * Current Pace + 0.5 * Category Forecast (if available)
        """
        if day_of_month <= 0:
            day_of_month = 1
        if days_in_month <= 0:
            days_in_month = 30

        pace_projection = (spent_amount / day_of_month) * days_in_month

        if predicted_category_amount and predicted_category_amount > 0:
            projected = round(0.50 * pace_projection + 0.50 * predicted_category_amount, -1)
        else:
            projected = round(pace_projection, -1)

        is_over = projected > budget_amount
        diff = projected - budget_amount

        alert_text = None
        if is_over:
            alert_text = (
                f"At the current spending pattern, your projected {category} spending (₹{projected:,.0f}) "
                f"exceeds the budget you entered (₹{budget_amount:,.0f}) by ₹{diff:,.0f}."
            )

        return {
            "projected_spend": projected,
            "is_projected_over": is_over,
            "projection_alert": alert_text
        }

forecaster = Forecaster()
