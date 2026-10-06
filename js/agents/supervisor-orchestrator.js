/**
 * Agent 5: Autonomous Supervisor & HITL Orchestration Agent
 * Coordinates multi-agent collaboration, maintains ReAct thought traces,
 * handles Human-in-the-Loop approval policies, and triggers auto-pilot restocks.
 */

class SupervisorOrchestrator {
  constructor(options = {}) {
    this.name = "Autonomous Supervisor Orchestrator";
    this.role = "Multi-Agent Workflow Master & Policy Enforcer";
    
    this.medicines = options.medicines || [];
    this.suppliers = options.suppliers || [];
    this.geminiService = options.geminiService || window.geminiService;
    this.audioSystem = options.audioSystem || window.audioAlerts;

    // Sub-Agents
    this.sentinelAgent = new InventorySentinelAgent();
    this.forecasterAgent = new DemandForecasterAgent(this.geminiService);
    this.sourcingAgent = new SourcingNegotiatorAgent(this.geminiService, this.suppliers);
    this.dispatchAgent = new AlertDispatchAgent(this.audioSystem);

    // Orchestrator State
    this.isAutoPilot = true; // Auto-approves orders under threshold
    this.autoPilotThreshold = 2500; // USD
    this.isLiveTickerActive = false;
    this.tickerInterval = null;
    
    this.activeWorkflowState = "IDLE"; // IDLE, SCANNING, REASONING, NEGOTIATING, DISPATCHING, COMPLETED
    this.agentThoughtTraces = [];
    this.purchaseOrders = [];
    this.auditLogs = [];

    this.listeners = [];

    // Initialize agent listeners
    this.sentinelAgent.onScan(event => this.handleSentinelEvent(event));
    this.dispatchAgent.onAlert(alert => this.handleAlertEvent(alert));
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notifyStateChange(eventPayload) {
    this.listeners.forEach(fn => fn(eventPayload));
  }

  logTrace({ agent, role, step, thought, data, latencyMs }) {
    const trace = {
      id: `TRC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      agent,
      role,
      step,
      thought,
      data,
      latencyMs: latencyMs || 0
    };
    this.agentThoughtTraces.unshift(trace);
    if (this.agentThoughtTraces.length > 80) this.agentThoughtTraces.pop();
    this.notifyStateChange({ type: "NEW_TRACE", data: trace });
  }

  logAudit(action, details) {
    const log = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
  }

  /**
   * Run one full Autonomous Agentic Loop for an item or all items
   */
  async runAutonomousCycle(targetMedicineId = null) {
    this.activeWorkflowState = "SCANNING";
    this.notifyStateChange({ type: "WORKFLOW_START", state: this.activeWorkflowState });

    this.logTrace({
      agent: this.name,
      role: "Workflow Master",
      step: "INITIATE_SWEEP",
      thought: `Initiating multi-agent telemetry sweep across ${targetMedicineId ? 'target SKU: ' + targetMedicineId : 'all active pharmacy inventory'}.`
    });

    let targetItems = [];
    if (targetMedicineId) {
      const med = this.medicines.find(m => m.id === targetMedicineId);
      if (med) {
        const evalRes = this.sentinelAgent.evaluateMedicine(med);
        targetItems.push({ medicine: med, evaluation: evalRes });
      }
    } else {
      const sweep = this.sentinelAgent.runTelemetrySweep(this.medicines);
      targetItems = sweep.triggeredItems;
    }

    if (targetItems.length === 0) {
      this.activeWorkflowState = "IDLE";
      this.logTrace({
        agent: this.sentinelAgent.name,
        role: this.sentinelAgent.role,
        step: "TELEMETRY_HEALTHY",
        thought: `All inventory SKUs are currently within nominal safety bands. No emergency intervention needed.`
      });
      this.notifyStateChange({ type: "WORKFLOW_END", state: "HEALTHY" });
      return;
    }

    // Process each triggered item sequentially through the agent pipeline
    for (const item of targetItems) {
      const med = item.medicine;
      const evaluation = item.evaluation;

      // 1. Sentinel Detection Trace
      this.logTrace({
        agent: this.sentinelAgent.name,
        role: this.sentinelAgent.role,
        step: "ANOMALY_TRIGGERED",
        thought: `Stockout risk detected for [${med.name}]. Current Stock: ${med.currentStock} ${med.unit} (Min: ${med.minThreshold}, Critical: ${med.criticalThreshold}). Projected runout: ${evaluation.runoutHours} hours. Handing off to Demand Forecaster Agent.`,
        data: evaluation
      });

      // 2. Forecaster Agent
      this.activeWorkflowState = "REASONING";
      this.notifyStateChange({ type: "STATE_CHANGE", state: this.activeWorkflowState, activeMedicine: med });

      const forecast = await this.forecasterAgent.analyzeAndForecast(med);
      this.logTrace({
        agent: this.forecasterAgent.name,
        role: this.forecasterAgent.role,
        step: "DEMAND_FORECAST_GENERATED",
        thought: forecast.thoughtTrace,
        data: {
          recommendedOrderQuantity: forecast.recommendedOrderQuantity,
          urgency: forecast.suggestedUrgency,
          surgeRisk: forecast.surgeRiskLevel,
          confidence: forecast.confidenceScore
        },
        latencyMs: forecast.latencyMs
      });

      // 3. Sourcing & Negotiator Agent
      this.activeWorkflowState = "NEGOTIATING";
      this.notifyStateChange({ type: "STATE_CHANGE", state: this.activeWorkflowState, activeMedicine: med });

      const poRecord = await this.sourcingAgent.selectSupplierAndDraftPO(med, forecast);
      
      // Auto-Pilot Decision Gate
      if (this.isAutoPilot && poRecord.totalOrderCost <= this.autoPilotThreshold && !med.requiresDoctorAuth) {
        poRecord.status = "AUTO_APPROVED";
        poRecord.approvalNote = `Autonomous Auto-Pilot policy: Cost ($${poRecord.totalOrderCost}) is under threshold ($${this.autoPilotThreshold}).`;
      } else {
        poRecord.status = "PENDING_HITL_APPROVAL";
        poRecord.approvalNote = poRecord.totalOrderCost > this.autoPilotThreshold 
          ? `Requires Human Approval: Order cost ($${poRecord.totalOrderCost}) exceeds autonomous threshold.`
          : `Requires Doctor Sign-off: High-potency / Controlled clinical substance.`;
      }

      this.purchaseOrders.unshift(poRecord);

      this.logTrace({
        agent: this.sourcingAgent.name,
        role: this.sourcingAgent.role,
        step: "PO_DRAFTED",
        thought: poRecord.thoughtTrace,
        data: {
          poNumber: poRecord.poNumber,
          supplier: poRecord.supplierName,
          cost: `$${poRecord.totalOrderCost}`,
          status: poRecord.status
        },
        latencyMs: poRecord.latencyMs
      });

      // 4. Alert & Dispatch Agent
      this.activeWorkflowState = "DISPATCHING";
      this.notifyStateChange({ type: "STATE_CHANGE", state: this.activeWorkflowState, activeMedicine: med });

      const alert = this.dispatchAgent.dispatchStockAlert({
        medicine: med,
        evaluation,
        forecast,
        poRecord
      });

      this.logTrace({
        agent: this.dispatchAgent.name,
        role: this.dispatchAgent.role,
        step: "OMNICHANNEL_ALERT_DISPATCHED",
        thought: `Broadcasted multi-channel alerts to Hospital Banner, CMO SMS, and Pharmacy Slack. Audio chime triggered.`,
        data: { alertId: alert.id, channels: alert.channelsDispatched.map(c => c.channel) }
      });

      this.logAudit("RESTOCK_CYCLE_RUN", `Executed agentic cycle for ${med.name}. Status: ${poRecord.status}`);
    }

    this.activeWorkflowState = "COMPLETED";
    this.notifyStateChange({ type: "WORKFLOW_END", state: this.activeWorkflowState });
  }

  handleSentinelEvent(event) {
    this.notifyStateChange({ type: "SENTINEL_SWEEP", data: event.data });
  }

  handleAlertEvent(alert) {
    this.notifyStateChange({ type: "NEW_ALERT", alert });
  }

  /**
   * Human-in-the-Loop (HITL) manual approval
   */
  approvePurchaseOrder(poNumber) {
    const po = this.purchaseOrders.find(p => p.poNumber === poNumber);
    if (!po) return false;

    po.status = "MANUALLY_APPROVED";
    po.approvedAt = new Date().toLocaleTimeString();
    po.approvedBy = "Chief Pharmacist (HITL Sign-off)";

    this.audioSystem?.playSuccessChime();

    this.logTrace({
      agent: this.name,
      role: "HITL Governance",
      step: "HITL_APPROVED",
      thought: `Human Operator approved PO #${poNumber} for ${po.quantity} ${po.unit} of ${po.medicineName} (${po.supplierName}). Restock order dispatched to supplier EDI gateway.`
    });

    this.logAudit("PO_APPROVED", `PO #${poNumber} approved by Chief Pharmacist.`);
    this.notifyStateChange({ type: "PO_UPDATED", po });
    return true;
  }

  /**
   * Reject PO
   */
  rejectPurchaseOrder(poNumber, reason = "Admin override") {
    const po = this.purchaseOrders.find(p => p.poNumber === poNumber);
    if (!po) return false;

    po.status = "REJECTED";
    po.rejectionReason = reason;

    this.logTrace({
      agent: this.name,
      role: "HITL Governance",
      step: "HITL_REJECTED",
      thought: `Human Operator rejected PO #${poNumber}. Reason: ${reason}. Escalation flagged.`
    });

    this.logAudit("PO_REJECTED", `PO #${poNumber} rejected.`);
    this.notifyStateChange({ type: "PO_UPDATED", po });
    return true;
  }

  /**
   * Execute delivery fulfillment (Simulated supplier arrival)
   */
  fulfillRestock(poNumber) {
    const po = this.purchaseOrders.find(p => p.poNumber === poNumber);
    if (!po) return false;

    const med = this.medicines.find(m => m.id === po.medicineId);
    if (med) {
      med.currentStock = Math.min(med.maxCapacity, med.currentStock + po.quantity);
      this.sentinelAgent.evaluateMedicine(med);
    }

    po.status = "FULFILLED_DELIVERED";
    po.fulfilledAt = new Date().toLocaleTimeString();

    this.audioSystem?.playSuccessChime();

    this.logTrace({
      agent: this.name,
      role: "Inventory Ledger",
      step: "RESTOCK_RECEIVED",
      thought: `Shipment for PO #${poNumber} received at Dock #3. Inspected cold-chain loggers, verified batch CoA, and replenished +${po.quantity} ${po.unit} of [${po.medicineName}]. Stock now: ${med ? med.currentStock : 'N/A'}.`
    });

    this.logAudit("RESTOCK_FULFILLED", `Replenished ${po.quantity} ${po.unit} of ${po.medicineName}.`);
    this.notifyStateChange({ type: "INVENTORY_UPDATED", medicine: med, po });
    return true;
  }

  /**
   * Start Live Telemetry Simulation Ticker
   */
  startLiveTelemetryTicker() {
    if (this.isLiveTickerActive) return;
    this.isLiveTickerActive = true;

    this.tickerInterval = setInterval(() => {
      // Pick a random medicine and consume small stock
      const randomIndex = Math.floor(Math.random() * this.medicines.length);
      const med = this.medicines[randomIndex];

      if (med.currentStock > 0) {
        const consumption = Math.min(med.currentStock, Math.floor(Math.random() * 3) + 1);
        med.currentStock -= consumption;
        const evalRes = this.sentinelAgent.evaluateMedicine(med);

        this.notifyStateChange({
          type: "TICKER_CONSUMPTION",
          medicine: med,
          consumed: consumption
        });

        // If it crosses threshold, trigger agentic cycle automatically
        if (evalRes.isTriggered && evalRes.status === "CRITICAL_LOW" || evalRes.status === "OUT_OF_STOCK") {
          // Check if there's already an active unfulfilled PO
          const hasOpenPO = this.purchaseOrders.some(p => p.medicineId === med.id && (p.status.includes("APPROVED") || p.status.includes("PENDING")));
          if (!hasOpenPO) {
            this.runAutonomousCycle(med.id);
          }
        }
      }
    }, 5000);

    this.notifyStateChange({ type: "TICKER_STATUS", active: true });
  }

  stopLiveTelemetryTicker() {
    this.isLiveTickerActive = false;
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
    this.notifyStateChange({ type: "TICKER_STATUS", active: false });
  }

  /**
   * Simulate a Surge Event (Emergency rush / Viral Outbreak)
   */
  simulateHospitalSurge(category = "All") {
    this.audioSystem?.playWarningAlert();
    this.medicines.forEach(m => {
      if (category === "All" || m.category === category) {
        const drain = Math.floor(m.currentStock * 0.6) + 2;
        m.currentStock = Math.max(0, m.currentStock - drain);
        this.sentinelAgent.evaluateMedicine(m);
      }
    });

    this.logTrace({
      agent: this.name,
      role: "Surge Injector",
      step: "EMERGENCY_SURGE_EVENT",
      thought: `Simulated rapid patient surge event in ER/ICU. Depleted critical stock levels across priority medications. Triggering autonomous agentic response.`
    });

    this.runAutonomousCycle();
  }
}

window.SupervisorOrchestrator = SupervisorOrchestrator;
