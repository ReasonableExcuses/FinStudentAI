import re
from typing import Dict, Any, List, Optional
from datetime import datetime

SAFETY_DISCLAIMER = (
    "I can analyze the transactions, budgets, and spending patterns stored in your "
    "FinStudent profile, but I cannot provide professional financial, investment, loan, or tax advice."
)

UNSUPPORTED_KEYWORDS = [
    "stock", "crypto", "bitcoin", "invest", "trading", "loan", "borrow",
    "credit score", "cibil", "tax", "mutual fund", "options", "forex", "wealth"
]

class QAEngine:
    """
    Grounded Question-Answering Engine for FinStudent AI.
    Maps natural language questions to analytical database queries.
    Guarantees mathematically verified answers without hallucinating numbers.
    """

    def process_query(
        self,
        question: str,
        user_context: Dict[str, Any]
        # user_context contains:
        # {
        #   "current_month": "2026-09",
        #   "current_expenses": float,
        #   "current_income": float,
        #   "categories": {"Food": 4500, "Shopping": 3200, "Transportation": 2100, ...},
        #   "previous_categories": {"Food": 3800, "Shopping": 1800, ...},
        #   "anomalies": [...],
        #   "recurring": [...],
        #   "forecast": {...},
        #   "budgets": [...]
        # }
    ) -> Dict[str, Any]:
        q_lower = question.lower().strip()

        # Step 1: Safety Check for ungrounded financial advice requests
        if any(re.search(rf"\b{kw}\b", q_lower) for kw in UNSUPPORTED_KEYWORDS):
            return {
                "question": question,
                "answer": SAFETY_DISCLAIMER,
                "intent": "safety_block",
                "structured_data": {"blocked": True, "reason": "non_expense_tracking_query"},
                "supporting_chart_type": None,
                "supporting_chart_data": None
            }

        categories_data = user_context.get("categories", {})
        prev_categories = user_context.get("previous_categories", {})
        recurring_data = user_context.get("recurring", [])
        anomalies_data = user_context.get("anomalies", [])
        forecast_data = user_context.get("forecast", {})
        curr_month = user_context.get("current_month", "this month")

        # Step 2: Intent Matching

        # Intent A: Where did most of my money go? / Top spending category
        if any(p in q_lower for p in ["most of my money", "largest spending", "highest spend", "top category", "where did my money go"]):
            if not categories_data:
                return self._empty_response(question, "No expenses recorded for this month yet.")

            sorted_cats = sorted(categories_data.items(), key=lambda x: x[1], reverse=True)
            top_cat, top_amt = sorted_cats[0]
            total_exp = sum(categories_data.values())
            pct = round((top_amt / total_exp) * 100, 1) if total_exp > 0 else 0

            breakdown_str = ", ".join([f"{c} (₹{a:,.0f})" for c, a in sorted_cats[:3]])
            answer = (
                f"Most of your money this month went to **{top_cat}**, totaling **₹{top_amt:,.0f}** "
                f"({pct}% of your total spending of ₹{total_exp:,.0f}).\n\n"
                f"Your top categories are: {breakdown_str}."
            )
            return {
                "question": question,
                "answer": answer,
                "intent": "top_category",
                "structured_data": {"top_category": top_cat, "amount": top_amt, "total_expenses": total_exp, "percentage": pct},
                "supporting_chart_type": "category_donut",
                "supporting_chart_data": [{"name": c, "value": a} for c, a in sorted_cats[:5]]
            }

        # Intent B: Specific Category Spending (e.g. "How much did I spend on food/uber/transportation?")
        for cat in ["Food", "Transportation", "Education", "Entertainment", "Shopping", "Bills", "Health", "Subscriptions", "Accommodation"]:
            if cat.lower() in q_lower or (cat == "Transportation" and any(k in q_lower for k in ["transport", "travel", "uber", "cab"])):
                amt = categories_data.get(cat, 0.0)
                prev_amt = prev_categories.get(cat, 0.0)
                comparison_text = ""
                if prev_amt > 0:
                    diff = amt - prev_amt
                    diff_pct = round((diff / prev_amt) * 100, 1)
                    comp_word = "higher" if diff > 0 else "lower"
                    comparison_text = f" This is {abs(diff_pct):0.1f}% {comp_word} than last month's spending of ₹{prev_amt:,.0f}."

                answer = f"You spent **₹{amt:,.0f}** on **{cat}** in {curr_month}.{comparison_text}"
                return {
                    "question": question,
                    "answer": answer,
                    "intent": "category_spend",
                    "structured_data": {"category": cat, "current_amount": amt, "previous_amount": prev_amt},
                    "supporting_chart_type": "category_bar",
                    "supporting_chart_data": [{"period": "Last Month", "amount": prev_amt}, {"period": "This Month", "amount": amt}]
                }

        # Intent C: Subscriptions / Recurring Expenses ("What subscriptions do I have?")
        if any(p in q_lower for p in ["subscription", "recurring", "monthly payment", "memberships"]):
            if not recurring_data:
                return {
                    "question": question,
                    "answer": "No active recurring subscriptions have been detected in your transactions yet.",
                    "intent": "recurring_summary",
                    "structured_data": {"count": 0, "total": 0}
                }

            total_rec = sum(item.get("amount", 0) for item in recurring_data)
            items_str = "\n".join([f"• **{item.get('merchant')}**: ₹{item.get('amount', 0):,.0f} / {item.get('frequency', 'Monthly').lower()}" for item in recurring_data])
            answer = (
                f"You have **{len(recurring_data)}** detected recurring subscriptions totaling **₹{total_rec:,.0f} per month**:\n\n"
                f"{items_str}"
            )
            return {
                "question": question,
                "answer": answer,
                "intent": "recurring_summary",
                "structured_data": {"count": len(recurring_data), "monthly_total": total_rec, "items": recurring_data},
                "supporting_chart_type": "recurring_list",
                "supporting_chart_data": recurring_data
            }

        # Intent D: Why did spending increase? / Why am I spending more?
        if any(p in q_lower for p in ["why did i spend more", "spending more", "increased the most", "spending increase", "why am i spending"]):
            if not prev_categories:
                return self._empty_response(question, "Not enough previous month data to calculate spending increase reasons.")

            increases = []
            for cat, curr_a in categories_data.items():
                prev_a = prev_categories.get(cat, 0.0)
                if curr_a > prev_a:
                    increases.append((cat, curr_a - prev_a, curr_a, prev_a))

            increases.sort(key=lambda x: x[1], reverse=True)
            if not increases:
                answer = "Your overall spending this month did not increase compared to last month across your primary categories."
            else:
                top_items = increases[:3]
                diff_summary = ", ".join([f"{c} (+₹{diff:,.0f})" for c, diff, _, _ in top_items])
                curr_tot = sum(categories_data.values())
                prev_tot = sum(prev_categories.values())
                tot_diff = curr_tot - prev_tot
                tot_pct = round((tot_diff / prev_tot) * 100, 1) if prev_tot > 0 else 0

                answer = (
                    f"Your spending increased by **₹{tot_diff:,.0f}** ({tot_pct:+0.1f}%) compared with last month.\n\n"
                    f"The largest contributors were: **{diff_summary}**."
                )

            return {
                "question": question,
                "answer": answer,
                "intent": "mom_increase",
                "structured_data": {"increases": [{"category": c, "difference": d} for c, d, _, _ in increases]},
                "supporting_chart_type": "category_bar",
                "supporting_chart_data": [{"category": c, "difference": d} for c, d, _, _ in increases[:4]]
            }

        # Intent E: Forecast / Predicted spending next month
        if any(p in q_lower for p in ["predict", "forecast", "spend next month", "future spending", "how much will i spend"]):
            if not forecast_data or not forecast_data.get("has_sufficient_data"):
                return {
                    "question": question,
                    "answer": "Forecast requires at least 2 months of historical spending records. Add more transactions to view future projections.",
                    "intent": "forecast",
                    "structured_data": None
                }

            pred = forecast_data.get("forecast_predicted", 0)
            f_month = forecast_data.get("forecast_month", "Next Month")
            curr_act = forecast_data.get("current_actual", 0)
            chg = forecast_data.get("expected_change_percent", 0)

            answer = (
                f"Based on your historical monthly spending patterns, your **estimated spending for {f_month} is ₹{pred:,.0f}**.\n\n"
                f"This represents an estimated change of **{chg:+0.1f}%** compared to your current expenditure of ₹{curr_act:,.0f}."
            )
            return {
                "question": question,
                "answer": answer,
                "intent": "forecast",
                "structured_data": {"forecast_month": f_month, "predicted_amount": pred, "current_actual": curr_act},
                "supporting_chart_type": "forecast_trend",
                "supporting_chart_data": forecast_data.get("historical_trend", [])
            }

        # Intent F: Anomalies / Unusual transactions
        if any(p in q_lower for p in ["unusual", "anomaly", "abnormal", "outlier", "weird"]):
            if not anomalies_data:
                return {
                    "question": question,
                    "answer": "No unusual transactions have been detected in your current spending period.",
                    "intent": "anomalies",
                    "structured_data": {"count": 0}
                }

            items_str = "\n".join([
                f"• **{a.get('description', 'Item')}** (₹{a.get('amount', 0):,.0f} in {a.get('category', 'Category')}) — "
                f"{a.get('deviation_percent', 0):+0.0f}% vs typical average of ₹{a.get('historical_average', 0):,.0f}"
                for a in anomalies_data
            ])
            answer = f"We detected **{len(anomalies_data)} unusual transaction(s)** in your records:\n\n{items_str}"
            return {
                "question": question,
                "answer": answer,
                "intent": "anomalies",
                "structured_data": {"count": len(anomalies_data), "anomalies": anomalies_data}
            }

        # Intent G: Budget status
        if any(p in q_lower for p in ["budget", "am i within budget", "budget limit"]):
            budgets = user_context.get("budgets", [])
            if not budgets:
                return {
                    "question": question,
                    "answer": "You have not set any category budgets yet. Visit the Budgets tab to set monthly limits.",
                    "intent": "budget_status"
                }

            breached = [b for b in budgets if b.get("spent_amount", 0) > b.get("budget_amount", 0)]
            if breached:
                b_str = ", ".join([f"{b['category']} (spent ₹{b['spent_amount']:,.0f} / budget ₹{b['budget_amount']:,.0f})" for b in breached])
                answer = f"You are currently over budget in: **{b_str}**."
            else:
                answer = "All your category expenditures are currently within the monthly budgets you defined!"

            return {
                "question": question,
                "answer": answer,
                "intent": "budget_status",
                "structured_data": {"budgets": budgets}
            }

        # Default Fallback grounded response
        total_exp = sum(categories_data.values()) if categories_data else 0
        return {
            "question": question,
            "answer": (
                f"In {curr_month}, you have recorded **₹{total_exp:,.0f}** in total expenses across "
                f"**{len(categories_data)}** categories. You can ask me about specific categories (e.g., 'How much did I spend on Food?'), "
                f"subscriptions ('What subscriptions do I have?'), or predictions ('What is my forecast for next month?')."
            ),
            "intent": "general_summary",
            "structured_data": {"total_expenses": total_exp, "categories_count": len(categories_data)}
        }

    def _empty_response(self, question: str, message: str) -> Dict[str, Any]:
        return {
            "question": question,
            "answer": message,
            "intent": "no_data",
            "structured_data": None
        }

qa_engine = QAEngine()
