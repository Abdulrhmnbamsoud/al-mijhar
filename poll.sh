#!/bin/bash
JOB_ID="5f3e09a0-4b3f-4c13-aa03-8f12b77d551d"
while true; do
  STATUS=$(curl -s http://localhost:3000/api/research/$JOB_ID/status)
  echo "$STATUS"
  
  if echo "$STATUS" | grep -q '"status":"completed"'; then
    echo "Job completed successfully."
    curl -s http://localhost:3000/api/research/$JOB_ID > report.json
    break
  elif echo "$STATUS" | grep -q '"status":"failed"'; then
    echo "Job failed."
    break
  fi
  sleep 5
done
