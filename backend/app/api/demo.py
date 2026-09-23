from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..models.recurring import RecurringExpense
from ..models.forecast import Forecast
from ..models.insight import Insight
from ..services.auth_service import get_password_hash, create_access_token

router = APIRouter(prefix="/demo", tags=["Demo Data"])

@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    """
    1-Click Demo Data Population.
    Cleans and seeds a complete, realistic 3-month student financial profile
    matching all presentation demo requirements (Demo 1 to 9).
    """
    demo_email = "alex@finstudent.ai"

    # Find or create demo user
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("password123"),
            name="Alex",
            university="Engineering University",
            monthly_income=24000.0,
            monthly_budget=20000.0,
            currency="₹",
            student_type="Hosteller"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Clear existing transactions, budgets, recurring for demo user
        db.query(Transaction).filter(Transaction.user_id == user.id).delete()
        db.query(Budget).filter(Budget.user_id == user.id).delete()
        db.query(RecurringExpense).filter(RecurringExpense.user_id == user.id).delete()
        db.query(Forecast).filter(Forecast.user_id == user.id).delete()
        db.query(Insight).filter(Insight.user_id == user.id).delete()
        db.commit()

    # Base dates around 2026-09
    # Current month: 2026-09
    # Previous month: 2026-08
    # Earlier month: 2026-07

    # 1. Income Transactions
    # July Income: ₹20,000 (Allowance ₹15,000, Freelance ₹5,000)
    # August Income: ₹25,000 (Allowance ₹15,000, Scholarship ₹10,000)
    # September Income: ₹24,000 (Allowance ₹15,000, Freelance ₹4,000, Scholarship/Stipend ₹5,000)
    income_records = [
        (datetime(2026, 7, 1), "Monthly allowance from parents", 15000.0, "Income"),
        (datetime(2026, 7, 20), "Freelance UI design payout", 5000.0, "Freelance"),
        (datetime(2026, 8, 1), "Monthly allowance from parents", 15000.0, "Income"),
        (datetime(2026, 8, 15), "Semester Merit Scholarship", 10000.0, "Income"),
        (datetime(2026, 9, 1), "Monthly allowance from parents", 15000.0, "Income"),
        (datetime(2026, 9, 14), "College project stipend", 5000.0, "Income"),
        (datetime(2026, 9, 22), "Freelance Payment", 4000.0, "Freelance"),
    ]

    for dt, desc, amt, cat in income_records:
        t = Transaction(
            user_id=user.id,
            date=dt,
            description=desc,
            amount=amt,
            type="income",
            ai_category=cat,
            final_category=cat,
            ai_confidence=0.98,
            anomaly_score=0.01,
            is_anomaly=False,
            payment_method="Bank Transfer"
        )
        db.add(t)

    # 2. Historical August 2026 Expenses (Total: ₹13,400)
    # Food: ₹3,800
    # Transportation: ₹2,300
    # Shopping: ₹1,800
    # Education: ₹1,500
    # Subscriptions: ₹617
    # Entertainment: ₹800
    # Bills/Other: ₹2,583
    august_expenses = [
        (datetime(2026, 8, 2), "Mess monthly food advance", 2000.0, "Food", "Food", 0.95),
        (datetime(2026, 8, 5), "Canteen lunch with classmates", 150.0, "Food", "Food", 0.94),
        (datetime(2026, 8, 8), "Swiggy dinner order", 350.0, "Food", "Food", 0.96),
        (datetime(2026, 8, 12), "Zomato lunch roll", 180.0, "Food", "Food", 0.95),
        (datetime(2026, 8, 18), "Chai and snacks tapri", 120.0, "Food", "Food", 0.92),
        (datetime(2026, 8, 25), "Cafe coffee and sandwich", 400.0, "Food", "Food", 0.93),
        (datetime(2026, 8, 28), "Hostel midnight snacks", 600.0, "Food", "Food", 0.91),

        (datetime(2026, 8, 3), "Metro smart card recharge", 500.0, "Transportation", "Transportation", 0.96),
        (datetime(2026, 8, 9), "Uber to college campus", 180.0, "Transportation", "Transportation", 0.94),
        (datetime(2026, 8, 14), "City bus monthly pass", 600.0, "Transportation", "Transportation", 0.95),
        (datetime(2026, 8, 19), "Rapido bike taxi", 90.0, "Transportation", "Transportation", 0.94),
        (datetime(2026, 8, 24), "Uber cab to railway station", 430.0, "Transportation", "Transportation", 0.95),
        (datetime(2026, 8, 29), "Auto rickshaw fare", 500.0, "Transportation", "Transportation", 0.91),

        (datetime(2026, 8, 10), "Amazon casual t-shirt", 800.0, "Shopping", "Shopping", 0.92),
        (datetime(2026, 8, 20), "Flipkart stationery and bag", 1000.0, "Shopping", "Shopping", 0.91),

        (datetime(2026, 8, 4), "Engineering Mathematics book", 850.0, "Education", "Education", 0.95),
        (datetime(2026, 8, 16), "Project Xerox and binding", 450.0, "Education", "Education", 0.94),
        (datetime(2026, 8, 26), "Notebooks and pens", 200.0, "Education", "Education", 0.93),

        (datetime(2026, 8, 15), "PVR Cinemas movie ticket", 450.0, "Entertainment", "Entertainment", 0.96),
        (datetime(2026, 8, 22), "Weekend outing bowling", 350.0, "Entertainment", "Entertainment", 0.93),

        (datetime(2026, 8, 21), "Netflix monthly subscription", 199.0, "Subscriptions", "Subscriptions", 0.98),
        (datetime(2026, 8, 11), "Spotify student renewal", 119.0, "Subscriptions", "Subscriptions", 0.97),
        (datetime(2026, 8, 17), "Google Cloud storage 100GB", 299.0, "Subscriptions", "Subscriptions", 0.96),

        (datetime(2026, 8, 7), "Jio 3-month recharge", 749.0, "Bills", "Bills", 0.96),
        (datetime(2026, 8, 13), "Room electricity shared", 834.0, "Bills", "Bills", 0.94),
        (datetime(2026, 8, 27), "Hostel laundry and misc", 1000.0, "Other", "Other", 0.88),
    ]

    for dt, desc, amt, ai_cat, final_cat, conf in august_expenses:
        t = Transaction(
            user_id=user.id,
            date=dt,
            description=desc,
            amount=amt,
            type="expense",
            ai_category=ai_cat,
            final_category=final_cat,
            ai_confidence=conf,
            anomaly_score=0.04,
            is_anomaly=False,
            payment_method="UPI"
        )
        db.add(t)

    # 3. September 2026 Expenses (Total: ₹15,580)
    # Food: ₹4,500 (including ₹1,800 outlier restaurant feast!)
    # Transportation: ₹2,100
    # Shopping: ₹3,200 (+77.8% MoM)
    # Education: ₹1,500
    # Entertainment: ₹900
    # Subscriptions: ₹798
    # Other: ₹2,582
    # Exactly ₹15,580!
    september_expenses = [
        # Food: ₹4,500 total (typical items: ₹120, ₹180, ₹250, ₹450, ₹120, ₹150, ₹200, ₹180, ₹50, ₹1000, ₹1800 outlier)
        (datetime(2026, 9, 2), "Lunch at Canteen", 120.0, "Food", "Food", 0.96, False, 0.03, None),
        (datetime(2026, 9, 5), "Campus mess dinner", 180.0, "Food", "Food", 0.95, False, 0.04, None),
        (datetime(2026, 9, 8), "Swiggy late snack", 250.0, "Food", "Food", 0.97, False, 0.05, None),
        (datetime(2026, 9, 11), "Pizza Hut lunch meal", 450.0, "Food", "Food", 0.98, False, 0.08, None),
        (datetime(2026, 9, 14), "Chai and cookies tapri", 100.0, "Food", "Food", 0.94, False, 0.02, None),
        (datetime(2026, 9, 16), "Hostel tuck shop biscuits & juice", 100.0, "Food", "Food", 0.91, False, 0.02, None),
        (datetime(2026, 9, 18), "Celebration Dinner at Barbeque Nation", 1800.0, "Food", "Food", 0.95, True, 0.98,
         "Transaction of ₹1,800 is +1004% higher than your historical Food average of ₹163."),
        (datetime(2026, 9, 21), "Subway sub and soda", 280.0, "Food", "Food", 0.94, False, 0.05, None),
        (datetime(2026, 9, 23), "Lunch at Canteen", 120.0, "Food", "Food", 0.96, False, 0.03, None),
        (datetime(2026, 9, 24), "Mess monthly supplementary", 1100.0, "Food", "Food", 0.94, False, 0.12, None),

        # Transportation: ₹2,100 total
        (datetime(2026, 9, 3), "Metro card recharge", 500.0, "Transportation", "Transportation", 0.97, False, 0.03, None),
        (datetime(2026, 9, 7), "Uber to College", 180.0, "Transportation", "Transportation", 0.94, False, 0.02, None),
        (datetime(2026, 9, 10), "City bus fare to library", 70.0, "Transportation", "Transportation", 0.95, False, 0.01, None),
        (datetime(2026, 9, 13), "Rapido bike ride to tech park", 120.0, "Transportation", "Transportation", 0.95, False, 0.02, None),
        (datetime(2026, 9, 17), "Uber cab to central railway", 380.0, "Transportation", "Transportation", 0.95, False, 0.04, None),
        (datetime(2026, 9, 20), "Ola auto fare", 150.0, "Transportation", "Transportation", 0.94, False, 0.02, None),
        (datetime(2026, 9, 23), "Uber to College", 180.0, "Transportation", "Transportation", 0.94, False, 0.02, None),
        (datetime(2026, 9, 25), "Metro smart card top-up", 520.0, "Transportation", "Transportation", 0.96, False, 0.03, None),

        # Shopping: ₹3,200 total (+77.8% MoM vs ₹1,800 in Aug)
        (datetime(2026, 9, 9), "Amazon wireless headphones", 2400.0, "Shopping", "Shopping", 0.91, False, 0.25, None),
        (datetime(2026, 9, 19), "Flipkart laptop sleeve and mouse", 800.0, "Shopping", "Shopping", 0.93, False, 0.10, None),

        # Education: ₹1,500 total
        (datetime(2026, 9, 6), "Python textbook Amazon", 850.0, "Education", "Education", 0.93, False, 0.04, None),
        (datetime(2026, 9, 15), "Project report color printing", 500.0, "Education", "Education", 0.95, False, 0.03, None),
        (datetime(2026, 9, 22), "Stationery notebooks and markers", 150.0, "Education", "Education", 0.92, False, 0.01, None),

        # Entertainment: ₹900 total
        (datetime(2026, 9, 12), "PVR Cinemas movie tickets", 500.0, "Entertainment", "Entertainment", 0.96, False, 0.05, None),
        (datetime(2026, 9, 20), "Steam weekend game pass", 400.0, "Entertainment", "Entertainment", 0.95, False, 0.04, None),

        # Subscriptions: ₹798 total (Netflix ₹199, Spotify ₹119, Cloud storage ₹299, Hotstar ₹181)
        (datetime(2026, 9, 11), "Spotify student subscription", 119.0, "Subscriptions", "Subscriptions", 0.97, False, 0.02, None),
        (datetime(2026, 9, 17), "Cloud storage renewal", 299.0, "Subscriptions", "Subscriptions", 0.96, False, 0.02, None),
        (datetime(2026, 9, 21), "Netflix monthly subscription", 199.0, "Subscriptions", "Subscriptions", 0.97, False, 0.02, None),
        (datetime(2026, 9, 25), "Disney+ Hotstar mobile pack", 181.0, "Subscriptions", "Subscriptions", 0.96, False, 0.02, None),

        # Other / Bills: ₹2,582 total
        (datetime(2026, 9, 4), "Airtel broadband wifi share", 550.0, "Bills", "Bills", 0.95, False, 0.03, None),
        (datetime(2026, 9, 10), "Room electricity bill", 650.0, "Bills", "Bills", 0.94, False, 0.03, None),
        (datetime(2026, 9, 15), "Hostel laundry service", 382.0, "Other", "Other", 0.90, False, 0.02, None),
        (datetime(2026, 9, 26), "Hostel room maintenance fee", 1000.0, "Accommodation", "Accommodation", 0.94, False, 0.08, None)
    ]

    for dt, desc, amt, ai_cat, final_cat, conf, is_anom, anom_sc, anom_reas in september_expenses:
        t = Transaction(
            user_id=user.id,
            date=dt,
            description=desc,
            amount=amt,
            type="expense",
            ai_category=ai_cat,
            final_category=final_cat,
            ai_confidence=conf,
            anomaly_score=anom_sc,
            is_anomaly=is_anom,
            anomaly_reason=anom_reas,
            merchant_normalized=desc.split()[0],
            payment_method="UPI"
        )
        db.add(t)

    # 4. Set Category Budgets for September 2026
    # Food: ₹5,000 (spent ₹4,500, projected ₹5,300 -> exceeds budget alert!)
    # Transportation: ₹2,500
    # Shopping: ₹3,000 (spent ₹3,200 -> over budget!)
    # Entertainment: ₹1,500
    # Education: ₹2,000
    # Subscriptions: ₹1,000
    budgets_data = [
        ("Food", 5000.0),
        ("Transportation", 2500.0),
        ("Shopping", 3000.0),
        ("Education", 2000.0),
        ("Entertainment", 1500.0),
        ("Subscriptions", 1000.0),
        ("Bills", 1500.0),
        ("Other", 3500.0)
    ]

    for cat, amt in budgets_data:
        b = Budget(
            user_id=user.id,
            month="2026-09",
            category=cat,
            amount=amt
        )
        db.add(b)

    # 5. Recurring Subscriptions Records
    recurring_data = [
        ("Netflix", "Subscriptions", 199.0, "Monthly", 4, datetime(2026, 9, 21), 0.98),
        ("Spotify", "Subscriptions", 119.0, "Monthly", 4, datetime(2026, 9, 11), 0.97),
        ("Google Cloud Storage", "Subscriptions", 299.0, "Monthly", 3, datetime(2026, 9, 17), 0.96)
    ]

    for merch, cat, amt, freq, occ, last_dt, conf in recurring_data:
        rec = RecurringExpense(
            user_id=user.id,
            merchant=merch,
            category=cat,
            amount=amt,
            frequency=freq,
            occurrences=occ,
            last_detected=last_dt,
            confidence=conf,
            is_active=True
        )
        db.add(rec)

    # 6. Cached Forecast for October 2026
    fc = Forecast(
        user_id=user.id,
        period="2026-10",
        category="Total",
        predicted_amount=16800.0,
        lower_bound=15500.0,
        upper_bound=18100.0,
        method="Weighted Moving Average + Linear Trend"
    )
    db.add(fc)

    db.commit()

    token = create_access_token(data={"sub": user.email})
    return {
        "message": "Demo profile seeded successfully with 3 months of realistic student transactions.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "university": user.university,
            "monthly_income": user.monthly_income,
            "monthly_budget": user.monthly_budget,
            "currency": user.currency
        }
    }
