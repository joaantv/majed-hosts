@echo off
chcp 65001 >nul
cd /d "%~dp0"
node sign.mjs || goto fail
git add hosts.txt hosts.json || goto fail
git commit -m "update hosts" || goto fail
git push || goto fail
echo.
echo OK - published
pause
exit /b 0
:fail
echo.
echo FAILED
pause
exit /b 1
