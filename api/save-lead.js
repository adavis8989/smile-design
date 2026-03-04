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

  // Check if Monday.com is configured
  if (!process.env.MONDAY_API_TOKEN || !process.env.MONDAY_BOARD_ID) {
    console.warn('Monday.com not configured. Lead data:', {
      firstName,
      lastName,
      email,
      phone,
      zipCode,
    });
    // Return success even without Monday - don't block the user flow
    return res.status(200).json({ success: true, warning: 'Lead storage not configured' });
  }

  try {
    const boardId = process.env.MONDAY_BOARD_ID;

    // Column values mapped to Monday.com default column types
    const columnValues = {};

    // Name goes in the item name (first argument to create_item)
    const itemName = `${firstName} ${lastName}`;

    // Map other fields to columns by ID
    // Standard Monday.com column IDs: email, phone, text, ...
    // We use a generic mapping - users can customize column IDs via env
    if (email) columnValues.email = { email, text: email };
    if (phone) columnValues.phone = { phone, countryShortName: 'US' };
    if (zipCode) columnValues.text = zipCode;
    if (generatedPhotoUrl) columnValues.link = { url: generatedPhotoUrl, text: 'View Smile' };

    const mutation = `mutation {
      create_item(
        board_id: ${boardId},
        item_name: ${JSON.stringify(itemName)},
        column_values: ${JSON.stringify(JSON.stringify(columnValues))}
      ) {
        id
      }
    }`;

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.MONDAY_API_TOKEN,
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      console.error('Monday.com API errors:', data.errors);
      return res.status(500).json({ error: 'Failed to save your information. Please try again.' });
    }

    return res.status(200).json({ success: true, itemId: data.data?.create_item?.id });
  } catch (err) {
    console.error('Monday.com error:', err);
    return res.status(500).json({ error: 'Failed to save your information. Please try again.' });
  }
}
