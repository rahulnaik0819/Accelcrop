from fastapi import APIRouter
from app.models.schemas import PredictRequest, PredictResponse, BatchFieldPredictRequest, BatchFieldPredictResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
def predict_yield(request: PredictRequest):
    """
    Predict crop yield for a single farm/zone using XGBoost inference pipeline or calibrated regression.
    """
    return ml_service.predict_yield(request)

@router.post("/predict/fields", response_model=BatchFieldPredictResponse)
def predict_batch_fields(request: BatchFieldPredictRequest):
    """
    Dynamic Batch Field Prediction: Computes individual parcel yields and aggregated production
    totals for N custom user-drawn field polygons.
    """
    return ml_service.predict_batch_fields(request)
