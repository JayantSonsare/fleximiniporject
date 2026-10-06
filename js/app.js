/**
 * PharmSentinel AI - Main Application Controller
 * Handles UI views, Event listeners, Multi-Agent Orchestrator,
 * Interactive Stock Adjustments (Add/Consume), New SKU Registration,
 * and Persistent Inventory Storage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load saved medicines or initialize from database
  function loadMedicines() {
    try {
      const saved = localStorage.getItem('PHARMSENTINEL_MEDICINES_DATA');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using initial dataset", e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_MEDICINES || []));
  }

  function saveMedicinesToStorage(meds) {
    try {
      localStorage.setItem('PHARMSENTINEL_MEDICINES_DATA', JSON.stringify(meds));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  let medicines = loadMedicines();
  const suppliers = JSON.parse(JSON.stringify(window.SUPPLIERS_DATABASE || []));

  const orchestrator = new window.SupervisorOrchestrator({
    medicines,
    suppliers,
    geminiService: window.geminiService,
    audioSystem: window.audioAlerts
  });

  window.orchestrator = orchestrator;

  // Active UI state
  let currentTab = 'dashboard';
  let activeAdjustMedicine = null;

  // Cache DOM elements
  const el = {
    // Top Bar
    apiKeyBtn: document.getElementById('apiKeyBtn'),
    apiKeyStatusBadge: document.getElementById('apiKeyStatusBadge'),
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    modelSelect: document.getElementById('modelSelect'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    testApiKeyBtn: document.getElementById('testApiKeyBtn'),
    closeApiKeyModalBtn: document.getElementById('closeApiKeyModalBtn'),
    apiFeedback: document.getElementById('apiFeedback'),

    audioToggleBtn: document.getElementById('audioToggleBtn'),
    audioIcon: document.getElementById('audioIcon'),

    // Ticker & Surge
    tickerToggleBtn: document.getElementById('tickerToggleBtn'),
    tickerStatusIndicator: document.getElementById('tickerStatusIndicator'),
    simulateSurgeBtn: document.getElementById('simulateSurgeBtn'),
    runAgentLoopBtn: document.getElementById('runAgentLoopBtn'),

    // KPIs
    kpiTotalSKUs: document.getElementById('kpiTotalSKUs'),
    kpiOutOfStock: document.getElementById('kpiOutOfStock'),
    kpiCriticalLow: document.getElementById('kpiCriticalLow'),
    kpiPendingPOs: document.getElementById('kpiPendingPOs'),
    kpiColdChainAlerts: document.getElementById('kpiColdChainAlerts'),

    // Active Agent Nodes
    nodeSentinel: document.getElementById('nodeSentinel'),
    nodeForecaster: document.getElementById('nodeForecaster'),
    nodeSourcing: document.getElementById('nodeSourcing'),
    nodeDispatch: document.getElementById('nodeDispatch'),
    nodeSupervisor: document.getElementById('nodeSupervisor'),

    // Stock Grid & Filter
    medicineSearchInput: document.getElementById('medicineSearchInput'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    statusFilterSelect: document.getElementById('statusFilterSelect'),
    medicineGrid: document.getElementById('medicineGrid'),
    openAddMedicineModalBtn: document.getElementById('openAddMedicineModalBtn'),
    resetInventoryBtn: document.getElementById('resetInventoryBtn'),

    // Stock Adjust Modal
    stockAdjustModal: document.getElementById('stockAdjustModal'),
    adjustMedId: document.getElementById('adjustMedId'),
    adjustMedName: document.getElementById('adjustMedName'),
    adjustCurrentStockNum: document.getElementById('adjustCurrentStockNum'),
    adjustUnitLabel: document.getElementById('adjustUnitLabel'),
    adjustMaxCapacityLabel: document.getElementById('adjustMaxCapacityLabel'),
    adjustStatusBadge: document.getElementById('adjustStatusBadge'),
    adjustExactStockInput: document.getElementById('adjustExactStockInput'),
    applyExactStockBtn: document.getElementById('applyExactStockBtn'),
    adjustDeltaInput: document.getElementById('adjustDeltaInput'),
    applyDeltaBtn: document.getElementById('applyDeltaBtn'),
    adjustReasonInput: document.getElementById('adjustReasonInput'),
    deleteMedicineSkuBtn: document.getElementById('deleteMedicineSkuBtn'),
    closeStockAdjustModalBtn: document.getElementById('closeStockAdjustModalBtn'),
    closeStockModalDoneBtn: document.getElementById('closeStockModalDoneBtn'),
    triggerRestockFromModalBtn: document.getElementById('triggerRestockFromModalBtn'),
    quickStepBtns: document.querySelectorAll('.quick-step-btn'),

    // Add Medicine Modal
    addMedicineModal: document.getElementById('addMedicineModal'),
    closeAddMedicineModalBtn: document.getElementById('closeAddMedicineModalBtn'),
    cancelAddMedicineBtn: document.getElementById('cancelAddMedicineBtn'),
    addMedicineForm: document.getElementById('addMedicineForm'),

    // Agent Thought Stream (Tab 2)
    thoughtStreamContainer: document.getElementById('thoughtStreamContainer'),
    exportTracesJsonBtn: document.getElementById('exportTracesJsonBtn'),
    exportTracesCsvBtn: document.getElementById('exportTracesCsvBtn'),
    clearTracesBtn: document.getElementById('clearTracesBtn'),

    // PO Hub (Tab 3)
    poTableBody: document.getElementById('poTableBody'),
    autoPilotToggle: document.getElementById('autoPilotToggle'),

    // Prescription Checker (Tab 4)
    prescriptionInput: document.getElementById('prescriptionInput'),
    runPrescriptionCheckBtn: document.getElementById('runPrescriptionCheckBtn'),
    prescriptionResultContainer: document.getElementById('prescriptionResultContainer'),
    presetPrescriptionBtns: document.querySelectorAll('.preset-prescription-btn'),

    // Multi-Channel Alert Drawer / Bell
    alertBellBtn: document.getElementById('alertBellBtn'),
    alertBadgeCount: document.getElementById('alertBadgeCount'),
    alertDrawer: document.getElementById('alertDrawer'),
    closeAlertDrawerBtn: document.getElementById('closeAlertDrawerBtn'),
    alertDrawerList: document.getElementById('alertDrawerList'),

    // Tabs
    tabBtns: document.querySelectorAll('.nav-tab-btn'),
    tabSections: document.querySelectorAll('.tab-content-section')
  };

  // ==========================================
  // 1. Navigation & Tab Switching
  // ==========================================
  function switchTab(tabId) {
    currentTab = tabId;
    el.tabBtns.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50');
        btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      } else {
        btn.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/50');
        btn.classList.add('text-slate-400', 'hover:text-slate-200');
      }
    });

    el.tabSections.forEach(section => {
      if (section.id === `tab-${tabId}`) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    if (tabId === 'dashboard') {
      renderDashboard();
    } else if (tabId === 'agent-stream') {
      renderThoughtStream();
    } else if (tabId === 'po-hub') {
      renderPOHub();
    }
  }

  el.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // ==========================================
  // 2. Gemini API Modal & Settings
  // ==========================================
  function updateApiKeyStatus() {
    const hasKey = window.geminiService.hasValidKey();
    if (hasKey) {
      el.apiKeyStatusBadge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-semibold text-emerald-400">Gemini Live API Active</span>
      `;
      el.apiKeyBtn.classList.add('border-emerald-500/40', 'bg-emerald-500/10');
      el.apiKeyBtn.classList.remove('border-slate-700', 'bg-slate-800/80');
    } else {
      el.apiKeyStatusBadge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span class="text-xs font-medium text-amber-300">Neural Simulation Mode</span>
      `;
      el.apiKeyBtn.classList.remove('border-emerald-500/40', 'bg-emerald-500/10');
      el.apiKeyBtn.classList.add('border-slate-700', 'bg-slate-800/80');
    }
    el.apiKeyInput.value = window.geminiService.getApiKey();
    el.modelSelect.value = window.geminiService.modelName;
  }

  el.apiKeyBtn.addEventListener('click', () => {
    el.apiKeyModal.classList.remove('hidden');
    el.apiFeedback.innerHTML = '';
  });

  el.closeApiKeyModalBtn.addEventListener('click', () => {
    el.apiKeyModal.classList.add('hidden');
  });

  el.saveApiKeyBtn.addEventListener('click', () => {
    const key = el.apiKeyInput.value.trim();
    window.geminiService.setApiKey(key);
    window.geminiService.setModel(el.modelSelect.value);
    updateApiKeyStatus();
    el.apiFeedback.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Settings saved successfully!</span>`;
    setTimeout(() => el.apiKeyModal.classList.add('hidden'), 1200);
  });

  el.testApiKeyBtn.addEventListener('click', async () => {
    const tempKey = el.apiKeyInput.value.trim();
    if (!tempKey) {
      el.apiFeedback.innerHTML = `<span class="text-amber-400">Please enter an API key first.</span>`;
      return;
    }
    window.geminiService.setApiKey(tempKey);
    window.geminiService.setModel(el.modelSelect.value);
    el.apiFeedback.innerHTML = `<span class="text-cyan-400 animate-pulse">Testing Gemini connection...</span>`;
    const res = await window.geminiService.testConnection();
    if (res.success) {
      el.apiFeedback.innerHTML = `<span class="text-emerald-400 font-semibold">✓ ${res.message}</span>`;
      updateApiKeyStatus();
    } else {
      el.apiFeedback.innerHTML = `<span class="text-rose-400 font-semibold">✗ ${res.message}</span>`;
    }
  });

  // ==========================================
  // 3. Audio Alarm Toggle
  // ==========================================
  el.audioToggleBtn.addEventListener('click', () => {
    const isEnabled = window.audioAlerts.toggleSound();
    el.audioIcon.textContent = isEnabled ? '🔔' : '🔕';
    el.audioToggleBtn.title = isEnabled ? 'Audio Alerts: ON' : 'Audio Alerts: MUTED';
    if (isEnabled) {
      window.audioAlerts.playScanBlip();
    }
  });

  // ==========================================
  // 4. Multi-Channel Alert Drawer
  // ==========================================
  el.alertBellBtn.addEventListener('click', () => {
    el.alertDrawer.classList.toggle('translate-x-full');
  });

  el.closeAlertDrawerBtn.addEventListener('click', () => {
    el.alertDrawer.classList.add('translate-x-full');
  });

  function renderAlertDrawer() {
    const alerts = orchestrator.dispatchAgent.alertHistory;
    el.alertBadgeCount.textContent = alerts.length;
    el.alertBadgeCount.style.display = alerts.length > 0 ? 'inline-flex' : 'none';

    if (alerts.length === 0) {
      el.alertDrawerList.innerHTML = `
        <div class="text-center py-12 text-slate-500 text-sm">
          No urgent stock alerts logged yet.<br>Trigger a surge or let telemetry run!
        </div>
      `;
      return;
    }

    el.alertDrawerList.innerHTML = alerts.map(a => `
      <div class="p-4 rounded-xl border ${a.level === 'CRITICAL_EMERGENCY' ? 'border-rose-500/50 bg-rose-950/20' : 'border-amber-500/40 bg-amber-950/20'} mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${a.level === 'CRITICAL_EMERGENCY' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}">${a.level}</span>
          <span class="text-xs text-slate-400 font-mono">${a.timestamp}</span>
        </div>
        <div class="font-semibold text-slate-100 text-sm">${a.medicineName}</div>
        <div class="text-xs text-slate-400 mt-1">Location: <span class="text-slate-200">${a.location}</span> | On Hand: <span class="font-bold text-rose-400">${a.currentStock} ${a.unit}</span></div>
        <div class="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
          ${a.channelsDispatched.map(c => `
            <div class="text-[11px] text-slate-300 flex items-center justify-between">
              <span class="truncate pr-2 font-mono text-cyan-400">• ${c.channel}:</span>
              <span class="text-emerald-400 font-semibold shrink-0 text-[10px] bg-emerald-500/10 px-1.5 rounded">${c.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 5. KPIs & Stock Grid Rendering
  // ==========================================
  function updateKPIs() {
    const total = medicines.length;
    const outOfStock = medicines.filter(m => m.currentStock <= 0).length;
    const critical = medicines.filter(m => m.currentStock > 0 && m.currentStock <= m.criticalThreshold).length;
    const pendingPOs = orchestrator.purchaseOrders.filter(p => p.status.includes('PENDING')).length;
    const coldChainAlerts = medicines.filter(m => m.coldChainRequired && m.currentStock <= m.minThreshold).length;

    el.kpiTotalSKUs.textContent = total;
    el.kpiOutOfStock.textContent = outOfStock;
    el.kpiCriticalLow.textContent = critical;
    el.kpiPendingPOs.textContent = pendingPOs;
    el.kpiColdChainAlerts.textContent = coldChainAlerts;

    // Out of stock alert glow
    if (outOfStock > 0) {
      el.kpiOutOfStock.parentElement.classList.add('critical-pulse');
    } else {
      el.kpiOutOfStock.parentElement.classList.remove('critical-pulse');
    }
  }

  function renderMedicineGrid() {
    const searchQuery = el.medicineSearchInput.value.toLowerCase().trim();
    const catFilter = el.categoryFilterSelect.value;
    const statusFilter = el.statusFilterSelect.value;

    const filtered = medicines.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery) || m.genericName.toLowerCase().includes(searchQuery) || m.id.toLowerCase().includes(searchQuery);
      const matchCat = catFilter === 'ALL' || m.category === catFilter;
      const matchStatus = statusFilter === 'ALL' || m.stockStatus === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });

    if (filtered.length === 0) {
      el.medicineGrid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-500">
          No medicines match your search criteria.
        </div>
      `;
      return;
    }

    el.medicineGrid.innerHTML = filtered.map(m => {
      const pct = Math.min(100, Math.round((m.currentStock / m.maxCapacity) * 100));
      let badgeClass = 'badge-healthy';
      let progressClass = 'bg-progress-healthy';
      let statusLabel = 'HEALTHY';
      let isCriticalPulse = false;

      if (m.currentStock <= 0) {
        badgeClass = 'badge-out';
        progressClass = 'bg-progress-critical';
        statusLabel = 'OUT OF STOCK';
        isCriticalPulse = true;
      } else if (m.currentStock <= m.criticalThreshold) {
        badgeClass = 'badge-critical';
        progressClass = 'bg-progress-critical';
        statusLabel = 'CRITICAL LOW';
        isCriticalPulse = true;
      } else if (m.currentStock <= m.minThreshold) {
        badgeClass = 'badge-low';
        progressClass = 'bg-progress-low';
        statusLabel = 'LOW STOCK';
      }

      const runoutHours = m.currentStock > 0 ? (m.currentStock / m.avgHourlyConsumption).toFixed(1) : 0;

      return `
        <div class="glass-panel glass-panel-interactive p-5 relative overflow-hidden flex flex-col justify-between ${isCriticalPulse ? 'critical-pulse' : ''}" data-med-id="${m.id}">
          <div>
            <!-- Header -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-mono text-cyan-400 font-semibold">${m.id}</span>
                  ${m.coldChainRequired ? '<span class="text-xs" title="Strict 2-8°C Cold Chain">❄️</span>' : ''}
                </div>
                <h3 class="font-bold text-slate-100 text-base leading-tight">${m.name}</h3>
                <p class="text-xs text-slate-400 font-medium">${m.category}</p>
              </div>
              <span class="px-2.5 py-1 text-[11px] font-bold rounded-full font-mono shrink-0 ${badgeClass}">
                ${statusLabel}
              </span>
            </div>

            <!-- Stock bar -->
            <div class="my-3">
              <div class="flex justify-between text-xs font-mono mb-1.5">
                <span class="text-slate-400">Stock on Hand: <strong class="text-slate-100 text-sm">${m.currentStock}</strong> / ${m.maxCapacity} ${m.unit}</span>
                <span class="font-semibold text-cyan-300">${pct}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 ${progressClass}" style="width: ${pct}%"></div>
              </div>
            </div>

            <!-- Inline Stepper Adjustment Controls -->
            <div class="my-2.5 p-2 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-slate-400 font-mono font-semibold uppercase pr-1">Consume:</span>
                <button class="inline-adjust-btn px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-bold font-mono transition" data-id="${m.id}" data-delta="-1" title="Consume 1 unit">
                  -1
                </button>
                <button class="inline-adjust-btn px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-bold font-mono transition" data-id="${m.id}" data-delta="-5" title="Consume 5 units">
                  -5
                </button>
              </div>

              <div class="w-px h-5 bg-slate-800"></div>

              <div class="flex items-center gap-1">
                <span class="text-[10px] text-slate-400 font-mono font-semibold uppercase pr-1">Add:</span>
                <button class="inline-adjust-btn px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold font-mono transition" data-id="${m.id}" data-delta="1" title="Add 1 unit">
                  +1
                </button>
                <button class="inline-adjust-btn px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold font-mono transition" data-id="${m.id}" data-delta="5" title="Add 5 units">
                  +5
                </button>
              </div>
            </div>

            <!-- Clinical & Logistics Info -->
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
              <div>
                <span class="text-slate-500">Burn Rate:</span>
                <div class="font-mono text-slate-200 font-semibold">${m.avgHourlyConsumption} ${m.unit}/hr</div>
              </div>
              <div>
                <span class="text-slate-500">Runout Est.:</span>
                <div class="font-mono ${parseFloat(runoutHours) < 10 ? 'text-rose-400 font-bold' : 'text-slate-200'}">${runoutHours} hrs</div>
              </div>
              <div>
                <span class="text-slate-500">Min / Critical:</span>
                <div class="font-mono text-slate-300 font-semibold">${m.minThreshold} / ${m.criticalThreshold} ${m.unit}</div>
              </div>
              <div>
                <span class="text-slate-500">Unit Price:</span>
                <div class="font-mono text-emerald-400 font-semibold">$${m.unitPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <!-- Card Bottom Action Buttons -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button class="open-manage-modal-btn flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1" data-id="${m.id}">
              <span>✏️</span> Edit Stock
            </button>
            <button class="trigger-agent-btn flex-1 py-1.5 px-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-cyan-900/20" data-id="${m.id}" title="Run AI Agent on this SKU">
              <span>🤖</span> Auto-Restock
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach inline adjustment handlers
    el.medicineGrid.querySelectorAll('.inline-adjust-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const delta = parseInt(e.currentTarget.dataset.delta, 10);
        applyStockChange(id, delta, "Inline Quick Stepper Adjustment");
      });
    });

    // Attach Open Manage Modal handlers
    el.medicineGrid.querySelectorAll('.open-manage-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openStockAdjustModal(id);
      });
    });

    // Attach Trigger AI Agent handlers
    el.medicineGrid.querySelectorAll('.trigger-agent-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        orchestrator.runAutonomousCycle(id);
      });
    });
  }

  // Apply a stock change (add or consume)
  function applyStockChange(medicineId, delta, reason = "Manual Stock Adjustment") {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    const oldStock = med.currentStock;
    med.currentStock = Math.max(0, Math.min(med.maxCapacity, med.currentStock + delta));
    const evalRes = orchestrator.sentinelAgent.evaluateMedicine(med);

    // Save to storage
    saveMedicinesToStorage(medicines);

    // Sound effect
    if (delta < 0) {
      if (med.currentStock <= 0) window.audioAlerts.playCriticalEmergencyAlert();
      else if (med.currentStock <= med.criticalThreshold) window.audioAlerts.playWarningAlert();
      else window.audioAlerts.playScanBlip();
    } else {
      window.audioAlerts.playSuccessChime();
    }

    // Log trace
    orchestrator.logTrace({
      agent: orchestrator.sentinelAgent.name,
      role: "Inventory Ledger",
      step: delta < 0 ? "STOCK_CONSUMPTION_LOGGED" : "STOCK_REPLENISHMENT_LOGGED",
      thought: `Stock adjusted for [${med.name}]: ${delta > 0 ? '+' : ''}${delta} ${med.unit} (Previous: ${oldStock}, New: ${med.currentStock}). Reason: ${reason}. Status: ${evalRes.status}.`
    });

    orchestrator.logAudit("MANUAL_STOCK_CHANGE", `Adjusted ${med.name} by ${delta} ${med.unit}. Reason: ${reason}`);

    renderDashboard();

    // If stock critically dropped, trigger agent cycle automatically
    if (evalRes.isTriggered && (evalRes.status === 'OUT_OF_STOCK' || evalRes.status === 'CRITICAL_LOW')) {
      orchestrator.runAutonomousCycle(med.id);
    }
  }

  // ==========================================
  // 6. Stock Adjustment Modal Functions
  // ==========================================
  function openStockAdjustModal(medicineId) {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    activeAdjustMedicine = med;
    el.adjustMedId.textContent = med.id;
    el.adjustMedName.textContent = med.name;
    el.adjustCurrentStockNum.textContent = med.currentStock;
    el.adjustUnitLabel.textContent = med.unit;
    el.adjustMaxCapacityLabel.textContent = med.maxCapacity;

    el.adjustExactStockInput.value = med.currentStock;
    el.adjustExactStockInput.max = med.maxCapacity;
    el.adjustDeltaInput.value = '';
    el.adjustReasonInput.value = '';

    // Update status badge
    let badgeClass = 'badge-healthy';
    let statusText = 'HEALTHY';
    if (med.currentStock <= 0) {
      badgeClass = 'badge-out';
      statusText = 'OUT OF STOCK';
    } else if (med.currentStock <= med.criticalThreshold) {
      badgeClass = 'badge-critical';
      statusText = 'CRITICAL LOW';
    } else if (med.currentStock <= med.minThreshold) {
      badgeClass = 'badge-low';
      statusText = 'LOW STOCK';
    }
    el.adjustStatusBadge.className = `px-3 py-1 text-xs font-mono font-bold rounded-full ${badgeClass}`;
    el.adjustStatusBadge.textContent = statusText;

    el.stockAdjustModal.classList.remove('hidden');
  }

  function closeStockAdjustModal() {
    el.stockAdjustModal.classList.add('hidden');
    activeAdjustMedicine = null;
  }

  el.closeStockAdjustModalBtn.addEventListener('click', closeStockAdjustModal);
  el.closeStockModalDoneBtn.addEventListener('click', closeStockAdjustModal);

  // Quick Action Buttons inside modal
  el.quickStepBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!activeAdjustMedicine) return;
      const deltaVal = e.currentTarget.dataset.delta;
      const reason = el.adjustReasonInput.value.trim() || "Modal Quick Action";

      if (deltaVal === 'SET_ZERO') {
        applyStockChange(activeAdjustMedicine.id, -activeAdjustMedicine.currentStock, `${reason} - Emptied Stock`);
      } else if (deltaVal === 'FILL_MAX') {
        const toAdd = activeAdjustMedicine.maxCapacity - activeAdjustMedicine.currentStock;
        applyStockChange(activeAdjustMedicine.id, toAdd, `${reason} - Max Capacity Fill`);
      } else {
        const delta = parseInt(deltaVal, 10);
        applyStockChange(activeAdjustMedicine.id, delta, reason);
      }
      openStockAdjustModal(activeAdjustMedicine.id); // Refresh modal view
    });
  });

  // Apply exact stock level
  el.applyExactStockBtn.addEventListener('click', () => {
    if (!activeAdjustMedicine) return;
    const exact = parseInt(el.adjustExactStockInput.value, 10);
    if (isNaN(exact) || exact < 0) return;

    const delta = exact - activeAdjustMedicine.currentStock;
    const reason = el.adjustReasonInput.value.trim() || "Manual Exact Stock Value Correction";
    applyStockChange(activeAdjustMedicine.id, delta, reason);
    openStockAdjustModal(activeAdjustMedicine.id);
  });

  // Apply custom delta
  el.applyDeltaBtn.addEventListener('click', () => {
    if (!activeAdjustMedicine) return;
    const delta = parseInt(el.adjustDeltaInput.value, 10);
    if (isNaN(delta) || delta === 0) return;

    const reason = el.adjustReasonInput.value.trim() || "Manual Custom Delta Adjustment";
    applyStockChange(activeAdjustMedicine.id, delta, reason);
    openStockAdjustModal(activeAdjustMedicine.id);
  });

  // Trigger restock from modal
  el.triggerRestockFromModalBtn.addEventListener('click', () => {
    if (!activeAdjustMedicine) return;
    const id = activeAdjustMedicine.id;
    closeStockAdjustModal();
    orchestrator.runAutonomousCycle(id);
  });

  // Delete SKU from modal
  el.deleteMedicineSkuBtn.addEventListener('click', () => {
    if (!activeAdjustMedicine) return;
    const confirmDelete = confirm(`Are you sure you want to remove ${activeAdjustMedicine.name} (${activeAdjustMedicine.id}) from the hospital inventory database?`);
    if (confirmDelete) {
      const id = activeAdjustMedicine.id;
      medicines = medicines.filter(m => m.id !== id);
      orchestrator.medicines = medicines;
      saveMedicinesToStorage(medicines);

      orchestrator.logTrace({
        agent: orchestrator.name,
        role: "Database Administrator",
        step: "SKU_DELETED",
        thought: `Removed medicine SKU [${id}] from active hospital formulary.`
      });

      closeStockAdjustModal();
      renderDashboard();
    }
  });

  // ==========================================
  // 7. Add New Medicine SKU Modal
  // ==========================================
  el.openAddMedicineModalBtn.addEventListener('click', () => {
    el.addMedicineModal.classList.remove('hidden');
    el.addMedicineForm.reset();
  });

  function closeAddMedicineModal() {
    el.addMedicineModal.classList.add('hidden');
  }

  el.closeAddMedicineModalBtn.addEventListener('click', closeAddMedicineModal);
  el.cancelAddMedicineBtn.addEventListener('click', closeAddMedicineModal);

  el.addMedicineForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Generate unique ID
    const nextNum = medicines.length + 1;
    const newId = `MED-${nextNum.toString().padStart(3, '0')}`;

    const newMed = {
      id: newId,
      name: document.getElementById('newMedName').value.trim(),
      genericName: document.getElementById('newMedGeneric').value.trim(),
      category: document.getElementById('newMedCategory').value,
      dosageForm: document.getElementById('newMedDosageForm').value.trim(),
      currentStock: parseInt(document.getElementById('newMedCurrentStock').value, 10),
      minThreshold: parseInt(document.getElementById('newMedMinThreshold').value, 10),
      criticalThreshold: parseInt(document.getElementById('newMedCriticalThreshold').value, 10),
      maxCapacity: parseInt(document.getElementById('newMedMaxCapacity').value, 10),
      unit: document.getElementById('newMedUnit').value.trim() || 'vials',
      avgHourlyConsumption: parseFloat(document.getElementById('newMedBurnRate').value),
      unitPrice: parseFloat(document.getElementById('newMedUnitPrice').value),
      temperatureZone: document.getElementById('newMedColdChain').checked ? "2°C - 8°C (Cold Chain Refrigerated)" : "Store below 25°C",
      coldChainRequired: document.getElementById('newMedColdChain').checked,
      requiresDoctorAuth: document.getElementById('newMedDoctorAuth').checked,
      shelfLifeMonths: 24,
      primarySupplierId: document.getElementById('newMedSupplier').value,
      alternativeSupplierId: "SUP-01",
      leadTimeHours: 12,
      stockStatus: "HEALTHY",
      description: "Added to hospital formulary.",
      location: "Central Pharmacy Shelf & Ward Reserve",
      batchNumber: `BAT-${Math.floor(1000 + Math.random()*9000)}`,
      expiryDate: "2027-12-31"
    };

    // Calculate initial Sentinel status
    orchestrator.sentinelAgent.evaluateMedicine(newMed);

    medicines.unshift(newMed);
    orchestrator.medicines = medicines;
    saveMedicinesToStorage(medicines);

    window.audioAlerts.playSuccessChime();

    orchestrator.logTrace({
      agent: orchestrator.sentinelAgent.name,
      role: "Inventory Registration",
      step: "NEW_MEDICINE_REGISTERED",
      thought: `Successfully registered new medicine SKU [${newMed.id}: ${newMed.name}]. Stock: ${newMed.currentStock} ${newMed.unit}, Min: ${newMed.minThreshold}, Critical: ${newMed.criticalThreshold}.`
    });

    closeAddMedicineModal();
    renderDashboard();
  });

  // ==========================================
  // 8. Reset Inventory to Default Hospital Dataset
  // ==========================================
  el.resetInventoryBtn.addEventListener('click', () => {
    const confirmReset = confirm("Reset all medicine stocks and formulary back to original default dataset?");
    if (confirmReset) {
      localStorage.removeItem('PHARMSENTINEL_MEDICINES_DATA');
      medicines = JSON.parse(JSON.stringify(window.INITIAL_MEDICINES || []));
      orchestrator.medicines = medicines;
      medicines.forEach(m => orchestrator.sentinelAgent.evaluateMedicine(m));
      window.audioAlerts.playSuccessChime();
      renderDashboard();
      orchestrator.logTrace({
        agent: orchestrator.name,
        role: "System Administrator",
        step: "INVENTORY_RESET",
        thought: `Restored inventory catalog to factory clinical defaults.`
      });
    }
  });

  // ==========================================
  // 9. Active Agent Visual Pipeline
  // ==========================================
  function updateActiveAgentVisuals(activeState = orchestrator.activeWorkflowState) {
    const nodes = [el.nodeSentinel, el.nodeForecaster, el.nodeSourcing, el.nodeDispatch, el.nodeSupervisor];
    nodes.forEach(n => n?.classList.remove('active-node'));

    if (activeState === 'SCANNING') el.nodeSentinel?.classList.add('active-node');
    else if (activeState === 'REASONING') el.nodeForecaster?.classList.add('active-node');
    else if (activeState === 'NEGOTIATING') el.nodeSourcing?.classList.add('active-node');
    else if (activeState === 'DISPATCHING') el.nodeDispatch?.classList.add('active-node');
    else if (activeState === 'COMPLETED' || activeState === 'IDLE') el.nodeSupervisor?.classList.add('active-node');
  }

  function renderDashboard() {
    updateKPIs();
    renderMedicineGrid();
    renderAlertDrawer();
    updateActiveAgentVisuals();
  }

  // ==========================================
  // 10. Agent Thought Stream (Tab 2)
  // ==========================================
  function renderThoughtStream() {
    const traces = orchestrator.agentThoughtTraces;
    if (traces.length === 0) {
      el.thoughtStreamContainer.innerHTML = `
        <div class="text-center py-20 text-slate-500">
          <div class="text-3xl mb-2">🤖</div>
          <div class="text-base font-medium text-slate-400">Agent Reasoning Engine Ready</div>
          <div class="text-sm mt-1">Run an autonomous cycle or trigger an out-of-stock event to view real-time ReAct thought traces.</div>
        </div>
      `;
      return;
    }

    el.thoughtStreamContainer.innerHTML = traces.map(t => {
      let agentBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      if (t.agent.includes('Sentinel')) agentBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      else if (t.agent.includes('Forecaster')) agentBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      else if (t.agent.includes('Sourcing')) agentBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      else if (t.agent.includes('Dispatch')) agentBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

      return `
        <div class="glass-panel p-4 border-l-4 ${t.step.includes('ALERT') ? 'border-l-rose-500' : 'border-l-cyan-500'} mb-3 transition hover:bg-slate-900/80">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 text-xs font-semibold rounded border ${agentBadge}">${t.agent}</span>
              <span class="text-xs text-slate-400 font-mono">${t.step}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
              ${t.latencyMs ? `<span class="text-emerald-400 font-semibold">⚡ ${t.latencyMs}ms</span>` : ''}
              <span>${t.timestamp}</span>
            </div>
          </div>
          <div class="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
            ${t.thought}
          </div>
          ${t.data ? `
            <div class="mt-2 text-xs font-mono text-slate-400 bg-slate-900/90 p-2 rounded border border-slate-800/80 overflow-x-auto">
              <span class="text-slate-500">// Observation Payload:</span><br>
              ${JSON.stringify(t.data, null, 2)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  el.exportTracesJsonBtn.addEventListener('click', () => {
    window.ExportUtils.downloadJSON(orchestrator.agentThoughtTraces, `pharmsentinel-agent-traces-${Date.now()}.json`);
  });

  el.exportTracesCsvBtn.addEventListener('click', () => {
    window.ExportUtils.downloadCSV(orchestrator.agentThoughtTraces);
  });

  el.clearTracesBtn.addEventListener('click', () => {
    orchestrator.agentThoughtTraces = [];
    renderThoughtStream();
  });

  // ==========================================
  // 11. Purchase Order Hub (Tab 3)
  // ==========================================
  function renderPOHub() {
    const pos = orchestrator.purchaseOrders;
    if (pos.length === 0) {
      el.poTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-500">
            No Purchase Orders generated yet.
          </td>
        </tr>
      `;
      return;
    }

    el.poTableBody.innerHTML = pos.map(po => {
      let statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      if (po.status === 'AUTO_APPROVED' || po.status === 'MANUALLY_APPROVED') {
        statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      } else if (po.status === 'FULFILLED_DELIVERED') {
        statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      } else if (po.status === 'REJECTED') {
        statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      }

      const isPending = po.status === 'PENDING_HITL_APPROVAL';
      const isApproved = po.status.includes('APPROVED');

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-900/40 text-sm">
          <td class="py-3 px-4 font-mono font-bold text-cyan-400">${po.poNumber}</td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-200">${po.medicineName}</div>
            <div class="text-xs text-slate-400 font-mono">${po.quantity} ${po.unit} @ $${po.unitPriceAgreed.toFixed(2)}</div>
          </td>
          <td class="py-3 px-4">
            <div class="text-slate-200 font-medium">${po.supplierName}</div>
            <div class="text-xs text-slate-400">${po.coldChainGuaranteed ? '❄️ Cold Chain SLA' : '🚚 Standard SLA'}</div>
          </td>
          <td class="py-3 px-4 font-mono font-bold text-emerald-400">
            $${po.totalOrderCost.toFixed(2)}
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadge}">${po.status}</span>
          </td>
          <td class="py-3 px-4 text-xs text-slate-400 font-mono">
            ${po.generatedAt}
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              ${isPending ? `
                <button class="approve-po-btn px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition" data-po="${po.poNumber}">
                  ✓ Approve (HITL)
                </button>
                <button class="reject-po-btn px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white rounded text-xs transition" data-po="${po.poNumber}">
                  ✗ Reject
                </button>
              ` : ''}
              ${isApproved ? `
                <button class="fulfill-po-btn px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition" data-po="${po.poNumber}">
                  📦 Mark Delivered
                </button>
              ` : ''}
              <button class="print-po-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono transition" data-po="${po.poNumber}" title="Print GxP PO">
                🖨️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind PO buttons
    el.poTableBody.querySelectorAll('.approve-po-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poNum = e.currentTarget.dataset.po;
        orchestrator.approvePurchaseOrder(poNum);
        renderPOHub();
        renderDashboard();
      });
    });

    el.poTableBody.querySelectorAll('.reject-po-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poNum = e.currentTarget.dataset.po;
        orchestrator.rejectPurchaseOrder(poNum);
        renderPOHub();
      });
    });

    el.poTableBody.querySelectorAll('.fulfill-po-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poNum = e.currentTarget.dataset.po;
        orchestrator.fulfillRestock(poNum);
        saveMedicinesToStorage(medicines);
        renderPOHub();
        renderDashboard();
      });
    });

    el.poTableBody.querySelectorAll('.print-po-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const poNum = e.currentTarget.dataset.po;
        const po = orchestrator.purchaseOrders.find(p => p.poNumber === poNum);
        if (po) window.ExportUtils.exportPOToPrint(po);
      });
    });
  }

  el.autoPilotToggle.addEventListener('change', (e) => {
    orchestrator.isAutoPilot = e.target.checked;
    orchestrator.logTrace({
      agent: orchestrator.name,
      role: 'Governance Policy',
      step: 'POLICY_UPDATED',
      thought: `Auto-Pilot mode set to: ${orchestrator.isAutoPilot ? 'ENABLED (Auto-approve orders under $2,500)' : 'STRICT HITL (All orders require human sign-off)'}.`
    });
  });

  // ==========================================
  // 12. Clinical Prescription Checker (Tab 4)
  // ==========================================
  async function runPrescriptionCheck(text) {
    if (!text || text.trim().length === 0) return;

    el.prescriptionResultContainer.innerHTML = `
      <div class="glass-panel p-8 text-center text-cyan-400">
        <div class="inline-block radar-spinner text-3xl mb-3">⟳</div>
        <div class="font-semibold">Clinical AI Safety Agent is cross-referencing live inventory...</div>
      </div>
    `;

    const result = await window.geminiService.checkPrescriptionSafety({
      prescriptionText: text,
      currentInventory: medicines
    });

    let statusCardClass = 'border-emerald-500/40 bg-emerald-950/20';
    let statusBadge = 'bg-emerald-500/20 text-emerald-300';
    if (result.stockImpactAssessment === 'STOCKOUT_BLOCKER') {
      statusCardClass = 'border-rose-500/60 bg-rose-950/30 critical-pulse';
      statusBadge = 'bg-rose-500/30 text-rose-300';
      window.audioAlerts.playCriticalEmergencyAlert();
    } else if (result.stockImpactAssessment === 'DEPLETION_WARNING') {
      statusCardClass = 'border-amber-500/50 bg-amber-950/20';
      statusBadge = 'bg-amber-500/20 text-amber-300';
      window.audioAlerts.playWarningAlert();
    } else {
      window.audioAlerts.playSuccessChime();
    }

    el.prescriptionResultContainer.innerHTML = `
      <div class="glass-panel p-6 border ${statusCardClass}">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-full ${statusBadge}">
            ${result.stockImpactAssessment}
          </span>
          <span class="text-xs text-slate-400 font-mono">Action: ${result.actionTriggered}</span>
        </div>

        <h3 class="text-lg font-bold text-slate-100 mb-1">Identified Drug: <span class="text-cyan-400">${result.drugIdentified}</span></h3>
        <p class="text-sm text-slate-400 mb-4">${result.dosageAndQty}</p>

        <div class="p-3 bg-slate-900/70 rounded-lg border border-slate-800 text-sm mb-4">
          <strong class="text-slate-300">Clinical Safety Assessment:</strong>
          <p class="text-slate-200 mt-1">${result.clinicalAdvice}</p>
        </div>

        ${result.therapeuticAlternatives && result.therapeuticAlternatives.length > 0 ? `
          <div class="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg mb-4">
            <strong class="text-rose-300 text-xs uppercase tracking-wider font-mono">⚠️ Recommended Clinical Alternatives:</strong>
            <ul class="list-disc list-inside text-xs text-slate-200 mt-2 space-y-1">
              ${result.therapeuticAlternatives.map(alt => `<li>${alt}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="flex justify-end gap-2 pt-2">
          ${result.stockImpactAssessment === 'STOCKOUT_BLOCKER' ? `
            <button id="triggerEmergencyRestockFromRx" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition">
              ⚡ Trigger Immediate Emergency PO Restock
            </button>
          ` : `
            <button class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition">
              ✓ Dispense Medication to Patient Ward
            </button>
          `}
        </div>
      </div>
    `;

    const emergencyBtn = document.getElementById('triggerEmergencyRestockFromRx');
    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => {
        const med = medicines.find(m => m.name.toLowerCase().includes(result.drugIdentified.toLowerCase()) || result.drugIdentified.toLowerCase().includes(m.name.toLowerCase()));
        if (med) {
          orchestrator.runAutonomousCycle(med.id);
        } else {
          orchestrator.runAutonomousCycle();
        }
        switchTab('dashboard');
      });
    }
  }

  el.runPrescriptionCheckBtn.addEventListener('click', () => {
    runPrescriptionCheck(el.prescriptionInput.value);
  });

  el.presetPrescriptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.prescriptionInput.value = btn.dataset.text;
      runPrescriptionCheck(btn.dataset.text);
    });
  });

  // ==========================================
  // 13. Simulation Triggers & Ticker
  // ==========================================
  el.simulateSurgeBtn.addEventListener('click', () => {
    orchestrator.simulateHospitalSurge();
    saveMedicinesToStorage(medicines);
    renderDashboard();
  });

  el.runAgentLoopBtn.addEventListener('click', () => {
    orchestrator.runAutonomousCycle();
  });

  el.tickerToggleBtn.addEventListener('click', () => {
    if (orchestrator.isLiveTickerActive) {
      orchestrator.stopLiveTelemetryTicker();
      el.tickerToggleBtn.innerHTML = '▶ Start Telemetry Ticker';
      el.tickerStatusIndicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-500"></span><span class="text-xs text-slate-400">Ticker Paused</span>';
    } else {
      orchestrator.startLiveTelemetryTicker();
      el.tickerToggleBtn.innerHTML = '⏸ Pause Telemetry Ticker';
      el.tickerStatusIndicator.innerHTML = '<span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span><span class="text-xs text-cyan-300 font-semibold">Live Telemetry Active</span>';
    }
  });

  // Filter Listeners
  el.medicineSearchInput.addEventListener('input', renderMedicineGrid);
  el.categoryFilterSelect.addEventListener('change', renderMedicineGrid);
  el.statusFilterSelect.addEventListener('change', renderMedicineGrid);

  // Orchestrator Event Bus Subscriptions
  orchestrator.subscribe((event) => {
    if (event.type === 'NEW_TRACE') {
      if (currentTab === 'agent-stream') renderThoughtStream();
    } else if (event.type === 'STATE_CHANGE' || event.type === 'WORKFLOW_START' || event.type === 'WORKFLOW_END') {
      updateActiveAgentVisuals(event.state);
      renderDashboard();
    } else if (event.type === 'NEW_ALERT') {
      renderAlertDrawer();
      updateKPIs();
    } else if (event.type === 'TICKER_CONSUMPTION') {
      saveMedicinesToStorage(medicines);
      renderDashboard();
    } else if (event.type === 'PO_UPDATED' || event.type === 'INVENTORY_UPDATED') {
      saveMedicinesToStorage(medicines);
      renderDashboard();
      if (currentTab === 'po-hub') renderPOHub();
    }
  });

  // Initial render
  updateApiKeyStatus();
  renderDashboard();
});
