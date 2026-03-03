import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, zipCode, generatedPhotoUrl } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if Google Sheets is configured
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_SHEET_ID) {
    console.warn('Google Sheets not configured. Lead data:', {
      firstName,
      lastName,
      email,
      phone,
      zipCode,
    });
    // Return success even without sheets - don't block the user flow
    return res.status(200).json({ success: true, warning: 'Lead storage not configured' });
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            new Date().toISOString(),
            firstName,
            lastName,
            email,
            phone || '',
            zipCode || '',
            '', // Original photo URL - omitted to save sheet space
            generatedPhotoUrl || '',
          ],
        ],
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Google Sheets error:', err);
    // Don't expose internal error details
    return res.status(500).json({ error: 'Failed to save your information. Please try again.' });
  }
}
