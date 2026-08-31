import math
from typing import Dict, Any, List

# ICAR Soil Test Crop Response (STCR) coefficients
# Nutrient requirement (NR) in kg per ton of grain, soil efficiency (CS), fertilizer efficiency (CF)
STCR_COEFFICIENTS = {
    "Wheat": {
        "N": {"nr_per_ton": 25.0, "cs": 0.42, "cf": 0.48, "desc": "FN = (25.0 * T - 0.42 * SN) / 0.48"},
        "P2O5": {"nr_per_ton": 9.0, "cs": 0.38, "cf": 0.35, "desc": "FP = (9.0 * T - 0.38 * SP) / 0.35"},
        "K2O": {"nr_per_ton": 22.0, "cs": 0.20, "cf": 0.50, "desc": "FK = (22.0 * T - 0.20 * SK) / 0.50"}
    },
    "Rice": {
        "N": {"nr_per_ton": 22.5, "cs": 0.45, "cf": 0.45, "desc": "FN = (22.5 * T - 0.45 * SN) / 0.45"},
        "P2O5": {"nr_per_ton": 8.5, "cs": 0.40, "cf": 0.38, "desc": "FP = (8.5 * T - 0.40 * SP) / 0.38"},
        "K2O": {"nr_per_ton": 21.0, "cs": 0.18, "cf": 0.48, "desc": "FK = (21.0 * T - 0.18 * SK) / 0.48"}
    },
    "Maize": {
        "N": {"nr_per_ton": 26.0, "cs": 0.40, "cf": 0.46, "desc": "FN = (26.0 * T - 0.40 * SN) / 0.46"},
        "P2O5": {"nr_per_ton": 10.0, "cs": 0.35, "cf": 0.36, "desc": "FP = (10.0 * T - 0.35 * SP) / 0.36"},
        "K2O": {"nr_per_ton": 24.0, "cs": 0.19, "cf": 0.52, "desc": "FK = (24.0 * T - 0.19 * SK) / 0.52"}
    },
    "Cotton": {
        "N": {"nr_per_ton": 45.0, "cs": 0.38, "cf": 0.42, "desc": "FN = (45.0 * T - 0.38 * SN) / 0.42"},
        "P2O5": {"nr_per_ton": 18.0, "cs": 0.32, "cf": 0.32, "desc": "FP = (18.0 * T - 0.32 * SP) / 0.32"},
        "K2O": {"nr_per_ton": 40.0, "cs": 0.22, "cf": 0.55, "desc": "FK = (40.0 * T - 0.22 * SK) / 0.55"}
    },
    "Sugarcane": {
        "N": {"nr_per_ton": 1.8, "cs": 0.35, "cf": 0.40, "desc": "FN = (1.8 * T - 0.35 * SN) / 0.40"},
        "P2O5": {"nr_per_ton": 0.8, "cs": 0.30, "cf": 0.30, "desc": "FP = (0.8 * T - 0.30 * SP) / 0.30"},
        "K2O": {"nr_per_ton": 2.2, "cs": 0.18, "cf": 0.50, "desc": "FK = (2.2 * T - 0.18 * SK) / 0.50"}
    }
}

class FertilizerService:
    @staticmethod
    def calculate_stcr_dosage(
        crop: str,
        target_yield_t_ha: float,
        area_acres: float,
        soil_nitrogen_kg_ha: float = 240.0,
        soil_p_kg_ha: float = 18.0,
        soil_k_kg_ha: float = 180.0,
        soil_ph: float = 6.4
    ) -> Dict[str, Any]:
        """
        Calculate precision fertilizer requirements using ICAR Soil Test Crop Response (STCR) equations.
        Converts elemental requirements into commercial bags (50 kg) of Urea (46% N), DAP (18% N, 46% P2O5), and MOP (60% K2O).
        """
        area_ha = area_acres * 0.404686
        crop_name = crop if crop in STCR_COEFFICIENTS else "Wheat"
        coeff = STCR_COEFFICIENTS[crop_name]

        # 1. Calculate nutrient requirements per hectare (kg/ha)
        n_req_ha = max(0.0, (coeff["N"]["nr_per_ton"] * target_yield_t_ha - coeff["N"]["cs"] * soil_nitrogen_kg_ha) / coeff["N"]["cf"])
        p_req_ha = max(0.0, (coeff["P2O5"]["nr_per_ton"] * target_yield_t_ha - coeff["P2O5"]["cs"] * soil_p_kg_ha) / coeff["P2O5"]["cf"])
        k_req_ha = max(0.0, (coeff["K2O"]["nr_per_ton"] * target_yield_t_ha - coeff["K2O"]["cs"] * soil_k_kg_ha) / coeff["K2O"]["cf"])

        # 2. Total pure nutrient requirements for the designated farm area (kg)
        total_n_kg = n_req_ha * area_ha
        total_p_kg = p_req_ha * area_ha
        total_k_kg = k_req_ha * area_ha

        # 3. Commercial fertilizer conversions
        # DAP (18% N, 46% P2O5)
        dap_kg = total_p_kg / 0.46 if total_p_kg > 0 else 0.0
        n_from_dap = dap_kg * 0.18

        # Urea (46% N) satisfies remaining Nitrogen demand
        remaining_n_kg = max(0.0, total_n_kg - n_from_dap)
        urea_kg = remaining_n_kg / 0.46

        # MOP (60% K2O)
        mop_kg = total_k_kg / 0.60 if total_k_kg > 0 else 0.0

        # Commercial 50 kg bags
        urea_bags = math.ceil(urea_kg / 50.0) if urea_kg > 0 else 0
        dap_bags = math.ceil(dap_kg / 50.0) if dap_kg > 0 else 0
        mop_bags = math.ceil(mop_kg / 50.0) if mop_kg > 0 else 0

        # 4. Standard Blanket vs STCR Savings estimation (Govt / Subsidized Price: Urea ~ ₹268/bag, DAP ~ ₹1350/bag, MOP ~ ₹1700/bag)
        blanket_urea_bags = math.ceil(area_ha * 4.5)
        blanket_dap_bags = math.ceil(area_ha * 2.5)
        blanket_cost = (blanket_urea_bags * 268) + (blanket_dap_bags * 1350)
        stcr_cost = (urea_bags * 268) + (dap_bags * 1350) + (mop_bags * 1700)
        cost_savings_inr = max(0, blanket_cost - stcr_cost)

        # 5. Split application schedule
        schedule = [
            {
                "stage": "Basal Application (At Sowing / Transplanting)",
                "timing": "Day 0",
                "dap_bags": dap_bags,
                "urea_bags": math.ceil(urea_bags * 0.33),
                "mop_bags": mop_bags,
                "notes": "100% of Phosphorus (DAP) and Potassium (MOP) placed 5cm below seed furrow with 1/3rd Nitrogen."
            },
            {
                "stage": "1st Top Dressing (Crown Root Initiation / Vegetative)",
                "timing": "21 - 25 DAS",
                "dap_bags": 0,
                "urea_bags": math.ceil(urea_bags * 0.33),
                "mop_bags": 0,
                "notes": "Broadcast after first irrigation when topsoil is moist."
            },
            {
                "stage": "2nd Top Dressing (Tillering / Panicle Initiation)",
                "timing": "45 - 50 DAS",
                "dap_bags": 0,
                "urea_bags": max(0, urea_bags - math.ceil(urea_bags * 0.33) * 2),
                "mop_bags": 0,
                "notes": "Final booster dose before heading stage for maximum grain filling."
            }
        ]

        # Soil pH adjustment recommendation
        ph_guidance = None
        if soil_ph < 6.0:
            ph_guidance = f"Soil pH ({soil_ph}) is acidic. Apply Agricultural Lime / Dolomite @ 250 kg/acre to prevent Phosphorus fixation."
        elif soil_ph > 7.8:
            ph_guidance = f"Soil pH ({soil_ph}) is alkaline. Apply Gypsum @ 200 kg/acre or Sulphur to enhance Zinc and Iron uptake."

        return {
            "crop": crop_name,
            "target_yield_t_ha": target_yield_t_ha,
            "area_acres": area_acres,
            "area_ha": round(area_ha, 2),
            "stcr_equation": coeff["N"]["desc"],
            "nutrient_requirements_kg": {
                "nitrogen_n": round(total_n_kg, 1),
                "phosphorus_p2o5": round(total_p_kg, 1),
                "potassium_k2o": round(total_k_kg, 1)
            },
            "fertilizer_recommendation": {
                "urea_bags_50kg": urea_bags,
                "urea_total_kg": round(urea_kg, 1),
                "dap_bags_50kg": dap_bags,
                "dap_total_kg": round(dap_kg, 1),
                "mop_bags_50kg": mop_bags,
                "mop_total_kg": round(mop_kg, 1)
            },
            "application_schedule": schedule,
            "financial_optimization": {
                "stcr_cost_inr": stcr_cost,
                "blanket_cost_inr": blanket_cost,
                "estimated_savings_inr": cost_savings_inr,
                "environmental_benefit": "Zero runoff nitrogen waste; protects groundwater nitrate table."
            },
            "soil_ph_guidance": ph_guidance
        }

fertilizer_service = FertilizerService()
