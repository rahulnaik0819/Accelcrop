import os
from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from google import genai

router = APIRouter()

SYSTEM_PROMPT = """You are Vaidya AI, a world-class senior agronomic advisor for ACCELCORP / AgriVision.
You have access to real-time farm telemetry data, ICAR STCR fertilizer calculations, FAO-56 evapotranspiration models, and satellite vegetation indices.
Answer the farmer's questions scientifically, contextually, and actionably.
Format your response using clean Markdown:
- Use bullet points and bold highlights for agronomic recommendations.
- Cite specific metrics (e.g. soil pH, moisture %, ETo water demand in mm, recommended Urea/DAP bags).
- If appropriate, suggest a field action using one of the interactive action tags:
  `[Action: Apply Micro-Irrigation Task]`
  `[Action: Optimize Fertilizer Dosage]`
  `[Action: Schedule Leaf Sampling]`
  `[Action: Audit Water & Pump Logs]`
This will render as an interactive button on the farmer's dashboard.
"""

def get_fallback_reply(message: str, context: dict | None) -> str:
    msg = message.lower()
    moisture = context.get("moisture_pct", 21.4) if context else 21.4
    field = context.get("active_field", "Field 01") if context else "Field 01"
    yield_val = context.get("forecasted_yield_tons", 612) if context else 612
    variance = context.get("yield_variance_pct", -3.7) if context else -3.7
    temp = context.get("temperature_c", 28) if context else 28
    ph = context.get("soil_ph", 6.4) if context else 6.4

    if "fertilizer" in msg or "urea" in msg or "dap" in msg or "dosage" in msg or "stcr" in msg:
        return f"""### 🧪 ICAR STCR Fertilizer Recommendation for **{field}**
Based on soil pH (**{ph}**) and target yield (**5.5 t/ha**):

**Targeted Nutrient Dosage:**
* **Urea (46% N):** Apply **2 bags/acre** (split into 3 stages: Basal, 21 DAS, 45 DAS).
* **DAP (18% N, 46% P₂O₅):** Apply **1.5 bags/acre** strictly at sowing (Basal).
* **MOP (60% K₂O):** Apply **1 bag/acre** at basal placement.

**Agronomic Guidance:**
* Splitting Nitrogen applications prevents nitrate leaching and saves ~₹1,850/hectare.
* Apply zinc sulphate (ZnSO₄ @ 10 kg/acre) during first top dressing for enhanced grain filling.

Click below to apply this dosage to your active activity log:
[Action: Optimize Fertilizer Dosage]"""

    elif "water" in msg or "pump" in msg or "irrigation" in msg or "moisture" in msg or "restore" in msg:
        return f"""### 💧 Irrigation & Water Demand Audit: **{field}**
Your current soil moisture is **{moisture}%** (below the 25.0% threshold), while farm water usage is at **74%**.

**FAO-56 Water Management Protocol:**
* **Reference ETo:** Crop demand is currently **4.2 mm/day** (~17,000 Litres/acre/day).
* **Pump Scheduling:** Operate 5 HP pump for **45–60 minutes** during early morning (05:30–07:30 AM) to curb daytime evaporation by 28%.
* **Mulching:** Apply organic crop-residue mulch in lagging parcels.

Click below to schedule irrigation:
[Action: Apply Micro-Irrigation Task]"""

    elif "variance" in msg or "yield" in msg or "recover" in msg or "forecast" in msg:
        return f"""### 🌾 Yield Variance Recovery Strategy
The current forecasted yield is **{yield_val} tons** (**{variance}% variance** against baseline).

**Recovery Protocol:**
* **Nutrient Calibration:** Soil pH is **{ph}**. Calibrate micro-nutrients, particularly zinc and nitrogen ratios, to accelerate tiller initiation.
* **Foliar Feed:** Apply a seaweed-extract or 19:19:19 NPK foliar spray (1% concentration) to relieve abiotic stress.
* **Drone Analysis:** Run a multi-spectral scan to locate the exact NDVI variance clusters.

Click below to apply fertilizer optimization:
[Action: Optimize Fertilizer Dosage]"""

    elif "risk" in msg or "soil" in msg or "sampling" in msg or "ph" in msg:
        return f"""### 🔍 Soil & Crop Health Assessment: **{field}**
Telemetry shows soil pH at **{ph}** and ambient temperature at **{temp}°C**.

**Action Plan:**
* **Leaf Tissue Analysis:** Perform immediate nitrogen-phosphorus tests to confirm absorption efficiency.
* **pH Buffering:** If pH dips below 6.0, schedule agricultural lime / dolomite application.
* **Labor Coordination:** Ensure 8 labor-hours/acre are allocated for weeding and canopy aerification.

Click below to queue sampling:
[Action: Schedule Leaf Sampling]"""

    return f"""### 👋 Welcome to Vaidya AI
I am monitoring **{field}** with **{moisture}% moisture** and **{ph} pH**. 

How can I help you today? You can ask:
* "What is the optimal STCR fertilizer dosage?"
* "How do I restore moisture balance with FAO-56 ETo demand?"
* "What is causing the {variance}% yield variance?"
* "Run a comprehensive risk assessment on {field}."
"""

@router.post("/chat", response_model=ChatResponse)
def chat_with_vaidya(request: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        mock_reply = get_fallback_reply(request.message, request.telemetry_context)
        return ChatResponse(reply=mock_reply)

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"System Context:\n{SYSTEM_PROMPT}\n"
        if request.telemetry_context:
            prompt += f"Current Farm Telemetry & Agro-climatic Context:\n{request.telemetry_context}\n"
        prompt += f"Farmer Question: {request.message}\n"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return ChatResponse(reply=response.text)
    except Exception as e:
        mock_reply = get_fallback_reply(request.message, request.telemetry_context)
        return ChatResponse(reply=f"*(Gemini API Error: {str(e)}. Displaying offline recommendations)*\n\n{mock_reply}")
