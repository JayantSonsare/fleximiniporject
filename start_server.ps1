# =========================================================================
# PharmSentinel AI - Lightweight PowerShell HTTP Server
# Runs purely on built-in Windows .NET HttpListener without node/python!
# =========================================================================

$path = $PSScriptRoot
$port = 8080

# Load .env file if present
$envFile = Join-Path $path ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $varName = $parts[0].Trim()
            $varVal = $parts[1].Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($varName, $varVal, "Process")
        }
    }
    if ($env:PORT) {
        $port = [int]$env:PORT
    }
}

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " PharmSentinel AI - Automated Out-of-Stock Alert & Restocking System" -ForegroundColor Green
Write-Host " Subject: Agentic AI and Automation (Google Gemini AI Enabled)" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting local HTTP server at: http://localhost:$port/" -ForegroundColor White

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server running! Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:$port/index.html"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }

        # Dynamic environment configuration endpoint
        if ($localPath -eq "env.json") {
            $envObj = @{
                GEMINI_API_KEY = if ($env:GEMINI_API_KEY) { $env:GEMINI_API_KEY } else { "" }
                GEMINI_MODEL = if ($env:GEMINI_MODEL) { $env:GEMINI_MODEL } else { "gemini-1.5-flash" }
                HOSPITAL_FACILITY_NAME = if ($env:HOSPITAL_FACILITY_NAME) { $env:HOSPITAL_FACILITY_NAME } else { "St. Jude Memorial Health System" }
            }
            $jsonString = $envObj | ConvertTo-Json
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $filePath = Join-Path $path $localPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content Type Mapping
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $response.Close()
    }
} catch {
    Write-Host "Server stopped or error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
}
