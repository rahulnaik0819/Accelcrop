from fastapi import APIRouter
from app.api.routes import predict, dashboard, fields, chat, telemetry, fertilizer, water_labor

api_router = APIRouter()
api_router.include_router(predict.router, tags=["predict"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(fields.router, prefix="/fields", tags=["fields"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
api_router.include_router(fertilizer.router, prefix="/fertilizer", tags=["fertilizer"])
api_router.include_router(water_labor.router, prefix="/water-labor", tags=["water-labor"])
