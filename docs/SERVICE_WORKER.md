# 🔧 Service Worker - Documentação

## Problema

Erro `GET /service-worker.js 404` no console do navegador.

## Causa

Alguns navegadores (especialmente Chrome/Edge) tentam automaticamente buscar um arquivo `service-worker.js` na raiz do site, mesmo que o aplicativo não tenha configurado um Service Worker. Isso é um comportamento padrão do navegador ao detectar que o site pode ser uma PWA (Progressive Web App).

## Solução Implementada

Foram criadas **duas soluções** para resolver o erro 404:

### 1. Service Worker estático em `/public`

**Arquivo:** `public/service-worker.js`

Um arquivo JavaScript vazio que apenas silencia o erro. O navegador encontra o arquivo e não exibe mais o erro 404.

```javascript
// Service Worker vazio
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
```

### 2. Rota API dinâmica

**Arquivo:** `src/app/service-worker.js/route.ts`

Uma rota Next.js que retorna dinamicamente um service worker vazio quando requisitado.

```typescript
export async function GET() {
  const serviceWorkerCode = `...`;
  return new NextResponse(serviceWorkerCode, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
```

## Por que não usar um Service Worker completo?

Este projeto **não necessita** de um Service Worker porque:

- ✅ Não é uma PWA (Progressive Web App)
- ✅ Não precisa funcionar offline
- ✅ Não faz cache agressivo de recursos
- ✅ Não tem funcionalidades de push notifications
- ✅ É uma aplicação administrativa interna

## Se quiser remover completamente

Se preferir **não ter** service worker algum:

1. Delete `public/service-worker.js`
2. Delete `src/app/service-worker.js/route.ts`
3. O erro 404 voltará a aparecer, mas é **inofensivo**

## Se quiser implementar PWA no futuro

Para transformar em PWA completa:

1. Instale `next-pwa`:
   ```bash
   npm install next-pwa
   ```

2. Configure no `next.config.ts`:
   ```typescript
   const withPWA = require('next-pwa')({
     dest: 'public',
     disable: process.env.NODE_ENV === 'development',
   });

   module.exports = withPWA({
     // sua configuração
   });
   ```

3. Adicione `manifest.json` em `/public`

4. Configure ícones e splash screens

## Resultado

- ✅ Erro 404 resolvido
- ✅ Console limpo
- ✅ Sem impacto na performance
- ✅ Pronto para PWA futura se necessário

## Referências

- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
