'use client';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const initials = session?.user?.nome?.trim()
    ? session.user.nome
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '?';

  return (
    <AppBar
      position="sticky"
      elevation={trigger ? 4 : 0}
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        transition: 'box-shadow 0.2s',
      })}
    >
      <Toolbar
        sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {onToggleSidebar && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onToggleSidebar}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={600} noWrap>
            PAA Dashboard
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {session?.user && (
            <>
              <Tooltip title={session.user.nome || 'Usuário sem nome'}>
                <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: 16,
                    }}
                  >
                    {initials}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { minWidth: 220 } }}
              >
                <Box px={2} py={1.5}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {session.user.nome || 'Usuário'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {session.user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    signOut({ callbackUrl: '/login' });
                  }}
                  sx={{ gap: 1 }}
                >
                  <LogoutOutlinedIcon fontSize="small" />
                  <Typography variant="body2">Sair</Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
