from fastapi import APIRouter
from app.models.schemas import WaterLaborAuditRequest, WaterLaborAuditResponse
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/audit", response_model=WaterLaborAuditResponse)
def audit_water_and_labor(req: WaterLaborAuditRequest):
    """
    Audit irrigation pump runtime vs seasonal threshold (74%) and calculate labor shortages
    using ICAR agronomic benchmark hours (weeding, harvesting, land prep).
    """
    res = ml_service.audit_water_and_labor(
        pump_hp=req.pump_hp,
        pump_runtime_hours=req.pump_runtime_hours,
        cultivated_area_acres=req.cultivated_area_acres,
        assigned_workers=req.assigned_workers,
        worker_hours_per_day=req.worker_hours_per_day or 8.0,
        flow_rate_lpm=req.flow_rate_lpm,
        activity=req.activity or "weeding"
    )

    return WaterLaborAuditResponse(
        water_audit=res["water_audit"],
        labor_audit=res["labor_audit"]
    )
