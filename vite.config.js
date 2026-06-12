import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    const isVirtual = /virtual|vbox|vmware|vEthernet|wsl|loopback/i.test(devName);
    
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        candidates.push({
          address: alias.address,
          isVirtual,
          name: devName
        });
      }
    }
  }
  
  // Sort candidates: prioritize non-virtual physical interfaces
  candidates.sort((a, b) => {
    if (a.isVirtual && !b.isVirtual) return 1;
    if (!a.isVirtual && b.isVirtual) return -1;
    return 0;
  });
  
  if (candidates.length > 0) {
    return candidates[0].address;
  }
  return 'localhost';
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __LOCAL_IP__: JSON.stringify(getLocalIP())
  },
  server: {
    host: true, // Listen on all local IP interfaces so mobile phones can connect
    proxy: {
      '/_functions': {
        target: 'https://www.haatza.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

