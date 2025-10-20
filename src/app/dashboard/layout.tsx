'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Largura do Drawer permanente definida em Sidebar (240)
const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Caso futuramente queira tornar Sidebar responsiva (toggle)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      {/* Sidebar permanente */}
      {sidebarOpen && <Sidebar />}
      {/* Conteúdo com margem à esquerda para não ficar sob Drawer */}
      <Box
        component="div"
        sx={{
          flex: 1,
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          // Ajuste: como Drawer permanente já ocupa espaço, aplicar position absolute somente se quiser overlay
          // Aqui usamos margin-left para permitir conteúdo visível.
        }}
      >
        <Header onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
