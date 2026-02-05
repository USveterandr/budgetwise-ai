import { CalendarEvent } from './database';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export interface AppleCalendarEvent {
  id: string;
  title: string;
  notes?: string;
  startDate: string;
  endDate: string;
}

export class CalendarSyncService {
  private static instance: CalendarSyncService;

  static getInstance(): CalendarSyncService {
    if (!CalendarSyncService.instance) {
      CalendarSyncService.instance = new CalendarSyncService();
    }
    return CalendarSyncService.instance;
  }

  async syncGoogleCalendar(accessToken: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' +
          new Date().toISOString() +
          '&maxResults=100',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      const googleEvents = data.items || [];

      return googleEvents.map((event: GoogleCalendarEvent) => ({
        id: event.id,
        title: event.summary,
        description: event.description,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        userId: '',
        source: 'google',
      }));
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      return [];
    }
  }

  async syncAppleCalendar(): Promise<CalendarEvent[]> {
    try {
      console.log('Apple Calendar sync requires native integration');
      return [];
    } catch (error) {
      console.error('Error syncing Apple Calendar:', error);
      return [];
    }
  }

  async syncOutlookCalendar(accessToken: string): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/calendar/events?$top=100&$orderby=start/dateTime asc',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      const outlookEvents = data.value || [];

      return outlookEvents.map((event: any) => ({
        id: event.id,
        title: event.subject,
        description: event.bodyPreview,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        userId: '',
        source: 'outlook',
      }));
    } catch (error) {
      console.error('Error syncing Outlook Calendar:', error);
      return [];
    }
  }

  async getAllSyncedCalendars(
    googleAccessToken?: string,
    outlookAccessToken?: string
  ): Promise<CalendarEvent[]> {
    const allEvents: CalendarEvent[] = [];

    if (googleAccessToken) {
      const googleEvents = await this.syncGoogleCalendar(googleAccessToken);
      allEvents.push(...googleEvents);
    }

    const appleEvents = await this.syncAppleCalendar();
    allEvents.push(...appleEvents);

    if (outlookAccessToken) {
      const outlookEvents = await this.syncOutlookCalendar(outlookAccessToken);
      allEvents.push(...outlookEvents);
    }

    return allEvents;
  }

  async exportTaskToCalendar(
    calendarType: 'google' | 'outlook',
    accessToken: string,
    task: { title: string; description?: string; dueDate: string }
  ): Promise<boolean> {
    try {
      const event = {
        summary: task.title,
        description: task.description,
        start: {
          date: task.dueDate,
        },
        end: {
          date: task.dueDate,
        },
      };

      let url = '';
      if (calendarType === 'google') {
        url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      } else {
        url = 'https://graph.microsoft.com/v1.0/me/calendar/events';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      return response.ok;
    } catch (error) {
      console.error('Error exporting task to calendar:', error);
      return false;
    }
  }

  async checkCalendarSyncStatus(): Promise<{
    google: boolean;
    apple: boolean;
    outlook: boolean;
  }> {
    return {
      google: false,
      apple: false,
      outlook: false,
    };
  }
}

export default CalendarSyncService.getInstance();
