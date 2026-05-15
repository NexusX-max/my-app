// Apnar dewa 4-ti Render server link
const servers = [
  'https://my-app-v6xz.onrender.com',
  'https://my-app-2-uzoi.onrender.com',
  'https://my-app-3-kn3k.onrender.com',
  'https://my-app-4-btda.onrender.com'
];

// Load balancing logic
export const API_URL = servers[Math.floor(Math.random() * servers.length)];