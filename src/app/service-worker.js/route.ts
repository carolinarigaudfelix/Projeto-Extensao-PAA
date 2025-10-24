import { NextResponse } from "next/server";

// Retorna um service worker vazio para evitar erro 404
export async function GET() {
  const serviceWorkerCode = `
// Service Worker gerado automaticamente
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
  `.trim();

  return new NextResponse(serviceWorkerCode, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
