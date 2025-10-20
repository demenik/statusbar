import Gio from "gi://Gio";
import GLib from "gi://GLib";

export type Env = Partial<{
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URL: string;
  [key: string]: string;
}>;

const env: Env = {};

const envFilePath = GLib.build_filenamev([".env"]);
const envFile = Gio.File.new_for_path(envFilePath);

try {
  if (envFile.query_exists(null)) {
    const [success, contents] = envFile.load_contents(null);

    if (success) {
      const decoder = new TextDecoder();
      const text = decoder.decode(contents);

      text.split("\n").forEach((line) => {
        if (!line.trim().startsWith("#")) {
          const [key, ...valueParts] = line.trim().split("=");
          const value = valueParts.join("=").trim();

          if (value.startsWith('"') && value.endsWith('"')) {
            env[key.trim()] = value.slice(1, -1);
          } else {
            env[key.trim()] = value;
          }
        }
      });
    }
  } else {
    console.warn(`[env] .env file not found at '${envFilePath}'`);
  }
} catch (error) {
  console.error(`[env] Failed to parse .env file: ${error}`);
}

export default env;
