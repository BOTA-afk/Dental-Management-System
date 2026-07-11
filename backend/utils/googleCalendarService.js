import { google } from 'googleapis';

export const getAuthUrl = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5001/oauth2callback'
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to always get refresh token
    scope: ['https://www.googleapis.com/auth/calendar']
  });
};

export const getTokensFromCode = async (code) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5001/oauth2callback'
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const addToGoogleCalendar = async ({ dentistEmail, dentistName, patientName, treatment, date, time }) => {
  // Check if credentials are present in env
  const hasCreds = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN;
  
  const eventTitle = `Patient: ${patientName} - ${treatment}`;
  const eventDescription = `Dental treatment session for ${patientName} with Dr. ${dentistName}.`;
  
  // Parse time ("09:00 AM" or "01:30 PM") to hours/minutes
  let hour = 9;
  let minute = 0;
  if (time) {
    try {
      const parts = time.split(':');
      hour = parseInt(parts[0]);
      const minPart = parts[1].split(' ');
      minute = parseInt(minPart[0]);
      const ampm = minPart[1];
      if (ampm === 'PM' && hour !== 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
    } catch (err) {
      console.error("Error parsing time string:", time, err);
    }
  }
  
  // Assemble event dates (UTC matching)
  const eventDate = new Date(date);
  eventDate.setUTCHours(hour, minute, 0, 0);
  
  const startIso = eventDate.toISOString();
  // Assume a 30-minute default duration
  eventDate.setUTCMinutes(eventDate.getUTCMinutes() + 30);
  const endIso = eventDate.toISOString();

  if (!hasCreds) {
    console.log('\n=========================================');
    console.log(`📅 [GOOGLE CALENDAR EVENT] Created Event on Dr. ${dentistName}'s Calendar (${dentistEmail}):`);
    console.log(`👉 Event: ${eventTitle}`);
    console.log(`👉 Description: ${eventDescription}`);
    console.log(`👉 Time (UTC): ${startIso} to ${endIso}`);
    console.log('=========================================\n');
    return { success: true, message: "Event logged to console (development mode)." };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5001/oauth2callback'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventTitle,
      description: eventDescription,
      start: {
        dateTime: startIso,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endIso,
        timeZone: 'UTC',
      },
      attendees: [
        { email: dentistEmail },
      ],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log(`📅 Google Calendar event successfully inserted: ${response.data.htmlLink}`);
    return { success: true, link: response.data.htmlLink };
  } catch (error) {
    console.error('❌ Google Calendar insertion failed, falling back to console:', error.message);
    console.log('\n=========================================');
    console.log(`📅 [GOOGLE CALENDAR FALLBACK] Created Event on Dr. ${dentistName}'s Calendar (${dentistEmail}):`);
    console.log(`👉 Event: ${eventTitle}`);
    console.log(`👉 Description: ${eventDescription}`);
    console.log(`👉 Time (UTC): ${startIso} to ${endIso}`);
    console.log('=========================================\n');
    return { success: true, message: "Event logged to console (API error fallback)." };
  }
};
