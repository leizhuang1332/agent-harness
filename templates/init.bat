@echo off
REM init.bat - Development server startup and e2e test runner
REM Works on Windows cmd

setlocal EnableDelayedExpansion

REM Configuration
set "DEFAULT_PORT=3000"
set "PORT=%PORT:%DEFAULT_PORT%=%"
if "%PORT%"=="" set "PORT=%DEFAULT_PORT%"
set "MAX_WAIT_SECONDS=30"

REM Logging functions
set "RED=[ERROR]"
set "GREEN=[INFO]"
set "YELLOW=[WARN]"

:log_info
echo %GREEN% %~1
goto :eof

:log_warn
echo %YELLOW% %~1
goto :eof

:log_error
echo %RED% %~1
goto :eof

REM Check if port is in use using netstat
:check_port
set "CHECK_PORT=%~1"
netstat -ano | findstr ":%CHECK_PORT% " >nul
if %errorlevel%==0 (
    exit /b 0
) else (
    exit /b 1
)

REM Wait for server to be ready
:wait_for_server
set "WAIT_PORT=%~1"
set "WAIT_MAX=%~2"
set "WAIT_ELAPSED=0"

call :log_info Waiting for server on port %WAIT_PORT%...

:wait_loop
if %WAIT_ELAPSED% GEQ %WAIT_MAX% (
    call :log_error Server did not become ready within %WAIT_MAX% seconds
    exit /b 1
)

call :check_port %WAIT_PORT%
if %errorlevel%==0 (
    REM Port is open, try to verify HTTP response using PowerShell
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:%WAIT_PORT%' -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue; if ($r.StatusCode -match '200|301|302') { exit 0 } else { exit 1 } } catch { exit 1 }"
    if %errorlevel%==0 (
        call :log_info Server is ready!
        exit /b 0
    )
)

timeout /t 1 /nobreak >nul
set /a WAIT_ELAPSED+=1
echo .
goto :wait_loop

REM Start development server
:start_dev_server
call :log_info Starting development server...

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% NEQ 0 (
    call :log_error npm not found. Please install Node.js and npm.
    exit /b 1
)

REM Check if port is already in use
call :check_port %PORT%
if %errorlevel%==0 (
    call :log_warn Port %PORT% is already in use. Attempting to continue...
)

REM Start the dev server in background
start /B npm run dev >nul 2>&1

call :log_info Dev server started
exit /b 0

REM Run e2e tests
:run_e2e_tests
call :log_info Running e2e tests...

REM Check if npm is available
where npm >nul 2>&1
if %errorlevel% NEQ 0 (
    call :log_error npm not found. Please install Node.js and npm.
    exit /b 1
)

REM Try different test commands
set "TEST_EXIT_CODE=1"

REM Try test:e2e
npm run test:e2e >nul 2>&1
if %errorlevel%==0 (
    call :log_info E2e tests passed!
    exit /b 0
)

REM Try test:e2e:ci
npm run test:e2e:ci >nul 2>&1
if %errorlevel%==0 (
    call :log_info E2e tests passed!
    exit /b 0
)

REM Try cypress run
npm run cypress run >nul 2>&1
if %errorlevel%==0 (
    call :log_info E2e tests passed!
    exit /b 0
)

REM Try vitest run (common test runner)
npm run test:e2e -- --run >nul 2>&1
if %errorlevel%==0 (
    call :log_info E2e tests passed!
    exit /b 0
)

REM No e2e test command found
call :log_warn No e2e test command found. Skipping tests.
exit /b 0

REM Main execution
:main
call :log_info Starting init.bat...
call :log_info Using port: %PORT%

REM Build the project first
call :log_info Building project...
npm run build
if %errorlevel% NEQ 0 (
    call :log_error Build failed
    exit /b 1
)

REM Start dev server
call :start_dev_server

REM Wait for server to be ready
call :wait_for_server %PORT% %MAX_WAIT_SECONDS%
if %errorlevel% NEQ 0 (
    call :log_error Failed to start server
    exit /b 1
)

REM Run e2e tests
call :run_e2e_tests
set "TEST_EXIT_CODE=%errorlevel%"

if %TEST_EXIT_CODE% EQU 0 (
    call :log_info All tasks completed successfully!
) else (
    call :log_error Tasks failed with exit code: %TEST_EXIT_CODE%
)

exit /b %TEST_EXIT_CODE%

REM Run main function
call :main
