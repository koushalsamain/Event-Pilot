@echo off
title EventPilot - DB Browser for SQLite Launcher
echo ========================================================
echo Opening EventPilot Database in DB Browser for SQLite...
echo Database: %~dp0backend\eventpilot.db
echo ========================================================

start "" "C:\Program Files\DB Browser for SQLite\DB Browser for SQLite.exe" "%~dp0backend\eventpilot.db"
exit
