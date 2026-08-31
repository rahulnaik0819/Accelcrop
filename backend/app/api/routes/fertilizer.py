from fastapi import APIRouter
from app.models.schemas import FertilizerOptimizeRequest, FertilizerOptimizeResponse, ScheduleItem
from app.services.fertilizer_service import fertilizer_service

router = APIRouter()

@router.post("/optimize", response_model=FertilizerOptimizeResponse)
def optimize_fertilizer(req: FertilizerOptimizeRequest):
    """
    Calculate precision targeted yield fertilizer recommendations using ICAR Soil Test Crop Response (STCR) equations.
    Outputs exact bags of Urea (50kg), DAP (50kg), and MOP (50kg), plus stage-by-stage split schedule.
    """
    res = fertilizer_service.calculate_stcr_dosage(
        crop=req.crop,
        target_yield_t_ha=req.target_yield_t_ha,
        area_acres=req.area_acres,
        soil_nitrogen_kg_ha=req.soil_nitrogen_kg_ha or 240.0,
        soil_p_kg_ha=req.soil_p_kg_ha or 18.0,
        soil_k_kg_ha=req.soil_k_kg_ha or 180.0,
        soil_ph=req.soil_ph or 6.4
    )

    schedule_items = [
        ScheduleItem(
            stage=item["stage"],
            timing=item["timing"],
            dap_bags=item["dap_bags"],
            urea_bags=item["urea_bags"],
            mop_bags=item["mop_bags"],
            notes=item["notes"]
        )
        for item in res["application_schedule"]
    ]

    return FertilizerOptimizeResponse(
        crop=res["crop"],
        target_yield_t_ha=res["target_yield_t_ha"],
        area_acres=res["area_acres"],
        area_ha=res["area_ha"],
        stcr_equation=res["stcr_equation"],
        nutrient_requirements_kg=res["nutrient_requirements_kg"],
        fertilizer_recommendation=res["fertilizer_recommendation"],
        application_schedule=schedule_items,
        financial_optimization=res["financial_optimization"],
        soil_ph_guidance=res.get("soil_ph_guidance")
    )
