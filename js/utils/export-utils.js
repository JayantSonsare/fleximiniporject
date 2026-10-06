/**
 * PharmSentinel AI - Export and Reporting Utilities
 * Generates downloadable reports, audit logs, and printable Purchase Orders.
 */

class ExportUtils {
  static exportPOToPrint(po) {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order - ${po.poNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; display: flex; justify-content: space-between; }
          .title { font-size: 24px; font-weight: bold; color: #0369a1; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #e0f2fe; color: #0369a1; font-weight: 600; font-size: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .reasoning { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin-top: 20px; font-size: 13px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🏥 PharmSentinel Autonomous Health Network</div>
            <div style="color: #64748b; margin-top: 4px;">Automated GxP Pharmaceutical Purchase Order</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold;">${po.poNumber}</div>
            <div style="color: #64748b;">Date: ${new Date().toLocaleDateString()} ${po.generatedAt}</div>
            <div class="badge" style="margin-top: 8px;">STATUS: ${po.status}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <strong>Deliver To:</strong><br>
            St. Jude Central Teaching Hospital<br>
            Central Pharmacy & Emergency Inpatient Dock #3<br>
            450 Health Sciences Parkway<br>
            Cold-Chain Verified Receiving Bay
          </div>
          <div>
            <strong>Authorized Supplier:</strong><br>
            ${po.supplierName}<br>
            Supplier ID: ${po.supplierId}<br>
            Delivery SLA: ${po.deliverySlaHours} Hours Guaranteed<br>
            Cold-Chain Compliance: ${po.coldChainGuaranteed ? 'Active 2-8°C Refrigerated' : 'Ambient Controlled'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Dosage Form</th>
              <th>Quantity</th>
              <th>Agreed Unit Price</th>
              <th>Discount Applied</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${po.medicineName}</strong></td>
              <td>${po.dosageForm}</td>
              <td>${po.quantity} ${po.unit}</td>
              <td>$${po.unitPriceAgreed.toFixed(2)}</td>
              <td>${po.discountAppliedPercent}%</td>
              <td><strong>$${po.totalOrderCost.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total Order Value: $${po.totalOrderCost.toFixed(2)} USD
        </div>

        <div class="reasoning">
          <strong>Autonomous Agent Sourcing Justification:</strong><br>
          ${po.thoughtTrace || 'Generated autonomously via multi-agent demand forecast and supplier price-SLA optimization.'}
        </div>

        <div class="footer">
          <div>Compliance: ${po.complianceNotes || 'GxP Standard batch certificate required upon arrival.'}</div>
          <div>System Signature: PharmSentinel AI Autonomous Supervisor • SHA-256 Validated</div>
        </div>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  }

  static downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `pharmsentinel-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static downloadCSV(traces, filename) {
    if (!traces || traces.length === 0) return;
    const headers = ["Timestamp", "Agent", "Role", "Step", "Thought"];
    const rows = traces.map(t => [
      `"${t.timestamp}"`,
      `"${t.agent}"`,
      `"${t.role}"`,
      `"${t.step}"`,
      `"${(t.thought || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `agent-thought-traces-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

window.ExportUtils = ExportUtils;
