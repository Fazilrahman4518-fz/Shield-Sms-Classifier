/**
 * API service for ShieldSMS backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    // Attempt fallback direct connection if running in dev without proxy
    try {
      const fallbackRes = await fetch('http://127.0.0.1:5001/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch {
      // ignore fallback error
    }
    throw err;
  }
}

export async function fetchSampleMessages() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/samples`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to load sample messages');
    return await res.json();
  } catch (err) {
    // Fallback direct
    try {
      const fallbackRes = await fetch('http://127.0.0.1:5001/api/samples', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch {
      // ignore
    }
    throw err;
  }
}

export async function classifyMessage(messageText) {
  if (!messageText || !messageText.trim()) {
    throw new Error('Please enter a message before checking.');
  }

  let endpoint = `${API_BASE_URL}/api/predict`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ message: messageText.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Server returned error (${res.status})`);
    }
    return data;
  } catch (err) {
    // Fallback directly to 5001 if proxy failed
    try {
      const fallbackRes = await fetch('http://127.0.0.1:5001/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: messageText.trim() }),
      });
      const data = await fallbackRes.json();
      if (!fallbackRes.ok) {
        throw new Error(data.error || `Server error (${fallbackRes.status})`);
      }
      return data;
    } catch {
      // Re-throw original or enhanced message
      throw new Error(
        err.message?.includes('Failed to fetch')
          ? 'Unable to connect to the Flask ML backend. Ensure backend/app.py is running on port 5001.'
          : err.message
      );
    }
  }
}
