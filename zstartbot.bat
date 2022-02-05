@echo off
title Bot Activator&cls&echo============================================================================&echo Activating Bot Please Wait&echo ============================================================================&echo
heroku ps:scale web=0 & heroku ps:scale worker=1 & heroku logs --tail & node --trace-warnings