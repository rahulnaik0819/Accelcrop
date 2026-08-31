from fastapi import APIRouter

router = APIRouter()

@router.get("/overview")
def get_dashboard_overview():
    return {
        "active_farm_schedule": "Harvesting Phase",
        "cultivated_area_acres": 128,
        "active_crop_zones": 6,
        "field_activity_statuses": [
            {"activity": "Soil pH Calibration", "status": "Completed"},
            {"activity": "Leaf Sampling", "status": "Upcoming"},
            {"activity": "Micro-Irrigation", "status": "Running"}
        ]
    }
