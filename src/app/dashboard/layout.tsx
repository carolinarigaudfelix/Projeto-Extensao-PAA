'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Largura do Drawer definida em Sidebar (240)
const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      {/* Sidebar: drawer temporário em mobile, permanente em desktop */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        width={SIDEBAR_WIDTH}
      />

      {/* Conteúdo principal */}
      <Box
        component="div"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <Header onToggleSidebar={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3 },
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
