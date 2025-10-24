// Service Worker vazio
// Este arquivo existe apenas para evitar erros 404 no console do navegador
// quando o navegador tenta buscar por um service worker automaticamente

self.addEventListener('install', () => {
  // Service worker instalado
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Service worker ativado
  self.clients.claim();
});

// Não fazemos cache ou interceptação de requisições neste projeto
