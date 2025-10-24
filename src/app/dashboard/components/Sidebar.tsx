'use client';

import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  roles: string[];
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'],
    icon: <DashboardOutlinedIcon fontSize="small" />,
  },
  {
    name: 'Alunos',
    href: '/dashboard/alunos',
    roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'],
    icon: <SchoolOutlinedIcon fontSize="small" />,
  },
  {
    name: 'Avaliações',
    href: '/dashboard/avaliacoes',
    roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'],
    icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  },
  {
    name: 'Usuários',
    href: '/dashboard/usuarios',
    roles: ['ADMIN'],
    icon: <GroupOutlinedIcon fontSize="small" />,
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  desktopCollapsed: boolean;
  onDesktopToggle: () => void;
  width: number;
  widthCollapsed: number;
}

export function Sidebar({
  mobileOpen,
  onClose,
  desktopCollapsed,
  onDesktopToggle,
  width,
  widthCollapsed,
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!session?.user) return null;

  const initials = session.user.nome?.trim()
    ? session.user.nome
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '?';

  const drawerContent = (isCollapsed: boolean) => (
    <>
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!isCollapsed && (
          <Typography variant="h6" fontWeight={600}>
            PAA Dashboard
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={onDesktopToggle}
            size="small"
            sx={{
              color: 'inherit',
              ml: isCollapsed ? 0 : 'auto',
            }}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>
      <Divider sx={{ borderColor: theme.palette.grey[800] }} />
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List dense disablePadding>
          {navigation
            .filter((item) => item.roles.includes(session.user.tipo))
            .map((item) => {
              const active = pathname === item.href;
              return (
                <ListItem key={item.href} disablePadding>
                  <Tooltip
                    title={isCollapsed ? item.name : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={NextLink}
                      href={item.href}
                      selected={active}
                      onClick={isMobile ? onClose : undefined}
                      sx={{
                        py: 1,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        '&.Mui-selected': {
                          bgcolor: `${theme.palette.primary.main}20`,
                          borderRight: `3px solid ${theme.palette.primary.main}`,
                          '&:hover': {
                            bgcolor: `${theme.palette.primary.main}30`,
                          },
                        },
                        '&:hover': { bgcolor: theme.palette.grey[800] },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: 'inherit',
                          minWidth: isCollapsed ? 'auto' : 36,
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!isCollapsed && (
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
        </List>
      </Box>
      <Divider sx={{ borderColor: theme.palette.grey[800] }} />
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexDirection: isCollapsed ? 'column' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 40,
            height: 40,
            fontSize: 16,
          }}
        >
          {initials}
        </Avatar>
        {!isCollapsed && (
          <>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {session.user.nome || 'Usuário sem nome'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap>
                {session.user.tipo}
              </Typography>
            </Box>
            <Tooltip title="Sair">
              <IconButton
                size="small"
                onClick={() => signOut()}
                sx={{ color: 'inherit' }}
              >
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isCollapsed && (
          <Tooltip title="Sair">
            <IconButton
              size="small"
              onClick={() => signOut()}
              sx={{ color: 'inherit' }}
            >
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </>
  );

  const currentWidth = desktopCollapsed ? widthCollapsed : width;

  return (
    <Box
      component="nav"
      sx={{ width: { md: currentWidth }, flexShrink: { md: 0 } }}
    >
      {/* Drawer temporário para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width,
            bgcolor: theme.palette.grey[900],
            color: theme.palette.grey[100],
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {drawerContent(false)}
      </Drawer>

      {/* Drawer permanente retrátil para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: currentWidth,
            bgcolor: theme.palette.grey[900],
            color: theme.palette.grey[100],
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent(desktopCollapsed)}
      </Drawer>
    </Box>
  );
}
