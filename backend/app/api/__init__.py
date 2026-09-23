from fastapi import APIRouter
from .auth import router as auth_router
from .transactions import router as transactions_router
from .budgets import router as budgets_router
from .analytics import router as analytics_router
from .anomalies import router as anomalies_router
from .recurring import router as recurring_router
from .forecast import router as forecast_router
from .insights import router as insights_router
from .qa import router as qa_router
from .profile import router as profile_router
from .csv_import import router as csv_router
from .demo import router as demo_router
from .evaluation import router as evaluation_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(transactions_router)
api_router.include_router(budgets_router)
api_router.include_router(analytics_router)
api_router.include_router(anomalies_router)
api_router.include_router(recurring_router)
api_router.include_router(forecast_router)
api_router.include_router(insights_router)
api_router.include_router(qa_router)
api_router.include_router(profile_router)
api_router.include_router(csv_router)
api_router.include_router(demo_router)
api_router.include_router(evaluation_router)
