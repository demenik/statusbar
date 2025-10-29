import app from "ags/gtk4/app";
import { exec } from "ags/process";

const appIcons: Record<string, string> = {
  spotify: "spotify-client",
  firefox: "firefox",
  bettersoundcloud: "soundcloud",
};

export const getAppIcon = (name: string): string | undefined => {
  const result = appIcons[name.toLowerCase()];
  if (result !== undefined) return result;

  try {
    return exec(["bash", "-c", `${SRC}/scripts/find_icon.sh ${name}`]);
  } catch (_) {
    return undefined;
  }
};
