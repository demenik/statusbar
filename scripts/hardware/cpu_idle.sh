top -b -n 1 | grep "Cpu(s)" | awk '{print $8}' | sed 's/,/./'
