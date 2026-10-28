const API = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

// Saari API calls yahin se jaayengi (token automatically lag jaata hai)
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function logout() {
  localStorage.clear();
  location.href = 'login.html';
}