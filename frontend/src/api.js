/**
 * Safe API response parser - handles non-JSON responses (e.g. Vercel error pages)
 */
export async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Not JSON response:", text);
    if (!response.ok) {
      throw new Error(text || `Server error (${response.status})`);
    }
    throw new Error('Invalid response from server');
  }
}
