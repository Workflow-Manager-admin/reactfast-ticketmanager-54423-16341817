#!/bin/bash
cd /home/kavia/workspace/code-generation/reactfast-ticketmanager-54423-16341817/ticketing_backend_workspace/ticketing_backend
source venv/bin/activate
flake8 .
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

