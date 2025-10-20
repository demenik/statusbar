import { calendar_v3, google } from "googleapis";
import { GoogleApi } from ".";

export class GoogleCalendarApi extends GoogleApi {
  private _calendar: calendar_v3.Calendar;

  constructor() {
    super();

    this._calendar = google.calendar({
      version: "v3",
      auth: this._oauth2Client,
    });
  }

  public async fetchCalendars() {
    if (!this.isAuthenticated) return;

    try {
      const response = await this._calendar.calendarList.list();
      return response.data.items;
    } catch (error) {
      console.error(`[googleapis] Error fetching calendars: ${error}`);
    }
  }
}
