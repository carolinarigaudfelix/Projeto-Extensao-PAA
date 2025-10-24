'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Largura do Drawer expandido e colapsado
const SIDEBAR_WIDTH = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopToggle = () => {
    setDesktopCollapsed(!desktopCollapsed);
  };

  const currentWidth = desktopCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      {/* Sidebar: drawer temporário em mobile, permanente retrátil em desktop */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        desktopCollapsed={desktopCollapsed}
        onDesktopToggle={handleDesktopToggle}
        width={SIDEBAR_WIDTH}
        widthCollapsed={SIDEBAR_WIDTH_COLLAPSED}
      />

      {/* Conteúdo principal */}
      <Box
        component="div"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, md: `${currentWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${currentWidth}px)` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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
