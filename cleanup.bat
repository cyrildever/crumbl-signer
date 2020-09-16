echo Cleaning up...

del "node_modules\*.*" /s /f /q > nul
rmdir node_modules /s /q
del "dist\*.*" /s /f /q > nul
rmdir dist /s /q
del "crumbl-signer.log" /s /f /q > nul

echo Done!