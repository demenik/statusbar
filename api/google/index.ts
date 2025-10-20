import Soup from "gi://Soup";
import { Auth, google } from "googleapis";
import env from "../../utils/env";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import { Buffer } from "buffer";
import { execAsync } from "ags/process";

export abstract class GoogleApi {
  protected _oauth2Client: Auth.OAuth2Client;
  private _tokenPath = GLib.build_filenamev([
    GLib.get_user_cache_dir(),
    "ags-statusbar",
    "google-token.json",
  ]);
  private _server?: Soup.Server;
  private _encoder = new TextEncoder();

  public authUrl?: string;
  public isAuthenticated = false;

  constructor() {
    if (
      !env.GOOGLE_CLIENT_ID ||
      !env.GOOGLE_CLIENT_SECRET ||
      !env.GOOGLE_REDIRECT_URL
    ) {
      console.error(
        "[googleapis] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_REDIRECT_URL not found in .env",
      );
      this._oauth2Client = null!;
      return;
    }

    this._oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URL,
    );

    this.authenticate();
  }

  async authenticate() {
    try {
      if (await this._loadToken()) {
        console.log("[googleapis] Authenticated from cached token");
        this.isAuthenticated = true;

        return true;
      } else {
        const url = this._oauth2Client.generateAuthUrl({
          access_type: "offline",
          prompt: "consent",
          scope: ["https://www.googleapis.com/auth/calendar.readwrite"],
        });
        this.authUrl = url;

        return await this._startServer();
      }
    } catch (error) {
      console.error(`[googleapis] Authentication failed: ${error}`);
      return false;
    }
  }

  private _startServer() {
    return new Promise<boolean>(async (resolve, reject) => {
      if (!env.GOOGLE_REDIRECT_URL)
        return reject("GOOGLE_REDIRECT_URL is not set");

      const port = new URL(env.GOOGLE_REDIRECT_URL).port ?? "3000";
      this._server = new Soup.Server();

      this._server.add_handler("/", async (_server, msg, _path, query) => {
        if (query?.code) {
          await this._getTokensWithCode(query.code);

          msg.set_status(200, null);
          msg.set_response(
            "text/html",
            -1,
            this._encoder.encode(
              "<h1>Authentication Successful</h1><p>You can now close this window.</p>",
            ),
          );
        } else {
          msg.set_status(400, null);
          msg.set_response(
            "text/html",
            -1,
            this._encoder.encode(
              "<h1>Authentication Failed</h1><p>No authorization code was received.</p>",
            ),
          );
        }

        this._server?.disconnect();
        this._server = undefined;
        resolve(msg.get_status() === 200);
      });

      this._server?.listen_local(parseInt(port), null);
      await execAsync(["xdg-open", env.GOOGLE_REDIRECT_URL!]);

      console.log(
        `[googleapis] Server listening on port ${port} for auth callback`,
      );
    });
  }

  private async _getTokensWithCode(code: string) {
    try {
      const { tokens } = await this._oauth2Client.getToken(code);

      this._oauth2Client.setCredentials(tokens);
      await this._saveToken(tokens);

      this.isAuthenticated = true;
      this.authUrl = undefined;
      console.log("[googleapis] Successfully obtained and saved tokens");
    } catch (error) {
      console.error(`[googleapis] Error getting tokens: ${error}`);
    }
  }

  private async _loadToken() {
    const file = Gio.File.new_for_path(this._tokenPath);
    if (!file.query_exists(null)) return false;

    const [_, contents] = await file.load_contents_async(null);
    const token: Auth.Credentials = JSON.parse(contents);
    this._oauth2Client.setCredentials(token);

    const expiryDate =
      JSON.parse(
        Buffer.from(token.id_token!.split(".")[1], "base64").toString(),
      ).exp * 1000;

    if (expiryDate < Date.now()) {
      console.log("[googleapis] Token expired, refreshing...");
      const { credentials } = await this._oauth2Client.refreshAccessToken();
      await this._saveToken(credentials);
    }

    return true;
  }

  private async _saveToken(token: Auth.Credentials) {
    const file = Gio.File.new_for_path(this._tokenPath);
    const dir = file.get_parent();

    if (dir && !dir.query_exists(null)) {
      dir.make_directory_with_parents(null);
    }

    await file.replace_contents_async(
      JSON.stringify(token),
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null,
    );
  }
}
