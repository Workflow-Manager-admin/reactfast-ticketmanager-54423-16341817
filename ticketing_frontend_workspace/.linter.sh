#!/bin/bash
cd /home/kavia/workspace/code-generation/reactfast-ticketmanager-54423-16341817/ticketing_frontend_workspace/ticketing_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

