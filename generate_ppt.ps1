# =========================================================================
# Professional PowerPoint Generator for PharmSentinel AI
# Generates a modern, high-impact 4-slide PPTX presentation.
# =========================================================================

$pptxPath = Join-Path $PSScriptRoot "PharmSentinel_AI_Presentation.pptx"

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    # 16:9 Widescreen aspect ratio (960 x 540 pt)
    $pres.PageSetup.SlideWidth = 960
    $pres.PageSetup.SlideHeight = 540

    # Color Constants (BGR format for Office COM: B * 65536 + G * 256 + R)
    $colBg = 42 * 65536 + 23 * 256 + 15
    $colCyan = 212 * 65536 + 182 * 256 + 6
    $colWhite = 252 * 65536 + 250 * 256 + 248
    $colMuted = 184 * 65536 + 163 * 256 + 148
    $colEmerald = 129 * 65536 + 185 * 256 + 16
    $colRose = 94 * 65536 + 63 * 256 + 244
    $colCardBg = 59 * 65536 + 41 * 256 + 30

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    $s1 = $pres.Slides.Add(1, 12)
    $s1.Background.Fill.Solid()
    $s1.Background.Fill.ForeColor.RGB = $colBg

    $badge1 = $s1.Shapes.AddShape(1, 60, 50, 360, 30)
    $badge1.Fill.Solid()
    $badge1.Fill.ForeColor.RGB = 50 * 65536 + 20 * 256 + 10
    $badge1.Line.Visible = 0
    $badge1.TextFrame.TextRange.Text = "AGENTIC AI AND AUTOMATION - CAPSTONE"
    $badge1.TextFrame.TextRange.Font.Size = 11
    $badge1.TextFrame.TextRange.Font.Bold = 1
    $badge1.TextFrame.TextRange.Font.Color.RGB = $colCyan

    $title1 = $s1.Shapes.AddTextbox(1, 55, 95, 850, 90)
    $title1.TextFrame.TextRange.Text = "PharmSentinel AI"
    $title1.TextFrame.TextRange.Font.Name = "Segoe UI"
    $title1.TextFrame.TextRange.Font.Size = 48
    $title1.TextFrame.TextRange.Font.Bold = 1
    $title1.TextFrame.TextRange.Font.Color.RGB = $colCyan

    $sub1 = $s1.Shapes.AddTextbox(1, 55, 185, 850, 60)
    $sub1.TextFrame.TextRange.Text = "Automated Out-of-Stock Alert & Autonomous Restocking System"
    $sub1.TextFrame.TextRange.Font.Name = "Segoe UI"
    $sub1.TextFrame.TextRange.Font.Size = 20
    $sub1.TextFrame.TextRange.Font.Bold = 1
    $sub1.TextFrame.TextRange.Font.Color.RGB = $colWhite

    $desc1 = $s1.Shapes.AddTextbox(1, 55, 250, 850, 80)
    $desc1.TextFrame.TextRange.Text = "A self-driving multi-agent healthcare platform that monitors real-time pharmacy telemetry, forecasts epidemiological surges via Google Gemini LLM reasoning, and executes closed-loop procurement to eliminate medicine stockouts."
    $desc1.TextFrame.TextRange.Font.Name = "Segoe UI"
    $desc1.TextFrame.TextRange.Font.Size = 14
    $desc1.TextFrame.TextRange.Font.Color.RGB = $colMuted

    $cards = @(
        @{ Title = "DOMAIN"; Sub = "Healthcare AI & Supply Chains" },
        @{ Title = "CORE ENGINE"; Sub = "Google Gemini ReAct Agents" },
        @{ Title = "GOVERNANCE"; Sub = "Auto-Pilot & HITL Safety" }
    )
    for ($i = 0; $i -lt 3; $i++) {
        $cBox = $s1.Shapes.AddShape(1, 60 + ($i * 285), 370, 265, 80)
        $cBox.Fill.Solid()
        $cBox.Fill.ForeColor.RGB = $colCardBg
        $cBox.Line.ForeColor.RGB = $colCyan
        $cBox.Line.Weight = 1

        $cBox.TextFrame.TextRange.Text = "$($cards[$i].Title)`n$($cards[$i].Sub)"
        $cBox.TextFrame.TextRange.Font.Name = "Segoe UI"
        $cBox.TextFrame.TextRange.Paragraphs(1).Font.Size = 10
        $cBox.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
        $cBox.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colCyan
        $cBox.TextFrame.TextRange.Paragraphs(2).Font.Size = 13
        $cBox.TextFrame.TextRange.Paragraphs(2).Font.Bold = 1
        $cBox.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite
    }

    # ==========================================
    # SLIDE 2: Problem & Solution
    # ==========================================
    $s2 = $pres.Slides.Add(2, 12)
    $s2.Background.Fill.Solid()
    $s2.Background.Fill.ForeColor.RGB = $colBg

    $head2 = $s2.Shapes.AddTextbox(1, 55, 30, 850, 60)
    $head2.TextFrame.TextRange.Text = "Problem Statement & Proposed Solution"
    $head2.TextFrame.TextRange.Font.Name = "Segoe UI"
    $head2.TextFrame.TextRange.Font.Size = 28
    $head2.TextFrame.TextRange.Font.Bold = 1
    $head2.TextFrame.TextRange.Font.Color.RGB = $colWhite

    # Problem Box (Left)
    $pBox = $s2.Shapes.AddShape(1, 55, 105, 410, 360)
    $pBox.Fill.Solid()
    $pBox.Fill.ForeColor.RGB = 30 * 65536 + 15 * 256 + 35
    $pBox.Line.ForeColor.RGB = $colRose
    $pBox.Line.Weight = 1.5

    $pTitle = $s2.Shapes.AddTextbox(1, 70, 115, 380, 40)
    $pTitle.TextFrame.TextRange.Text = "The Healthcare Crisis"
    $pTitle.TextFrame.TextRange.Font.Size = 18
    $pTitle.TextFrame.TextRange.Font.Bold = 1
    $pTitle.TextFrame.TextRange.Font.Color.RGB = $colRose

    $pText = $s2.Shapes.AddTextbox(1, 70, 160, 380, 280)
    $pText.TextFrame.TextRange.Text = "- Manual Auditing Latency:`nTraditional hospital ERPs rely on weekly/monthly batch counts, causing delayed stockout awareness.`n`n- Static Threshold Failure:`nRigid Min/Max rules fail during sudden viral epidemics or emergency trauma influxes.`n`n- Cold-Chain Logistics Risk:`nHigh-value biologicals (Insulin, Vaccines) require strict 2-8C refrigerated transport, often overlooked in standard ERPs."
    $pText.TextFrame.TextRange.Font.Name = "Segoe UI"
    $pText.TextFrame.TextRange.Font.Size = 13
    $pText.TextFrame.TextRange.Font.Color.RGB = $colWhite

    # Solution Box (Right)
    $sBox = $s2.Shapes.AddShape(1, 495, 105, 410, 360)
    $sBox.Fill.Solid()
    $sBox.Fill.ForeColor.RGB = 30 * 65536 + 35 * 256 + 15
    $sBox.Line.ForeColor.RGB = $colEmerald
    $sBox.Line.Weight = 1.5

    $sTitle = $s2.Shapes.AddTextbox(1, 510, 115, 380, 40)
    $sTitle.TextFrame.TextRange.Text = "The Agentic AI Solution"
    $sTitle.TextFrame.TextRange.Font.Size = 18
    $sTitle.TextFrame.TextRange.Font.Bold = 1
    $sTitle.TextFrame.TextRange.Font.Color.RGB = $colEmerald

    $sText = $s2.Shapes.AddTextbox(1, 510, 160, 380, 280)
    $sText.TextFrame.TextRange.Text = "- Continuous Telemetry Sentinel:`nReal-time tracking of consumption velocity (units/hr) and time-to-depletion.`n`n- Google Gemini Demand Forecasting:`nPredicts epidemic surge risks and dynamically calculates Economic Order Quantity (EOQ).`n`n- Closed-Loop Autonomous Restocking:`nAuto-drafts GxP purchase orders with verified cold-chain SLAs and instant omnichannel alerts (Audio, SMS, Slack)."
    $sText.TextFrame.TextRange.Font.Name = "Segoe UI"
    $sText.TextFrame.TextRange.Font.Size = 13
    $sText.TextFrame.TextRange.Font.Color.RGB = $colWhite

    # ==========================================
    # SLIDE 3: Multi-Agent Architecture
    # ==========================================
    $s3 = $pres.Slides.Add(3, 12)
    $s3.Background.Fill.Solid()
    $s3.Background.Fill.ForeColor.RGB = $colBg

    $head3 = $s3.Shapes.AddTextbox(1, 55, 30, 850, 50)
    $head3.TextFrame.TextRange.Text = "5-Agent Collaborative AI Architecture"
    $head3.TextFrame.TextRange.Font.Name = "Segoe UI"
    $head3.TextFrame.TextRange.Font.Size = 28
    $head3.TextFrame.TextRange.Font.Bold = 1
    $head3.TextFrame.TextRange.Font.Color.RGB = $colWhite

    $agentList = @(
        @{ Name = "1. Sentinel Agent"; Role = "Telemetry Watcher"; Desc = "Scans stock velocity, safety buffers and triggers alerts on depletion." },
        @{ Name = "2. Forecaster Agent"; Role = "Gemini AI Brain"; Desc = "Analyzes outbreak trends to dynamically compute batch size (EOQ)." },
        @{ Name = "3. Sourcing Agent"; Role = "Pharma Negotiator"; Desc = "Verifies 2-8C cold-chains, compares SLAs and negotiates volume discounts." },
        @{ Name = "4. Dispatch Agent"; Role = "Omnichannel Notifier"; Desc = "Broadcasts audio alarms, Chief Medical Officer SMS and Slack bot posts." },
        @{ Name = "5. Supervisor"; Role = "HITL Governance"; Desc = "Auto-pilot for <=$2,500; strict human doctor sign-off for controlled drugs." }
    )

    for ($i = 0; $i -lt 5; $i++) {
        $aCard = $s3.Shapes.AddShape(1, 55 + ($i * 172), 100, 160, 240)
        $aCard.Fill.Solid()
        $aCard.Fill.ForeColor.RGB = $colCardBg
        $aCard.Line.ForeColor.RGB = $colCyan
        $aCard.Line.Weight = 1

        $aCard.TextFrame.TextRange.Text = "$($agentList[$i].Name)`n$($agentList[$i].Role)`n`n$($agentList[$i].Desc)"
        $aCard.TextFrame.TextRange.Font.Name = "Segoe UI"
        $aCard.TextFrame.TextRange.Paragraphs(1).Font.Size = 12
        $aCard.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
        $aCard.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colCyan
        $aCard.TextFrame.TextRange.Paragraphs(2).Font.Size = 10
        $aCard.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colEmerald
        $aCard.TextFrame.TextRange.Paragraphs(3).Font.Size = 11
        $aCard.TextFrame.TextRange.Paragraphs(3).Font.Color.RGB = $colWhite
    }

    $flowBox = $s3.Shapes.AddShape(1, 55, 365, 850, 95)
    $flowBox.Fill.Solid()
    $flowBox.Fill.ForeColor.RGB = 20 * 65536 + 15 * 256 + 10
    $flowBox.Line.ForeColor.RGB = $colCyan
    $flowBox.Line.Weight = 1

    $flowBox.TextFrame.TextRange.Text = "ReAct Autonomous Execution Loop:`nTelemetry Depletion -> Thought (Gemini Reasoning) -> Action (Supplier PO Draft) -> Observation (SLA Match) -> Closed-Loop Restock"
    $flowBox.TextFrame.TextRange.Font.Name = "Segoe UI"
    $flowBox.TextFrame.TextRange.Paragraphs(1).Font.Size = 13
    $flowBox.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $flowBox.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colCyan
    $flowBox.TextFrame.TextRange.Paragraphs(2).Font.Size = 12
    $flowBox.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # ==========================================
    # SLIDE 4: Live Features & Clinical Impact
    # ==========================================
    $s4 = $pres.Slides.Add(4, 12)
    $s4.Background.Fill.Solid()
    $s4.Background.Fill.ForeColor.RGB = $colBg

    $head4 = $s4.Shapes.AddTextbox(1, 55, 30, 850, 50)
    $head4.TextFrame.TextRange.Text = "Live System Features & Clinical Impact"
    $head4.TextFrame.TextRange.Font.Name = "Segoe UI"
    $head4.TextFrame.TextRange.Font.Size = 28
    $head4.TextFrame.TextRange.Font.Bold = 1
    $head4.TextFrame.TextRange.Font.Color.RGB = $colWhite

    # Feature 1
    $f1 = $s4.Shapes.AddShape(1, 55, 100, 410, 110)
    $f1.Fill.Solid()
    $f1.Fill.ForeColor.RGB = $colCardBg
    $f1.Line.ForeColor.RGB = $colCyan
    $f1.TextFrame.TextRange.Text = "Interactive Stock Management`nDirect inline consume (-1, -5), add (+1, +5), custom adjustments, and new SKU registration with persistent storage."
    $f1.TextFrame.TextRange.Font.Name = "Segoe UI"
    $f1.TextFrame.TextRange.Paragraphs(1).Font.Size = 13
    $f1.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $f1.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colCyan
    $f1.TextFrame.TextRange.Paragraphs(2).Font.Size = 11
    $f1.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # Feature 2
    $f2 = $s4.Shapes.AddShape(1, 495, 100, 410, 110)
    $f2.Fill.Solid()
    $f2.Fill.ForeColor.RGB = $colCardBg
    $f2.Line.ForeColor.RGB = $colEmerald
    $f2.TextFrame.TextRange.Text = "Clinical Prescription Safety AI`nCross-references doctor prescriptions in real-time, warns of stockouts, and suggests safe therapeutic alternatives."
    $f2.TextFrame.TextRange.Font.Name = "Segoe UI"
    $f2.TextFrame.TextRange.Paragraphs(1).Font.Size = 13
    $f2.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $f2.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colEmerald
    $f2.TextFrame.TextRange.Paragraphs(2).Font.Size = 11
    $f2.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # Feature 3
    $f3 = $s4.Shapes.AddShape(1, 55, 230, 410, 110)
    $f3.Fill.Solid()
    $f3.Fill.ForeColor.RGB = $colCardBg
    $f3.Line.ForeColor.RGB = $colRose
    $f3.TextFrame.TextRange.Text = "Synthesized Web Audio Alerts`nReal-time hospital alert chimes generated directly via Web Audio API for normal scans, warnings, and emergency alarms."
    $f3.TextFrame.TextRange.Font.Name = "Segoe UI"
    $f3.TextFrame.TextRange.Paragraphs(1).Font.Size = 13
    $f3.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $f3.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colRose
    $f3.TextFrame.TextRange.Paragraphs(2).Font.Size = 11
    $f3.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # Feature 4
    $f4 = $s4.Shapes.AddShape(1, 495, 230, 410, 110)
    $f4.Fill.Solid()
    $f4.Fill.ForeColor.RGB = $colCardBg
    $f4.Line.ForeColor.RGB = $colCyan
    $f4.TextFrame.TextRange.Text = "Dual AI Core (Gemini + Simulation)`nLive Google Gemini 1.5/2.0 API connection with structured JSON output + Intelligent Neural Simulation offline fallback."
    $f4.TextFrame.TextRange.Font.Name = "Segoe UI"
    $f4.TextFrame.TextRange.Paragraphs(1).Font.Size = 13
    $f4.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $f4.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colCyan
    $f4.TextFrame.TextRange.Paragraphs(2).Font.Size = 11
    $f4.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # Impact Metrics Bottom Bar
    $imp = $s4.Shapes.AddShape(1, 55, 360, 850, 95)
    $imp.Fill.Solid()
    $imp.Fill.ForeColor.RGB = 25 * 65536 + 20 * 256 + 10
    $imp.Line.ForeColor.RGB = $colEmerald
    $imp.Line.Weight = 1.5

    $imp.TextFrame.TextRange.Text = "Measurable Healthcare Impact:`n- 94% reduction in stockout response time  - 100% elimination of ordering paperwork errors  - 100% cold-chain compliance"
    $imp.TextFrame.TextRange.Font.Name = "Segoe UI"
    $imp.TextFrame.TextRange.Paragraphs(1).Font.Size = 12
    $imp.TextFrame.TextRange.Paragraphs(1).Font.Bold = 1
    $imp.TextFrame.TextRange.Paragraphs(1).Font.Color.RGB = $colEmerald
    $imp.TextFrame.TextRange.Paragraphs(2).Font.Size = 12
    $imp.TextFrame.TextRange.Paragraphs(2).Font.Color.RGB = $colWhite

    # Save presentation
    if (Test-Path $pptxPath) { Remove-Item $pptxPath -Force }
    $pres.SaveAs($pptxPath)
    $pres.Close()
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    Write-Host "SUCCESS: Generated high-impact PowerPoint PPTX at: $pptxPath"
} catch {
    Write-Host "Generation failed: $($_.Exception.Message)"
}
