import app from './app';

const PORT = Number(process.env.PORT) || 3001;

// Start server
// Bound to loopback: the Cloudflare Tunnel connects from this machine, so the
// API never needs to be reachable on the LAN.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
