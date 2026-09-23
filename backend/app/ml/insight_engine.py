import json
from typing import List, Dict, Any, Optional

class InsightEngine:
    """
    Deterministic & Explainable Personalized Insight Engine for Students.
    Generates structured facts from real transactional data and converts them
    into grounded observations with zero hallucination.
    """

    def generate_insights(
        self,
        current_month: str,
        previous_month: Optional[str],
        current_cat_spend: Dict[str, float],
        previous_cat_spend: Dict[str, float],
        total_income: float,
        total_expenses: float,
        anomalies: List[Dict[str, Any]],
        recurring_items: List[Dict[str, Any]],
        forecast_data: Optional[Dict[str, Any]],
        budget_breaches: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        insights = []

        # 1. Month-over-Month Category Trends
        if previous_cat_spend:
            for cat, curr_amt in current_cat_spend.items():
                prev_amt = previous_cat_spend.get(cat, 0.0)
                if prev_amt > 300 and curr_amt > prev_amt:
                    diff = curr_amt - prev_amt
                    pct = round((diff / prev_amt) * 100, 1)

                    if pct >= 15.0:
                        severity = "warning" if pct > 50.0 else "attention"
                        insights.append({
                            "type": "trend",
                            "category": cat,
                            "severity": severity,
                            "title": f"{cat} spending up {pct:+0.1f}%",
                            "description": (
                                f"{cat} spending in {current_month} is ₹{diff:,.0f} higher than last month "
                                f"(₹{curr_amt:,.0f} vs ₹{prev_amt:,.0f}, a {pct:+0.1f}% change)."
                            ),
                            "supporting_data": json.dumps({
                                "metric": "month_over_month_change",
                                "category": cat,
                                "previous_month_amount": prev_amt,
                                "current_month_amount": curr_amt,
                                "difference": diff,
                                "change_percent": pct
                            })
                        })

        # 2. Outlier / Anomaly Detection Insights
        if anomalies:
            for a in anomalies[:2]:  # Top anomalies
                amt = a.get("amount", 0)
                cat = a.get("category") or a.get("final_category", "General")
                hist_avg = a.get("historical_average", 0)
                dev_pct = a.get("deviation_percent", 0)
                desc = a.get("description", "Transaction")

                insights.append({
                    "type": "anomaly",
                    "category": cat,
                    "severity": "warning",
                    "title": f"Unusual {cat} Transaction Detected",
                    "description": (
                        f"A ₹{amt:,.0f} transaction for '{desc}' was flagged as an outlier. "
                        f"It is {dev_pct:+0.1f}% above your typical {cat} average of ₹{hist_avg:,.0f}."
                    ),
                    "supporting_data": json.dumps({
                        "metric": "unusual_transaction",
                        "transaction_description": desc,
                        "amount": amt,
                        "category": cat,
                        "historical_average": hist_avg,
                        "deviation_percent": dev_pct
                    })
                })

        # 3. Budget Projection Alert Insights
        if budget_breaches:
            for b in budget_breaches:
                cat = b.get("category", "")
                budget = b.get("budget_amount", 0)
                proj = b.get("projected_spend", 0)
                diff = proj - budget

                insights.append({
                    "type": "budget_risk",
                    "category": cat,
                    "severity": "warning",
                    "title": f"Projected Budget Breach: {cat}",
                    "description": (
                        f"Based on your current daily spending pace, projected {cat} spending (₹{proj:,.0f}) "
                        f"will exceed your budget of ₹{budget:,.0f} by ₹{diff:,.0f}."
                    ),
                    "supporting_data": json.dumps({
                        "metric": "budget_projection_risk",
                        "category": cat,
                        "budget": budget,
                        "projected_spend": proj,
                        "expected_overrun": diff
                    })
                })

        # 4. Recurring Subscriptions Commitment
        if recurring_items:
            sub_count = len(recurring_items)
            total_recurring = sum(item.get("amount", 0) for item in recurring_items)
            sub_names = ", ".join(item.get("merchant", "") for item in recurring_items[:3])

            insights.append({
                "type": "recurring",
                "category": "Subscriptions",
                "severity": "normal",
                "title": f"{sub_count} Active Subscriptions Detected",
                "description": (
                    f"You have {sub_count} detected recurring commitments ({sub_names}) "
                    f"totaling ₹{total_recurring:,.0f} per month."
                ),
                "supporting_data": json.dumps({
                    "metric": "recurring_commitment",
                    "count": sub_count,
                    "monthly_total": total_recurring,
                    "merchants": [item.get("merchant") for item in recurring_items]
                })
            })

        # 5. Spending Forecast Insight
        if forecast_data and forecast_data.get("has_sufficient_data"):
            pred = forecast_data.get("forecast_predicted", 0)
            f_month = forecast_data.get("forecast_month", "Next Month")
            curr_act = forecast_data.get("current_actual", 0)
            chg = forecast_data.get("expected_change_percent", 0)

            insights.append({
                "type": "trend",
                "category": "Total",
                "severity": "normal" if chg <= 5.0 else "attention",
                "title": f"Forecast for {f_month}: ₹{pred:,.0f}",
                "description": (
                    f"Based on historical spending patterns, your estimated expenditure for {f_month} is "
                    f"₹{pred:,.0f} ({chg:+0.1f}% change relative to {current_month})."
                ),
                "supporting_data": json.dumps({
                    "metric": "spending_forecast",
                    "forecast_month": f_month,
                    "predicted_amount": pred,
                    "current_actual": curr_act,
                    "change_percent": chg
                })
            })

        # 6. Savings Performance
        if total_income > 0:
            savings = total_income - total_expenses
            savings_rate = round((savings / total_income) * 100, 1)
            if savings > 0:
                insights.append({
                    "type": "saving",
                    "category": "Income",
                    "severity": "positive",
                    "title": f"Healthy Monthly Savings Rate ({savings_rate}%)",
                    "description": (
                        f"You have saved ₹{savings:,.0f} this month ({savings_rate}% of your ₹{total_income:,.0f} income)."
                    ),
                    "supporting_data": json.dumps({
                        "metric": "savings_rate",
                        "income": total_income,
                        "expenses": total_expenses,
                        "savings": savings,
                        "savings_rate_percent": savings_rate
                    })
                })

        return insights

insight_engine = InsightEngine()
