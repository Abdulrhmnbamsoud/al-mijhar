#!/bin/bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/research \
  -H 'Content-Type: application/json' \
  -d '{"guestName": "ياسر الرميان", "role": "محافظ صندوق الاستثمارات العامة", "depth": "متقدم"}')

echo "POST Response: $RESPONSE"
JOB_ID=$(echo $RESPONSE | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
  echo "Failed to get jobId"
  exit 1
fi

echo "Job ID: $JOB_ID"

while true; do
  STATUS_RESPONSE=$(curl -s http://localhost:3000/api/research/$JOB_ID/status)
  STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  PROGRESS=$(echo $STATUS_RESPONSE | grep -o '"progress":[^,]*' | cut -d':' -f2)
  ERROR=$(echo $STATUS_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)
  
  echo "Status: $STATUS | Progress: $PROGRESS"
  
  if [ "$STATUS" == "completed" ]; then
    echo "Job completed successfully."
    curl -s http://localhost:3000/api/research/$JOB_ID > report.json
    break
  elif [ "$STATUS" == "failed" ]; then
    echo "Job failed with error: $ERROR"
    break
  fi
  sleep 5
done
