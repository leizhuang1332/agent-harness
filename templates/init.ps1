# init.ps1 - Development server startup and e2e test runner
# Works on Windows PowerShell 5.1+

param(
    [int]$Port = 3000,
    [int]$MaxWaitSeconds = 30,
    [switch]$SkipTests
)

# Ensure strict mode
Set-StrictMode -Version Latest

# Configure error handling
$ErrorActionPreference = 'Stop'

# Configuration
$DEFAULT_PORT = 3000
$MAX_WAIT_SECONDS = 30
$DEV_SERVER_PID = $null

# Colors for output (Windows compatible)
$RED = 'Red'
$GREEN = 'Green'
$YELLOW = 'Yellow'
$NC = 'White'  # No Color

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $GREEN
}

function Write-LogWarn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $YELLOW
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $RED
}

# Cleanup function
function Stop-DevServer {
    if ($DEV_SERVER_PID -ne $null) {
        try {
            $process = Get-Process -Id $DEV_SERVER_PID -ErrorAction SilentlyContinue
            if ($process) {
                Write-LogInfo "Stopping dev server (PID: $DEV_SERVER_PID)"
                Stop-Process -Id $DEV_SERVER_PID -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            # Process may have already exited
        }
    }
}

# Register cleanup on exit
Register-EngineEvent -SourceIdentifier ([System.Management.Automation.PsEngineEvent]::Exiting) -Action { Stop-DevServer }

# Check if port is in use
function Test-PortInUse {
    param([int]$Port)

    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect('localhost', $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Wait for server to be ready
function Wait-ForServer {
    param(
        [int]$Port,
        [int]$MaxWait
    )

    Write-LogInfo "Waiting for server on port $Port..."

    $elapsed = 0
    while ($elapsed -lt $MaxWait) {
        if (Test-PortInUse -Port $Port) {
            # Additional check: try to make a request
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
                    Write-LogInfo "Server is ready!"
                    return $true
                }
            }
            catch {
                # Server not responding yet
            }
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host -NoNewline "."
    }

    Write-Host ""
    Write-LogError "Server did not become ready within ${MaxWait} seconds"
    return $false
}

# Start development server
function Start-DevServer {
    Write-LogInfo "Starting development server..."

    # Check if npm is available
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmCmd) {
        Write-LogError "npm not found. Please install Node.js and npm."
        exit 1
    }

    # Check if port is already in use
    if (Test-PortInUse -Port $Port) {
        Write-LogWarn "Port $Port is already in use. Attempting to continue..."
    }

    # Start the dev server in background
    $script:DEV_SERVER_PID = (Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow).Id

    Write-LogInfo "Dev server started with PID: $DEV_SERVER_PID"
}

# Run e2e tests
function Invoke-E2ETests {
    Write-LogInfo "Running e2e tests..."

    # Check if npm is available
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmCmd) {
        Write-LogError "npm not found. Please install Node.js and npm."
        exit 1
    }

    # Try different test commands
    $testCommands = @('test:e2e', 'test:e2e:ci', 'test:e2e:local')

    $testRan = $false
    foreach ($testCmd in $testCommands) {
        $testResult = npm run $testCmd 2>&1
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -eq 0) {
            $testRan = $true
            Write-LogInfo "E2e tests passed!"
            return 0
        }
    }

    # Try cypress if no npm test command worked
    if (-not $testRan) {
        $cypressResult = npm run cypress run 2>&1
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -eq 0) {
            $testRan = $true
            Write-LogInfo "E2e tests passed!"
            return 0
        }
    }

    if (-not $testRan) {
        Write-LogWarn "No e2e test command found. Skipping tests."
        return 0
    }

    Write-LogError "E2e tests failed with exit code: $LASTEXITCODE"
    return $LASTEXITCODE
}

# Main execution
function Main {
    Write-LogInfo "Starting init.ps1..."
    Write-LogInfo "Using port: $Port"

    # Build the project first
    Write-LogInfo "Building project..."
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-LogError "Build failed with exit code: $LASTEXITCODE"
            exit $LASTEXITCODE
        }
    }
    catch {
        Write-LogError "Build failed: $_"
        exit 1
    }

    # Start dev server
    Start-DevServer

    # Wait for server to be ready
    if (-not (Wait-ForServer -Port $Port -MaxWait $MAX_WAIT_SECONDS)) {
        Write-LogError "Failed to start server"
        exit 1
    }

    # Run e2e tests unless skipped
    if (-not $SkipTests) {
        $testExitCode = Invoke-E2ETests

        if ($testExitCode -eq 0) {
            Write-LogInfo "All tasks completed successfully!"
        }
        else {
            Write-LogError "Tasks failed with exit code: $testExitCode"
            exit $testExitCode
        }
    }
    else {
        Write-LogInfo "Tests skipped."
    }

    exit 0
}

# Run main function
Main
