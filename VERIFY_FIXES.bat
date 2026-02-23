@echo off
REM Verification script for all fixes
echo.
echo ========================================
echo VERIFYING ALL FIXES
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/4] Installing dependencies...
    call npm install
) else (
    echo [1/4] Dependencies already installed
)

echo.
echo [2/4] Cleaning old build...
rmdir /s /q .next 2>nul
if exist "next.log" del next.log

echo.
echo [3/4] Building project...
call npm run build > build.log 2>&1

echo.
echo [4/4] Checking build results...
if exist ".next" (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo Next steps:
    echo 1. Run: npm run dev
    echo 2. Open browser: http://localhost:3000
    echo 3. Press F12 to check Console (should have NO hydration errors)
    echo 4. Check if therapists load
    echo.
) else (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Check build.log for errors:
    type build.log | findstr /c:"error"
    echo.
)

pause
