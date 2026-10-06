/**
 * Agent 3: Autonomous Sourcing & Pharma Supplier Negotiator (Gemini AI Agent)
 * Evaluates candidate pharma distributors, validates GxP & cold-chain compliance,
 * optimizes volume discounts, and generates formal Purchase Orders (PO).
 */

class SourcingNegotiatorAgent {
  constructor(geminiService, suppliersDatabase) {
    this.name = "Pharma Sourcing & Negotiator Agent";
    this.role = "Supplier Evaluation & Purchase Order Generator";
    this.geminiService = geminiService;
    this.suppliersDatabase = suppliersDatabase || [];
    this.status = "IDLE";
  }

  async selectSupplierAndDraftPO(medicine, demandForecast) {
    this.status = "EVALUATING_SUPPLIERS";

    const candidateSuppliers = this.suppliersDatabase.filter(s => {
      // Filter by category or fallback to all
      return s.supportedCategories.includes(medicine.category) || s.gxCompliant;
    });

    const startTime = performance.now();
    const sourcingDecision = await this.geminiService.negotiateSourcing({
      medicine,
      orderQuantity: demandForecast.recommendedOrderQuantity,
      suppliers: candidateSuppliers.length > 0 ? candidateSuppliers : this.suppliersDatabase,
      urgency: demandForecast.suggestedUrgency
    });
    const latencyMs = Math.round(performance.now() - startTime);

    this.status = "PO_DRAFTED";

    const poRecord = {
      poNumber: sourcingDecision.poNumber || `PO-PHARM-${Date.now().toString().slice(-6)}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosageForm: medicine.dosageForm,
      quantity: demandForecast.recommendedOrderQuantity,
      unit: medicine.unit,
      supplierId: sourcingDecision.selectedSupplierId,
      supplierName: sourcingDecision.selectedSupplierName,
      unitPriceAgreed: sourcingDecision.unitPriceAgreed,
      discountAppliedPercent: sourcingDecision.discountAppliedPercent || 0,
      totalOrderCost: sourcingDecision.totalOrderCost,
      deliverySlaHours: sourcingDecision.deliverySlaHours,
      coldChainGuaranteed: sourcingDecision.coldChainGuaranteed,
      complianceNotes: sourcingDecision.complianceNotes,
      humanApprovalRequired: sourcingDecision.humanApprovalRequired,
      thoughtTrace: sourcingDecision.thoughtProcess,
      status: sourcingDecision.humanApprovalRequired ? "PENDING_HITL_APPROVAL" : "AUTO_APPROVED",
      generatedAt: new Date().toLocaleTimeString(),
      latencyMs
    };

    return poRecord;
  }
}

window.SourcingNegotiatorAgent = SourcingNegotiatorAgent;
