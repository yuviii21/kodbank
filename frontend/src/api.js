/**
 * Safe API response parser - handles non-JSON responses (e.g. Vercel error pages)
 */
export async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    if (!response.ok) {
      throw new Error(text || `Server error (${response.status})`);
    }
    throw new Error('Invalid response from server');
  }
}
