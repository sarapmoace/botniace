@echo off 
title Deploying&cls&echo============================================================================&echo Deploying Bot Please Wait&echo ============================================================================&echo
git rm -r --cached .
git add .
git commit -m "Deploying........"

git push -f heroku HEAD:master