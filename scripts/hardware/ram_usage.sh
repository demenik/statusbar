free | awk '/Mem:/ {
  used=$3/1024/1024
  printf "%.1fGB", used
}'
