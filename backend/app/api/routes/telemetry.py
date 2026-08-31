from fastapi import APIRouter
from app.models.schemas import TelemetryRequest, TelemetryResponse, CurrentWeather, DailyWeather, SoilProperties, WaterDemand
from app.services.soil_weather_service import soil_weather_service

router = APIRouter()

@router.post("/fetch", response_model=TelemetryResponse)
def fetch_telemetry(req: TelemetryRequest):
    """
    Fetch zero-hardware digital soil and weather telemetry:
    1. Open-Meteo live current weather + 16-day rainfall/temp forecast
    2. SoilGrids 2.0 baseline pH, nitrogen, and soil organic carbon
    3. FAO-56 Penman-Monteith reference evapotranspiration & crop water demand
    """
    lat = req.lat
    lng = req.lng
    area_acres = req.area_acres or 128.0

    # If polygon coordinates are supplied, calculate centroid if coords differ from default
    if req.polygon_coords and len(req.polygon_coords) >= 3:
        avg_lat = sum(p[0] for p in req.polygon_coords) / len(req.polygon_coords)
        avg_lng = sum(p[1] for p in req.polygon_coords) / len(req.polygon_coords)
        if not lat or not lng or (lat == 30.9010 and lng == 75.8570 and (abs(avg_lat - 30.9010) > 0.0001 or abs(avg_lng - 75.8570) > 0.0001)):
            lat = round(avg_lat, 6)
            lng = round(avg_lng, 6)

    weather_data = soil_weather_service.get_weather_forecast(lat, lng)
    soil_data = soil_weather_service.get_soil_properties(lat, lng)
    
    # Calculate FAO-56 ETo demand using 1st day forecast ETo or default
    et0_list = weather_data.get("daily", {}).get("et0_fao_evapotranspiration_mm", [4.2])
    first_day_et0 = et0_list[0] if et0_list and len(et0_list) > 0 and et0_list[0] is not None else 4.2
    
    water_demand_data = soil_weather_service.calculate_fao56_evapotranspiration(
        crop=req.crop or "Wheat",
        et0_mm_day=first_day_et0,
        area_acres=area_acres
    )

    return TelemetryResponse(
        coordinates={"lat": lat, "lng": lng},
        weather_source=weather_data.get("source", "Open-Meteo Live API"),
        current=CurrentWeather(**weather_data.get("current", {})),
        daily_forecast_16day=DailyWeather(**weather_data.get("daily", {})),
        soil_properties=SoilProperties(**soil_data),
        fao56_water_demand=WaterDemand(**water_demand_data)
    )

