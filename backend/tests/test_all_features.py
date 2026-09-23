import pytest
from datetime import datetime
from backend.app.ml.classifier import classifier
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.recurring_detector import recurring_detector
from backend.app.ml.forecaster import forecaster
from backend.app.ml.insight_engine import insight_engine
from backend.app.ml.qa_engine import qa_engine

def test_ai_classifier():
    r1 = classifier.classify("Uber to college")
    assert r1["category"] == "Transportation"
    assert r1["confidence"] >= 0.80

    r2 = classifier.classify("Pizza Hut cheese burst")
    assert r2["category"] == "Food"

    r3 = classifier.classify("Amazon wireless headphones")
    assert r3["category"] == "Shopping"

    r4 = classifier.classify("Netflix monthly subscription")
    assert r4["category"] == "Subscriptions"

    r5 = classifier.classify("Python textbook notes")
    assert r5["category"] == "Education"

def test_anomaly_detector():
    food_history = [120, 150, 180, 200, 110, 140, 160, 130]
    # Normal spending
    res_normal = anomaly_detector.evaluate_transaction(170, "Food", food_history)
    assert res_normal["is_anomaly"] is False

    # True outlier
    res_outlier = anomaly_detector.evaluate_transaction(1800, "Food", food_history)
    assert res_outlier["is_anomaly"] is True
    assert res_outlier["deviation_percent"] > 500

def test_recurring_detector():
    txs = [
        {"id": 1, "date": datetime(2026, 7, 21), "description": "NETFLIX.COM", "amount": 199.0, "category": "Subscriptions"},
        {"id": 2, "date": datetime(2026, 8, 21), "description": "Netflix India", "amount": 199.0, "category": "Subscriptions"},
        {"id": 3, "date": datetime(2026, 9, 21), "description": "Netflix", "amount": 199.0, "category": "Subscriptions"}
    ]
    detected = recurring_detector.detect_recurring(txs)
    assert len(detected) == 1
    assert detected[0]["merchant"] == "Netflix"
    assert detected[0]["amount"] == 199.0
    assert detected[0]["frequency"] == "Monthly"

def test_forecaster():
    monthly_data = {
        "2026-07": 12500,
        "2026-08": 13400,
        "2026-09": 15580
    }
    cat_monthly = {
        "Food": {"2026-07": 3500, "2026-08": 3800, "2026-09": 4500}
    }
    res = forecaster.forecast_spending(monthly_data, cat_monthly)
    assert res["has_sufficient_data"] is True
    assert res["forecast_predicted"] > 14000
    assert len(res["category_forecasts"]) >= 1

def test_budget_projection():
    # Spent 4500 by day 20 of a 30-day month with budget 5000
    proj = forecaster.project_budget_status("Food", 4500, 5000, 20, 30, predicted_category_amount=5300)
    assert proj["is_projected_over"] is True
    assert proj["projected_spend"] > 5000
    assert "exceeds the budget you entered" in proj["projection_alert"]

def test_qa_engine_grounded():
    context = {
        "current_month": "2026-09",
        "current_expenses": 15580,
        "categories": {"Food": 4500, "Shopping": 3200, "Transportation": 2100},
        "previous_categories": {"Food": 3800, "Shopping": 1800, "Transportation": 2300},
        "anomalies": [],
        "recurring": [{"merchant": "Netflix", "amount": 199, "frequency": "Monthly"}],
        "forecast": {"has_sufficient_data": True, "forecast_predicted": 16800, "forecast_month": "2026-10"}
    }
    # Test top category
    q1 = qa_engine.process_query("Where did most of my money go this month?", context)
    assert "Food" in q1["answer"]
    assert "4,500" in q1["answer"]

    # Test safety block for investment advice
    q_safe = qa_engine.process_query("Which stock or crypto should I invest in?", context)
    assert "cannot provide professional financial" in q_safe["answer"]
    assert q_safe["intent"] == "safety_block"

def test_api_integration(client):
    # 1. Register
    reg_resp = client.post("/api/auth/register", json={
        "email": "test_user_idp@test.com",
        "password": "securepassword",
        "name": "Jordan"
    })
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Classify endpoint
    clf_resp = client.post("/api/transactions/classify", json={"description": "Uber to college campus", "amount": 180})
    assert clf_resp.status_code == 200
    assert clf_resp.json()["category"] == "Transportation"

    # 3. Create Transaction
    tx_resp = client.post("/api/transactions", json={
        "date": "2026-09-23T10:00:00",
        "description": "Lunch at Canteen",
        "amount": 120.0,
        "type": "expense"
    }, headers=headers)
    assert tx_resp.status_code == 200
    tx_data = tx_resp.json()
    assert tx_data["final_category"] == "Food"

    # 4. Budgets
    b_resp = client.post("/api/budgets", json={
        "category": "Food",
        "month": "2026-09",
        "amount": 5000.0
    }, headers=headers)
    assert b_resp.status_code == 200

    # 5. ML Evaluation report endpoint
    eval_resp = client.get("/api/evaluation")
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert "classification" in eval_data
    assert eval_data["classification"]["accuracy"] > 75.0
