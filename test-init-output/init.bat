@echo off
REM Initialize the agent harness project

echo Installing dependencies...
call npm install

echo Building project...
call npm run build

echo Running tests...
call npm test

echo Setup complete!
