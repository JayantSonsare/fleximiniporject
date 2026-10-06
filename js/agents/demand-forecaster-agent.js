/**
 * Agent 2: Epidemiological & Demand Forecaster (Gemini AI Agent)
 * Analyzes disease trends, seasonal patterns, hospital admissions, and runout times
 * to forecast optimal restock batch sizing and urgency ratings.
 */

class DemandForecasterAgent {
  constructor(geminiService) {
    this.name = "Epidemiological & Demand Forecaster Agent";
    this.role = "Dynamic Consumption & Surge Intelligence";
    this.geminiService = geminiService;
    this.status = "IDLE";
  }

  async analyzeAndForecast(medicine, hospitalContext = "", epidemicTrend = "") {
    this.status = "REASONING";

    const startTime = performance.now();
    const forecast = await this.geminiService.forecastDemand({
      medicine,
      hospitalContext,
      epidemicTrend
    });
    const latencyMs = Math.round(performance.now() - startTime);

    this.status = "COMPLETED";

    const result = {
      agent: this.name,
      medicineId: medicine.id,
      medicineName: medicine.name,
      thoughtTrace: forecast.thoughtProcess,
      surgeRiskLevel: forecast.surgeRiskLevel,
      projectedRunoutHours: forecast.projectedRunoutHours,
      recommendedOrderQuantity: forecast.recommendedOrderQuantity,
      suggestedUrgency: forecast.suggestedUrgency,
      keyFactors: forecast.keyFactors,
      confidenceScore: forecast.confidenceScore || 0.95,
      latencyMs,
      timestamp: new Date().toLocaleTimeString()
    };

    return result;
  }
}

window.DemandForecasterAgent = DemandForecasterAgent;
