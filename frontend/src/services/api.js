const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // no body
  }
  if (!response.ok) {
    const message = (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data;
}

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
}

export async function listOpportunities(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/opportunities${query ? `?${query}` : ''}`);
  return handleResponse(response);
}

export async function getOpportunity(id) {
  const response = await fetch(`${API_BASE_URL}/opportunities/${id}`);
  return handleResponse(response);
}

export async function createOpportunity(data) {
  const response = await fetch(`${API_BASE_URL}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateOpportunity(id, data) {
  const response = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateOpportunityStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/opportunities/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function deleteOpportunity(id) {
  const response = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
