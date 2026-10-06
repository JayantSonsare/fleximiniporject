/**
 * Agent 4: Multi-Channel Alert & Dispatch Automation Agent
 * Dispatches real-time automated notifications across simulated hospital channels:
 * Audio Alarms, Push Notifications, SMS, Email, and Slack/Teams Webhooks.
 */

class AlertDispatchAgent {
  constructor(audioSystem) {
    this.name = "Multi-Channel Alert & Dispatch Agent";
    this.role = "Omnichannel Notification & Urgent Escalation";
    this.audioSystem = audioSystem;
    this.alertHistory = [];
    this.listeners = [];
  }

  onAlert(cb) {
    this.listeners.push(cb);
  }

  notify(alert) {
    this.listeners.forEach(fn => fn(alert));
  }

  /**
   * Broadcast an urgent alert package across all channels
   */
  dispatchStockAlert({ medicine, evaluation, forecast, poRecord }) {
    const alertId = `ALT-${Date.now().toString().slice(-5)}`;
    const isOut = evaluation.status === "OUT_OF_STOCK";
    const isCritical = evaluation.status === "CRITICAL_LOW";
    const level = isOut ? "CRITICAL_EMERGENCY" : (isCritical ? "HIGH_ALERT" : "WARNING");

    // Play appropriate sound
    if (isOut) {
      this.audioSystem?.playCriticalEmergencyAlert();
    } else if (isCritical) {
      this.audioSystem?.playWarningAlert();
    } else {
      this.audioSystem?.playScanBlip();
    }

    const alertItem = {
      id: alertId,
      timestamp: new Date().toLocaleTimeString(),
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosageForm: medicine.dosageForm,
      currentStock: medicine.currentStock,
      unit: medicine.unit,
      level: level,
      category: medicine.category,
      location: medicine.location,
      runoutHours: evaluation.runoutHours,
      suggestedOrderQty: forecast?.recommendedOrderQuantity || 50,
      poNumber: poRecord?.poNumber || "PENDING_PO",
      supplierName: poRecord?.supplierName || "Apex Healthcare",
      coldChainRequired: medicine.coldChainRequired,
      channelsDispatched: [
        {
          channel: "Hospital Intercom & Screen Banner",
          status: "DELIVERED",
          message: `🚨 [${level}] ${medicine.name} at ${medicine.location}: Stock is ${medicine.currentStock} ${medicine.unit} (Est. Runout: ${evaluation.runoutHours}h)`
        },
        {
          channel: "Chief Medical Officer (CMO) SMS",
          status: "SENT",
          recipient: "+1 (555) 019-8822 (Dr. H. Adams, CMO)",
          message: `URGENT: ${medicine.name} depleted. Auto-PO generated with ${poRecord?.supplierName || 'Distributor'}. Review required.`
        },
        {
          channel: "Pharmacy Slack / Teams Bot",
          status: "POSTED",
          channelName: "#pharmacy-urgent-restock",
          message: `📦 Restock PO [${poRecord?.poNumber || 'N/A'}] generated for ${forecast?.recommendedOrderQuantity || 0} ${medicine.unit}.`
        },
        {
          channel: "ERP Procurement System",
          status: "SYNCHRONIZED",
          details: `Auto-logged in Hospital GxP ledger under ID ${poRecord?.poNumber || 'N/A'}`
        }
      ]
    };

    this.alertHistory.unshift(alertItem);
    if (this.alertHistory.length > 50) this.alertHistory.pop();

    this.notify(alertItem);
    return alertItem;
  }
}

window.AlertDispatchAgent = AlertDispatchAgent;
