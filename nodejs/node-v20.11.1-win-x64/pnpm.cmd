@ECHO off
SET dp0=%~dp0
SET "_prog=%dp0%\node.exe"
"%_prog%" "%dp0%\node_modules\pnpm\bin\pnpm.cjs" %*
