// Types matching backend Pydantic schemas

export interface ResourceUsage {
  water_pct: number;
  labor_pct: number;
  equipment_idle_pct: number;
}

export interface SensorReadings {
  soil_moisture_pct: number;
  soil_ph: number;
  temperature_c: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface PredictRequest {
  crop_type?: string;
  zone_id?: string;
  soil_ph?: number;
  soil_moisture_pct?: number;
  temperature_c?: number;
  area_acres?: number;
  state?: string;
  season?: string;
  annual_rainfall?: number;
  fertilizer_kg_ha?: number;
  pesticide_kg_ha?: number;
}

export interface PredictResponse {
  predicted_yield_tonnes_per_ha: number;
  total_production_tonnes?: number;
  confidence_interval_tonnes?: ConfidenceInterval;
  variance_pct: number;
  resource_usage: ResourceUsage;
  sensor_readings: SensorReadings;
}

// ─── Dynamic Batch Field Prediction ───────────────────────────────────────────
export interface FieldParcelInput {
  id: string;
  name: string;
  crop_type: string;
  area_acres: number;
  soil_ph: number;
  soil_moisture_pct: number;
  temperature_c: number;
  polygon_coordinates?: number[][];
}

export interface FieldParcelPrediction {
  id: string;
  name: string;
  crop_type: string;
  area_acres: number;
  area_ha: number;
  predicted_yield_tonnes_per_ha: number;
  total_production_tonnes: number;
  confidence_interval_tonnes: ConfidenceInterval;
  health_status: 'Optimal' | 'Below Optimal' | 'Critical';
}

export interface BatchFieldPredictRequest {
  fields: FieldParcelInput[];
}

export interface BatchFieldPredictResponse {
  total_acres: number;
  total_production_tonnes: number;
  average_yield_tonnes_per_ha: number;
  field_predictions: FieldParcelPrediction[];
}

export interface FieldActivity {
  activity: string;
  status: 'Completed' | 'Upcoming' | 'Running';
}

export interface DashboardOverview {
  active_farm_schedule: string;
  cultivated_area_acres: number;
  active_crop_zones: number;
  field_activity_statuses: FieldActivity[];
}

export interface FieldTelemetry {
  vegetation_index: number;
  moisture_pct: number;
}

export interface FieldZone {
  field_id: string;
  polygon_coordinates: number[][];
  telemetry: FieldTelemetry;
}

export interface FieldZonesResponse {
  fields: FieldZone[];
}

// ─── Digital Soil & Weather Telemetry ─────────────────────────────────────────
export interface TelemetryRequest {
  lat: number;
  lng: number;
  crop?: string;
  area_acres?: number;
  polygon_coords?: number[][];
}

export interface CurrentWeather {
  temperature_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  surface_pressure_hpa: number;
}

export interface DailyWeather {
  dates: string[];
  temp_max: (number | null)[];
  temp_min: (number | null)[];
  precipitation_sum_mm: (number | null)[];
  solar_radiation_mj_m2: (number | null)[];
  et0_fao_evapotranspiration_mm: (number | null)[];
}

export interface SoilProperties {
  source: string;
  soil_ph: number;
  nitrogen_cg_kg: number;
  nitrogen_kg_ha_equiv: number;
  organic_carbon_g_kg: number;
  organic_carbon_rating: string;
  soil_texture_class: string;
}

export interface WaterDemand {
  crop: string;
  reference_eto_mm_day: number;
  crop_coefficient_kc: number;
  daily_crop_water_demand_mm: number;
  daily_water_per_acre_liters: number;
  total_daily_liters: number;
  weekly_water_liters: number;
  recommended_daily_pump_runtime_minutes: number;
  efficiency_advice: string;
}

export interface TelemetryResponse {
  coordinates: { lat: number; lng: number };
  weather_source: string;
  current: CurrentWeather;
  daily_forecast_16day: DailyWeather;
  soil_properties: SoilProperties;
  fao56_water_demand: WaterDemand;
}

// ─── Fertilizer Optimizer ─────────────────────────────────────────────────────
export interface FertilizerOptimizeRequest {
  crop: string;
  target_yield_t_ha: number;
  area_acres: number;
  soil_nitrogen_kg_ha?: number;
  soil_p_kg_ha?: number;
  soil_k_kg_ha?: number;
  soil_ph?: number;
}

export interface ScheduleItem {
  stage: string;
  timing: string;
  dap_bags: number;
  urea_bags: number;
  mop_bags: number;
  notes: string;
}

export interface FertilizerOptimizeResponse {
  crop: string;
  target_yield_t_ha: number;
  area_acres: number;
  area_ha: number;
  stcr_equation: string;
  nutrient_requirements_kg: {
    nitrogen_n: number;
    phosphorus_p2o5: number;
    potassium_k2o: number;
  };
  fertilizer_recommendation: {
    urea_bags_50kg: number;
    urea_total_kg: number;
    dap_bags_50kg: number;
    dap_total_kg: number;
    mop_bags_50kg: number;
    mop_total_kg: number;
  };
  application_schedule: ScheduleItem[];
  financial_optimization: {
    stcr_cost_inr: number;
    blanket_cost_inr: number;
    estimated_savings_inr: number;
    environmental_benefit: string;
  };
  soil_ph_guidance?: string;
}

// ─── Water & Labor Audit ──────────────────────────────────────────────────────
export interface WaterLaborAuditRequest {
  pump_hp: number;
  pump_runtime_hours: number;
  cultivated_area_acres: number;
  assigned_workers: number;
  worker_hours_per_day?: number;
  flow_rate_lpm?: number;
  activity?: string;
}

export interface WaterAuditResult {
  pump_hp: number;
  pump_runtime_hours: number;
  total_water_pumped_liters: number;
  standard_demand_liters: number;
  water_usage_pct: number;
  threshold_exceeded: boolean;
  recommendation: string;
}

export interface LaborAuditResult {
  activity: string;
  cultivated_area_acres: number;
  assigned_workers: number;
  hours_per_worker_day: number;
  required_labor_hours: number;
  available_labor_hours: number;
  labor_shortage_hours: number;
  labor_efficiency_pct: number;
  warning?: string;
}

export interface WaterLaborAuditResponse {
  water_audit: WaterAuditResult;
  labor_audit: LaborAuditResult;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  telemetry_context?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
}

// ─── Mock fallback data ───────────────────────────────────────────────────────
export const MOCK_DASHBOARD: DashboardOverview = {
  active_farm_schedule: 'Harvesting Phase',
  cultivated_area_acres: 128,
  active_crop_zones: 6,
  field_activity_statuses: [
    { activity: 'Soil pH Calibration', status: 'Completed' },
    { activity: 'Leaf Sampling', status: 'Upcoming' },
    { activity: 'Micro-Irrigation', status: 'Running' },
  ],
};

export const MOCK_PREDICT: PredictResponse = {
  predicted_yield_tonnes_per_ha: 45.2,
  total_production_tonnes: 2341.3,
  confidence_interval_tonnes: { lower: 2254.7, upper: 2427.9 },
  variance_pct: -3.7,
  resource_usage: { water_pct: 74, labor_pct: 22, equipment_idle_pct: 4 },
  sensor_readings: { soil_moisture_pct: 21.4, soil_ph: 6.4, temperature_c: 28 },
};

export const MOCK_ZONES: FieldZonesResponse = {
  fields: [
    { field_id: 'Field 01', polygon_coordinates: [[30.9035, 75.8520], [30.9035, 75.8570], [30.9005, 75.8570], [30.9005, 75.8520]], telemetry: { vegetation_index: 0.82, moisture_pct: 21.4 } },
    { field_id: 'Field 02', polygon_coordinates: [[30.9035, 75.8590], [30.9035, 75.8640], [30.9005, 75.8640], [30.9005, 75.8590]], telemetry: { vegetation_index: 0.75, moisture_pct: 19.8 } },
    { field_id: 'Field 03', polygon_coordinates: [[30.8975, 75.8520], [30.8975, 75.8570], [30.8945, 75.8570], [30.8945, 75.8520]], telemetry: { vegetation_index: 0.90, moisture_pct: 25.0 } },
    { field_id: 'Field 04', polygon_coordinates: [[30.8975, 75.8590], [30.8975, 75.8640], [30.8945, 75.8640], [30.8945, 75.8590]], telemetry: { vegetation_index: 0.65, moisture_pct: 15.2 } },
  ],
};

export const MOCK_TELEMETRY: TelemetryResponse = {
  coordinates: { lat: 30.9010, lng: 75.8570 },
  weather_source: "Open-Meteo Live API",
  current: {
    temperature_c: 28.4,
    humidity_pct: 58.0,
    precipitation_mm: 0.0,
    wind_speed_kmh: 11.5,
    surface_pressure_hpa: 1013.2,
  },
  daily_forecast_16day: {
    dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15', 'Day 16'],
    temp_max: [30.1, 31.0, 29.5, 28.0, 29.2, 30.5, 31.2, 32.0, 31.5, 30.0, 29.1, 28.5, 29.0, 30.0, 31.0, 30.5],
    temp_min: [18.5, 19.0, 17.5, 16.8, 17.5, 18.2, 18.9, 19.5, 19.0, 18.2, 17.5, 17.0, 17.8, 18.5, 19.0, 18.6],
    precipitation_sum_mm: [0, 0, 1.2, 6.5, 2.0, 0, 0, 0, 0, 4.2, 8.0, 1.5, 0, 0, 0, 0],
    solar_radiation_mj_m2: [18.5, 19.2, 17.8, 14.5, 16.0, 18.8, 19.5, 20.0, 20.2, 16.5, 13.0, 16.8, 19.0, 19.5, 19.8, 19.0],
    et0_fao_evapotranspiration_mm: [4.5, 4.8, 4.2, 3.5, 3.8, 4.5, 4.9, 5.1, 5.0, 4.0, 3.2, 3.9, 4.6, 4.8, 4.9, 4.6],
  },
  soil_properties: {
    source: "ISRIC SoilGrids 2.0",
    soil_ph: 6.45,
    nitrogen_cg_kg: 142.0,
    nitrogen_kg_ha_equiv: 255.6,
    organic_carbon_g_kg: 5.4,
    organic_carbon_rating: "Medium (0.54%)",
    soil_texture_class: "Alluvial Sandy Clay Loam"
  },
  fao56_water_demand: {
    crop: "Wheat",
    reference_eto_mm_day: 4.5,
    crop_coefficient_kc: 1.15,
    daily_crop_water_demand_mm: 5.18,
    daily_water_per_acre_liters: 20962.0,
    total_daily_liters: 2683136.0,
    weekly_water_liters: 18781952.0,
    recommended_daily_pump_runtime_minutes: 59.6,
    efficiency_advice: "Run micro-drip loops between 05:30 - 08:00 AM to reduce evaporative losses by up to 28%."
  }
};

export const MOCK_FERTILIZER_OPTIMIZE: FertilizerOptimizeResponse = {
  crop: "Wheat",
  target_yield_t_ha: 5.5,
  area_acres: 128.0,
  area_ha: 51.8,
  stcr_equation: "FN = (25.0 * T - 0.42 * SN) / 0.48",
  nutrient_requirements_kg: {
    nitrogen_n: 3239.1,
    phosphorus_p2o5: 13725.3,
    potassium_k2o: 14676.6
  },
  fertilizer_recommendation: {
    urea_bags_50kg: 65,
    urea_total_kg: 3239.1,
    dap_bags_50kg: 275,
    dap_total_kg: 13725.3,
    mop_bags_50kg: 294,
    mop_total_kg: 14676.6
  },
  application_schedule: [
    {
      stage: "Basal Application (At Sowing / Transplanting)",
      timing: "Day 0",
      dap_bags: 275,
      urea_bags: 22,
      mop_bags: 294,
      notes: "100% of Phosphorus (DAP) and Potassium (MOP) placed 5cm below seed furrow with 1/3rd Nitrogen."
    },
    {
      stage: "1st Top Dressing (Crown Root Initiation / Vegetative)",
      timing: "21 - 25 DAS",
      dap_bags: 0,
      urea_bags: 22,
      mop_bags: 0,
      notes: "Broadcast after first irrigation when topsoil is moist."
    },
    {
      stage: "2nd Top Dressing (Tillering / Panicle Initiation)",
      timing: "45 - 50 DAS",
      dap_bags: 0,
      urea_bags: 21,
      mop_bags: 0,
      notes: "Final booster dose before heading stage for maximum grain filling."
    }
  ],
  financial_optimization: {
    stcr_cost_inr: 888470,
    blanket_cost_inr: 1042450,
    estimated_savings_inr: 153980,
    environmental_benefit: "Zero runoff nitrogen waste; protects groundwater nitrate table."
  },
  soil_ph_guidance: "Soil pH (6.4) is ideal for wheat. No acid/lime amendment required."
};

export const MOCK_WATER_LABOR_AUDIT: WaterLaborAuditResponse = {
  water_audit: {
    pump_hp: 5.0,
    pump_runtime_hours: 4.5,
    total_water_pumped_liters: 121500.0,
    standard_demand_liters: 2071040.0,
    water_usage_pct: 74.0,
    threshold_exceeded: false,
    recommendation: "Water consumption is optimized at 74%. Within seasonal allocation."
  },
  labor_audit: {
    activity: "weeding",
    cultivated_area_acres: 128.0,
    assigned_workers: 4,
    hours_per_worker_day: 8.0,
    required_labor_hours: 1024.0,
    available_labor_hours: 32.0,
    labor_shortage_hours: 992.0,
    labor_efficiency_pct: 3.1,
    warning: "Labor bottleneck detected: 1024.0 hours needed for weeding across 128 acres, but only 32.0 hours available. Recommend assigning +124 additional worker(s)."
  }
};

// ─── API Client ───────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:8000';

async function fetchWithFallback<T>(url: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    console.warn(`[AgriVision] API offline – using fallback for ${url}`);
    return fallback;
  }
}

export const api = {
  getDashboard: () => fetchWithFallback('/api/dashboard/overview', MOCK_DASHBOARD),

  predict: (req: PredictRequest) =>
    fetchWithFallback<PredictResponse>('/api/predict', MOCK_PREDICT, {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  predictBatchFields: (req: BatchFieldPredictRequest) =>
    fetchWithFallback<BatchFieldPredictResponse>('/api/predict/fields', {
      total_acres: req.fields.reduce((acc, f) => acc + f.area_acres, 0),
      total_production_tonnes: 2341.3,
      average_yield_tonnes_per_ha: 45.2,
      field_predictions: req.fields.map((f) => ({
        id: f.id,
        name: f.name,
        crop_type: f.crop_type,
        area_acres: f.area_acres,
        area_ha: f.area_acres * 0.404686,
        predicted_yield_tonnes_per_ha: 45.2,
        total_production_tonnes: 45.2 * f.area_acres * 0.404686,
        confidence_interval_tonnes: {
          lower: 45.2 * f.area_acres * 0.404686 * 0.963,
          upper: 45.2 * f.area_acres * 0.404686 * 1.037,
        },
        health_status: (f.soil_moisture_pct < 16 ? 'Critical' : f.soil_moisture_pct < 22 ? 'Below Optimal' : 'Optimal') as 'Optimal' | 'Below Optimal' | 'Critical',
      })),
    }, {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  getZones: () => fetchWithFallback('/api/fields/zones', MOCK_ZONES),

  fetchTelemetry: (req: TelemetryRequest) =>
    fetchWithFallback<TelemetryResponse>('/api/telemetry/fetch', MOCK_TELEMETRY, {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  optimizeFertilizer: (req: FertilizerOptimizeRequest) =>
    fetchWithFallback<FertilizerOptimizeResponse>('/api/fertilizer/optimize', MOCK_FERTILIZER_OPTIMIZE, {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  auditWaterLabor: (req: WaterLaborAuditRequest) =>
    fetchWithFallback<WaterLaborAuditResponse>('/api/water-labor/audit', MOCK_WATER_LABOR_AUDIT, {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  chat: (req: ChatRequest) =>
    fetchWithFallback<ChatResponse>('/api/chat', { reply: 'Vaidya AI is offline right now. Please try again shortly.' }, {
      method: 'POST',
      body: JSON.stringify(req),
    }),
};
