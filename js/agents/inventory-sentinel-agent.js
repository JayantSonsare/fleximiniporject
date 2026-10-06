/**
 * Agent 1: Clinical Inventory Sentinel (Watcher / Monitor Agent)
 * Continuously polls inventory telemetry, computes velocity metrics,
 * detects consumption spikes, and flags out-of-stock / critical thresholds.
 */

class InventorySentinelAgent {
  constructor() {
    this.name = "Clinical Inventory Sentinel Agent";
    this.role = "Telemetry Watcher & Out-of-Stock Detector";
    this.status = "IDLE";
    this.scanIntervalMs = 4000;
    this.timer = null;
    this.listeners = [];
  }

  onScan(callback) {
    this.listeners.push(callback);
  }

  notify(event) {
    this.listeners.forEach(cb => cb(event));
  }

  /**
   * Evaluates an individual medicine's telemetry and computes risk status
   */
  evaluateMedicine(med) {
    const burnRate = med.avgHourlyConsumption || 1.0;
    const currentStock = med.currentStock;
    const runoutHours = currentStock > 0 ? (currentStock / burnRate).toFixed(1) : 0;
    
    // Status classification
    let status = "HEALTHY";
    let alertLevel = "NORMAL";
    let isTriggered = false;

    if (currentStock <= 0) {
      status = "OUT_OF_STOCK";
      alertLevel = "CRITICAL_EMERGENCY";
      isTriggered = true;
    } else if (currentStock <= med.criticalThreshold) {
      status = "CRITICAL_LOW";
      alertLevel = "CRITICAL";
      isTriggered = true;
    } else if (currentStock <= med.minThreshold) {
      status = "LOW";
      alertLevel = "WARNING";
      isTriggered = true;
    }

    med.stockStatus = status;

    return {
      medicineId: med.id,
      medicineName: med.name,
      currentStock,
      minThreshold: med.minThreshold,
      criticalThreshold: med.criticalThreshold,
      burnRate,
      runoutHours: parseFloat(runoutHours),
      status,
      alertLevel,
      isTriggered,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run full inventory sweep across all medicines
   */
  runTelemetrySweep(medicines) {
    this.status = "SCANNING";
    const triggeredItems = [];
    const fullScanReport = [];

    medicines.forEach(med => {
      const evalResult = this.evaluateMedicine(med);
      fullScanReport.push(evalResult);
      if (evalResult.isTriggered) {
        triggeredItems.push({
          medicine: med,
          evaluation: evalResult
        });
      }
    });

    this.status = triggeredItems.length > 0 ? "ALERT_TRIGGERED" : "HEALTHY_MONITORING";

    const sweepResult = {
      timestamp: new Date().toLocaleTimeString(),
      totalScanned: medicines.length,
      outOfStockCount: fullScanReport.filter(r => r.status === "OUT_OF_STOCK").length,
      criticalLowCount: fullScanReport.filter(r => r.status === "CRITICAL_LOW").length,
      lowStockCount: fullScanReport.filter(r => r.status === "LOW").length,
      triggeredItems,
      fullScanReport
    };

    this.notify({
      type: "SWEEP_COMPLETED",
      data: sweepResult
    });

    return sweepResult;
  }
}

window.InventorySentinelAgent = InventorySentinelAgent;
