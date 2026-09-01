#!/usr/bin/env bash

LOG_FILE="${BADLOG_FILE:-/var/log/bad.log}"
INTERVAL="${CHECK_INTERVAL:-6}"

if [ ! -f "$LOG_FILE" ]; then
    echo 'Wrong'
    exit 41
fi

SIZE1=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE")
sleep "$INTERVAL"

if [ ! -f "$LOG_FILE" ]; then
    echo 'Wrong'
    exit 41
fi

SIZE2=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE")

if [ "$SIZE1" -eq "$SIZE2" ]; then
    echo 'Correct'
    exit 42
else
    echo 'Wrong'
    exit 41
fi
