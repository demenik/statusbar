set -e
set -o pipefail

error() {
  echo "Error: $1" >&2
  exit 1
}

if [ -z "$1" ]; then
  echo "Usage: $0 <window_class_name>"
  echo "Example: $0 Spotify"
  exit 1
fi
class_name="$1"

declare -a desktop_dirs=(
  "$HOME/.nix-profile/share/applications/" # nix-os
  "$HOME/.local/share/applications/"
  "/usr/share/applications"
  "/usr/local/share/applications"
  "/var/lib/snapd/desktop/applications"         # snap packages
  "/var/lib/flatpak/exports/share/applications" # flatpak
)

desktop_file=""
for dir in "${desktop_dirs[@]}"; do
  if [ -d "$dir" ]; then
    desktop_file=$(grep -rl --include="*.desktop" -E "^StartupWMClass=\b${class_name}\b" "$dir" 2>/dev/null | head -n 1) || true
    if [ -n "$desktop_file" ]; then
      break
    fi
  fi
done

if [ -z "$desktop_file" ]; then
  class_name_lower=$(echo "$class_name" | tr '[:upper:]' '[:lower:]')
  for dir in "${desktop_dirs[@]}"; do
    potential_file="$dir/${class_name_lower}.desktop"
    if [ -f "$potential_file" ]; then
      desktop_file="$potential_file"
      break
    fi
  done
fi

if [ -z "$desktop_file" ] || [ ! -f "$desktop_file" ]; then
  error "Could not find a .desktop file for class '$class_name'."
fi

icon_name=$(grep -E "^Icon=" "$desktop_file" | cut -d'=' -f2)

if [ -z "$icon_name" ]; then
  error "No 'Icon=' entry found in '$desktop_file'."
fi

echo "$icon_name"
