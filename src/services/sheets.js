/**
 * Save lead data to Google Sheets via serverless function.
 */
export async function saveLead(contactData) {
  const response = await fetch('/api/save-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save contact information.');
  }

  return response.json();
}
