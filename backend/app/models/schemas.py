from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ResourceUsage(BaseModel):
    water_pct: float
    labor_pct: float
    equipment_idle_pct: float

class SensorReadings(BaseModel):
    soil_moisture_pct: float
    soil_ph: float
    temperature_c: float

# ─── Predict ──────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    crop_type: str = Field("Wheat", description="Type of crop")
    zone_id: Optional[str] = Field("Z1", description="ID of the crop zone")
    soil_ph: float = Field(6.4, description="Soil pH level")
    soil_moisture_pct: float = Field(21.4, description="Soil moisture percentage")
    temperature_c: float = Field(28.0, description="Temperature in Celsius")
    area_acres: Optional[float] = Field(128.0, description="Total cultivated area in acres")
    state: Optional[str] = Field("Punjab", description="Indian State")
    season: Optional[str] = Field("Rabi", description="Crop season: Kharif / Rabi / Zaid")
    annual_rainfall: Optional[float] = Field(650.0, description="Annual rainfall in mm")
    fertilizer_kg_ha: Optional[float] = Field(180.0, description="Baseline fertilizer in kg/ha")
    pesticide_kg_ha: Optional[float] = Field(3.5, description="Pesticide in kg/ha")

class ConfidenceInterval(BaseModel):
    lower: float
    upper: float

class PredictResponse(BaseModel):
    predicted_yield_tonnes_per_ha: float
    total_production_tonnes: Optional[float] = None
    confidence_interval_tonnes: Optional[ConfidenceInterval] = None
    variance_pct: float
    resource_usage: ResourceUsage
    sensor_readings: SensorReadings

# ─── Dynamic Batch Field Prediction ───────────────────────────────────────────
class FieldParcelInput(BaseModel):
    id: str = Field(..., description="Unique field ID")
    name: str = Field(..., description="Field name (e.g. Field 01)")
    crop_type: str = Field("Wheat", description="Crop type")
    area_acres: float = Field(32.0, description="Parcel area in acres")
    soil_ph: float = Field(6.4, description="Soil pH")
    soil_moisture_pct: float = Field(21.4, description="Soil moisture percentage")
    temperature_c: float = Field(28.0, description="Temperature in Celsius")
    polygon_coordinates: Optional[List[List[float]]] = Field(None, description="Lat/Lng boundary vertices")

class FieldParcelPrediction(BaseModel):
    id: str
    name: str
    crop_type: str
    area_acres: float
    area_ha: float
    predicted_yield_tonnes_per_ha: float
    total_production_tonnes: float
    confidence_interval_tonnes: ConfidenceInterval
    health_status: str

class BatchFieldPredictRequest(BaseModel):
    fields: List[FieldParcelInput]

class BatchFieldPredictResponse(BaseModel):
    total_acres: float
    total_production_tonnes: float
    average_yield_tonnes_per_ha: float
    field_predictions: List[FieldParcelPrediction]

# ─── Telemetry / Open-Meteo / SoilGrids ────────────────────────────────────────
class TelemetryRequest(BaseModel):
    lat: float = Field(30.9010, description="Latitude (e.g. Punjab: 30.9010)")
    lng: float = Field(75.8570, description="Longitude (e.g. Punjab: 75.8570)")
    crop: Optional[str] = Field("Wheat", description="Target crop")
    area_acres: Optional[float] = Field(128.0, description="Farm area in acres")
    polygon_coords: Optional[List[List[float]]] = Field(None, description="Optional polygon coordinate vertices")

class CurrentWeather(BaseModel):
    temperature_c: float
    humidity_pct: float
    precipitation_mm: float
    wind_speed_kmh: float
    surface_pressure_hpa: float

class DailyWeather(BaseModel):
    dates: List[str]
    temp_max: List[Optional[float]]
    temp_min: List[Optional[float]]
    precipitation_sum_mm: List[Optional[float]]
    solar_radiation_mj_m2: List[Optional[float]]
    et0_fao_evapotranspiration_mm: List[Optional[float]]

class SoilProperties(BaseModel):
    source: str
    soil_ph: float
    nitrogen_cg_kg: float
    nitrogen_kg_ha_equiv: float
    organic_carbon_g_kg: float
    organic_carbon_rating: str
    soil_texture_class: str

class WaterDemand(BaseModel):
    crop: str
    reference_eto_mm_day: float
    crop_coefficient_kc: float
    daily_crop_water_demand_mm: float
    daily_water_per_acre_liters: float
    total_daily_liters: float
    weekly_water_liters: float
    recommended_daily_pump_runtime_minutes: float
    efficiency_advice: str

class TelemetryResponse(BaseModel):
    coordinates: Dict[str, float]
    weather_source: str
    current: CurrentWeather
    daily_forecast_16day: DailyWeather
    soil_properties: SoilProperties
    fao56_water_demand: WaterDemand

# ─── Fertilizer Optimization ──────────────────────────────────────────────────
class FertilizerOptimizeRequest(BaseModel):
    crop: str = Field("Wheat", description="Target crop")
    target_yield_t_ha: float = Field(5.5, description="Target yield in tonnes per hectare")
    area_acres: float = Field(128.0, description="Land area in acres")
    soil_nitrogen_kg_ha: Optional[float] = Field(240.0, description="Soil available Nitrogen")
    soil_p_kg_ha: Optional[float] = Field(18.0, description="Soil available Phosphorus")
    soil_k_kg_ha: Optional[float] = Field(180.0, description="Soil available Potassium")
    soil_ph: Optional[float] = Field(6.4, description="Soil pH")

class ScheduleItem(BaseModel):
    stage: str
    timing: str
    dap_bags: int
    urea_bags: int
    mop_bags: int
    notes: str

class FertilizerOptimizeResponse(BaseModel):
    crop: str
    target_yield_t_ha: float
    area_acres: float
    area_ha: float
    stcr_equation: str
    nutrient_requirements_kg: Dict[str, float]
    fertilizer_recommendation: Dict[str, Any]
    application_schedule: List[ScheduleItem]
    financial_optimization: Dict[str, Any]
    soil_ph_guidance: Optional[str] = None

# ─── Water & Labor Audit ──────────────────────────────────────────────────────
class WaterLaborAuditRequest(BaseModel):
    pump_hp: float = Field(5.0, description="Pump Horsepower (HP)")
    pump_runtime_hours: float = Field(4.5, description="Daily pump runtime in hours")
    cultivated_area_acres: float = Field(128.0, description="Cultivated area in acres")
    assigned_workers: int = Field(4, description="Number of assigned field workers")
    worker_hours_per_day: Optional[float] = Field(8.0, description="Working hours per worker per day")
    flow_rate_lpm: Optional[float] = Field(None, description="Optional custom pump flow rate in LPM")
    activity: Optional[str] = Field("weeding", description="Field activity: weeding / harvesting / land_prep")

class WaterLaborAuditResponse(BaseModel):
    water_audit: Dict[str, Any]
    labor_audit: Dict[str, Any]

# ─── Chat ─────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    telemetry_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
