INTERVAL="1"

if [ -n "$1" ]; then
  INTERVAL="$1"
fi

read -r R1 T1 < <(awk '/:/ && $1 != "lo:" {rx+=$2; tx+=$10} END {print rx, tx}' /proc/net/dev)

sleep "$INTERVAL"

read -r R2 T2 < <(awk '/:/ && $1 != "lo:" {rx+=$2; tx+=$10} END {print rx, tx}' /proc/net/dev)

RX_BPS=$(((R2 - R1) / INTERVAL))
TX_BPS=$(((T2 - T1) / INTERVAL))

echo "$RX_BPS $TX_BPS" | awk '{
  rx=$1; tx=$2
  unit_rx="B/s"; unit_tx="B/s"

  if (rx > 1024) { rx/=1024; unit_rx="KB/s" }
  if (rx > 1024) { rx/=1024; unit_rx="MB/s" }
  if (rx > 1024) { rx/=1024; unit_rx="GB/s" }

  if (tx > 1024) { tx/=1024; unit_tx="KB/s" }
  if (tx > 1024) { tx/=1024; unit_tx="MB/s" }
  if (tx > 1024) { tx/=1024; unit_tx="GB/s" }

  printf "%.0f%s %.0f%s", rx, unit_rx, tx, unit_tx
}'
