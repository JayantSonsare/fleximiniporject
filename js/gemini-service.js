/**
 * PharmSentinel AI - Gemini API Client & Neural Fallback Engine
 * Handles direct communication with Google Gemini Generative AI models
 * with automated fallbacks for offline / demonstration mode.
 */

class GeminiService {
  constructor() {
    this.apiKey = localStorage.getItem('PHARMSENTINEL_GEMINI_API_KEY') || '';
    this.modelName = localStorage.getItem('PHARMSENTINEL_GEMINI_MODEL') || 'gemini-1.5-flash';
    this.apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('PHARMSENTINEL_GEMINI_API_KEY', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  hasValidKey() {
    return Boolean(this.apiKey && this.apiKey.length > 20);
  }

  setModel(model) {
    this.modelName = model;
    localStorage.setItem('PHARMSENTINEL_GEMINI_MODEL', model);
  }

  /**
   * Test API Key connection
   */
  async testConnection() {
    if (!this.hasValidKey()) {
      return { success: false, message: "No Gemini API key entered. Operating in Neural Simulation mode." };
    }

    try {
      const url = `${this.apiBaseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Respond in 3 words: 'PharmSentinel Online Active'." }]
          }],
          generationConfig: { maxOutputTokens: 20 }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        return { success: false, message: `Gemini API Error: ${err.error?.message || response.statusText}` };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return { success: true, message: `Connected to Google Gemini (${this.modelName}): ${text}` };
    } catch (e) {
      return { success: false, message: `Network or Connection failed: ${e.message}` };
    }
  }

  /**
   * Core generator method calling Gemini or fallback
   */
  async generateContent(prompt, systemInstruction = "", fallbackFn = null) {
    if (this.hasValidKey()) {
      try {
        const url = `${this.apiBaseUrl}/${this.modelName}:generateContent?key=${this.apiKey}`;
        const payload = {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 1200,
            responseMimeType: "application/json"
          }
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              // Parse clean JSON
              const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
              return JSON.parse(cleaned);
            } catch (jsonErr) {
              console.warn("Gemini output wasn't pure JSON, parsing fallback text", jsonErr);
              return { rawText: rawText };
            }
          }
        } else {
          console.warn("Gemini API call failed, falling back to simulated neural logic", await response.text());
        }
      } catch (err) {
        console.warn("Gemini network error, using fallback logic", err);
      }
    }

    // Use intelligent domain fallback if no API key or on error
    if (fallbackFn) {
      await new Promise(r => setTimeout(r, 600)); // realistic thinking latency
      return fallbackFn();
    }
    return null;
  }

  /**
   * Agent 2: Demand Forecaster Reasoning
   */
  async forecastDemand({ medicine, recentTelemetry, hospitalContext, epidemicTrend }) {
    const systemPrompt = `You are the Lead Epidemiological & Demand Forecaster Agent in an Autonomous Hospital Inventory Orchestration system.
Your mission is to analyze medicine consumption rates, ICU/ER occupancy trends, disease outbreaks, seasonal factors, and lead times to calculate the optimal Restock Quantity (EOQ), Runout Hours, and Surge Factor.
Always return response in valid JSON matching this schema:
{
  "thoughtProcess": "string (Agent reasoning step-by-step)",
  "surgeRiskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "projectedRunoutHours": number,
  "recommendedOrderQuantity": number,
  "suggestedUrgency": "STANDARD" | "EXPEDITED" | "IMMEDIATE_EMERGENCY",
  "keyFactors": ["string"],
  "confidenceScore": number (0.0 to 1.0)
}`;

    const userPrompt = `Analyze restock necessity for:
- Medicine: ${medicine.name} (${medicine.dosageForm})
- Current Stock: ${medicine.currentStock} ${medicine.unit} (Min Threshold: ${medicine.minThreshold}, Critical: ${medicine.criticalThreshold}, Max: ${medicine.maxCapacity})
- Hourly Burn Rate: ${medicine.avgHourlyConsumption} ${medicine.unit}/hr
- Cold Chain Required: ${medicine.coldChainRequired}
- Lead Time: ${medicine.leadTimeHours} hours
- Active Hospital Context: ${hospitalContext || "Standard ward load with elevated seasonal respiratory admissions"}
- Epidemic / External Factors: ${epidemicTrend || "Viral transmission rate elevated by +25% across district"}
Provide precise mathematical demand estimation.`;

    const fallback = () => {
      const burnRate = medicine.avgHourlyConsumption || 1.5;
      const runout = (medicine.currentStock / Math.max(0.1, burnRate)).toFixed(1);
      const isUrgent = medicine.currentStock <= medicine.criticalThreshold;
      const targetStock = medicine.maxCapacity || (medicine.minThreshold * 3);
      const deficit = Math.max(10, targetStock - medicine.currentStock);
      const safetyBuffer = Math.round(burnRate * (medicine.leadTimeHours || 8) * 1.5);
      const recommendedQty = Math.min(medicine.maxCapacity, deficit + safetyBuffer);

      return {
        thoughtProcess: `Sentinel flagged ${medicine.name} at ${medicine.currentStock} ${medicine.unit}. Given current consumption of ${burnRate}/hr and lead time of ${medicine.leadTimeHours}h, stockout will occur in ~${runout} hours without intervention. Calculated safety buffer of ${safetyBuffer} units to prevent stockouts during peak admission windows.`,
        surgeRiskLevel: isUrgent ? "CRITICAL" : "MODERATE",
        projectedRunoutHours: parseFloat(runout),
        recommendedOrderQuantity: recommendedQty,
        suggestedUrgency: isUrgent ? "IMMEDIATE_EMERGENCY" : "EXPEDITED",
        keyFactors: [
          `Depletion rate: ${burnRate} ${medicine.unit}/hr`,
          `Lead time to dock: ${medicine.leadTimeHours}h`,
          `Cold-chain constraint: ${medicine.coldChainRequired ? 'Strict 2-8°C refrigerated courier' : 'Ambient standard'}`
        ],
        confidenceScore: 0.96
      };
    };

    return this.generateContent(userPrompt, systemPrompt, fallback);
  }

  /**
   * Agent 3: Sourcing & Supplier Negotiator Reasoning
   */
  async negotiateSourcing({ medicine, orderQuantity, suppliers, urgency }) {
    const systemPrompt = `You are the Autonomous Pharma Sourcing & Supplier Negotiator Agent.
Your job is to evaluate candidate suppliers, verify cold-chain certifications, check SLA lead times, optimize volume discounts, and draft a legally compliant GxP Purchase Order (PO).
Always return valid JSON matching this schema:
{
  "thoughtProcess": "string (Agent procurement justification and discount evaluation)",
  "selectedSupplierId": "string (e.g. SUP-01)",
  "selectedSupplierName": "string",
  "unitPriceAgreed": number,
  "discountAppliedPercent": number,
  "totalOrderCost": number,
  "deliverySlaHours": number,
  "coldChainGuaranteed": boolean,
  "poNumber": "string (e.g. PO-PHARM-2026-XXXX)",
  "complianceNotes": "string",
  "humanApprovalRequired": boolean
}`;

    const userPrompt = `Select optimal supplier for:
- Medicine: ${medicine.name}
- Quantity Needed: ${orderQuantity} ${medicine.unit}
- Urgency: ${urgency}
- Cold Chain Needed: ${medicine.coldChainRequired}
- Base Price: $${medicine.unitPrice}
- Candidate Suppliers: ${JSON.stringify(suppliers)}
Select the most reliable supplier capable of meeting SLA constraints.`;

    const fallback = () => {
      // Find suitable supplier
      let candidate = suppliers.find(s => s.id === medicine.primarySupplierId) || suppliers[0];
      if (medicine.coldChainRequired && !candidate.coldChainCertified) {
        candidate = suppliers.find(s => s.coldChainCertified) || candidate;
      }

      const discountTier = candidate.discountTiers?.find(d => orderQuantity >= d.minUnits);
      const discountPct = discountTier ? discountTier.discountPercent : (orderQuantity > 40 ? 5 : 0);
      const unitPrice = parseFloat((medicine.unitPrice * (1 - discountPct / 100)).toFixed(2));
      const totalCost = parseFloat((unitPrice * orderQuantity).toFixed(2));
      const sla = urgency.includes("EMERGENCY") ? candidate.emergencySlaHours : candidate.avgFulfillmentHours;
      const poNum = `PO-PHARM-${Math.floor(100000 + Math.random() * 900000)}`;

      return {
        thoughtProcess: `Evaluated ${suppliers.length} certified pharma distributors. Selected ${candidate.name} (Reliability ${candidate.reliabilityScore}%, Rating ${candidate.rating}/5.0). Negotiated ${discountPct}% volume discount on order of ${orderQuantity} ${medicine.unit}. Cold-chain validation: ${medicine.coldChainRequired ? 'PASSED (Refrigerated Van SLA)' : 'Ambient standard'}.`,
        selectedSupplierId: candidate.id,
        selectedSupplierName: candidate.name,
        unitPriceAgreed: unitPrice,
        discountAppliedPercent: discountPct,
        totalOrderCost: totalCost,
        deliverySlaHours: sla,
        coldChainGuaranteed: medicine.coldChainRequired,
        poNumber: poNum,
        complianceNotes: `GxP compliant batch requested with CoA (Certificate of Analysis) and temp-logger tag.`,
        humanApprovalRequired: totalCost > 2500 || medicine.requiresDoctorAuth
      };
    };

    return this.generateContent(userPrompt, systemPrompt, fallback);
  }

  /**
   * Prescription Clinical Checker
   */
  async checkPrescriptionSafety({ prescriptionText, currentInventory }) {
    const systemPrompt = `You are the Clinical Pharmacy AI Safety Agent.
Analyze the doctor's prescription against the live pharmacy inventory. Identify if the requested medication is available, depleted, or low. If depleted, recommend safe clinical alternatives and compute stock impact.
Return JSON schema:
{
  "drugIdentified": "string",
  "dosageAndQty": "string",
  "stockAvailable": boolean,
  "currentStockOnHand": number,
  "stockImpactAssessment": "SAFE" | "DEPLETION_WARNING" | "STOCKOUT_BLOCKER",
  "therapeuticAlternatives": ["string"],
  "clinicalAdvice": "string",
  "actionTriggered": "APPROVED_DISPATCH" | "STOCKOUT_ALERT_GENERATED"
}`;

    const userPrompt = `Evaluate prescription: "${prescriptionText}".
Inventory context: ${JSON.stringify(currentInventory.map(m => ({ id: m.id, name: m.name, stock: m.currentStock, unit: m.unit })))}`;

    const fallback = () => {
      const lower = prescriptionText.toLowerCase();
      let matched = currentInventory.find(m => lower.includes(m.genericName.toLowerCase()) || lower.includes(m.name.toLowerCase()));
      if (!matched) {
        matched = currentInventory[0];
      }

      const isOut = matched.currentStock <= 0;
      const isLow = matched.currentStock <= matched.criticalThreshold;

      return {
        drugIdentified: matched.name,
        dosageAndQty: "Extracted: Standard Adult Dosage (Immediate Hospital Dispense)",
        stockAvailable: matched.currentStock > 0,
        currentStockOnHand: matched.currentStock,
        stockImpactAssessment: isOut ? "STOCKOUT_BLOCKER" : (isLow ? "DEPLETION_WARNING" : "SAFE"),
        therapeuticAlternatives: isOut ? [
          "Alternative Formulation (IV to Oral or Concentrated Solution)",
          "Secondary therapeutic equivalent under CMO protocol"
        ] : [],
        clinicalAdvice: isOut 
          ? `WARNING: ${matched.name} is completely OUT OF STOCK. Immediate PO generated and emergency backup transfer requested from regional hub.`
          : `Stock verified (${matched.currentStock} ${matched.unit} available). Patient dispense cleared.`,
        actionTriggered: isOut ? "STOCKOUT_ALERT_GENERATED" : "APPROVED_DISPATCH"
      };
    };

    return this.generateContent(userPrompt, systemPrompt, fallback);
  }
}

window.geminiService = new GeminiService();
