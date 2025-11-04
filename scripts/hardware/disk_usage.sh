INTERVAL="1"

if [ -n "$1" ]; then
  INTERVAL="$1"
fi

read -r R1 W1 < <(awk '/ (sd|hd|vd)[a-z] / || / nvme[0-9]n[0-9] / {rs+=$6; ws+=$10} END {print rs, ws}' /proc/diskstats)

sleep "$INTERVAL"

read -r R2 W2 < <(awk '/ (sd|hd|vd)[a-z] / || / nvme[0-9]n[0-9] / {rs+=$6; ws+=$10} END {print rs, ws}' /proc/diskstats)

R_BPS=$((((R2 - R1) * 512) / INTERVAL))
W_BPS=$((((W2 - W1) * 512) / INTERVAL))

echo "$R_BPS $W_BPS" | awk '{
  r=$1; w=$2
  unit_r="B/s"; unit_w="B/s"

  if (r > 1024) { r/=1024; unit_r="KB/s" }
  if (r > 1024) { r/=1024; unit_r="MB/s" }
  if (r > 1024) { r/=1024; unit_r="GB/s" }

  if (w > 1024) { w/=1024; unit_w="KB/s" }
  if (w > 1024) { w/=1024; unit_w="MB/s" }
  if (w > 1024) { w/=1024; unit_w="GB/s" }

  printf "%.0f%s %.0f%s", r, unit_r, w, unit_w
}'
