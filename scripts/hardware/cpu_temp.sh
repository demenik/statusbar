TEMP_FILE="/sys/class/thermal/thermal_zone0/temp"

if [ -r "$TEMP_FILE" ]; then
  awk '{printf "%.0f°C", $1 / 1000}' "$TEMP_FILE"
else
  echo "N/A"
fi
