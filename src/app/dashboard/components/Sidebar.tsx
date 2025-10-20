'use client';

import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
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
  useTheme,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

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

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const theme = useTheme();

  if (!session?.user) return null;

  const initials = session.user.nome?.trim()
    ? session.user.nome
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '?';

  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: 240,
          bgcolor: theme.palette.grey[900],
          color: theme.palette.grey[100],
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          PAA Dashboard
        </Typography>
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
                  <ListItemButton
                    component={NextLink}
                    href={item.href}
                    selected={active}
                    sx={{
                      py: 1,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.grey[800],
                        '&:hover': { bgcolor: theme.palette.grey[700] },
                      },
                      '&:hover': { bgcolor: theme.palette.grey[800] },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </Box>
      <Divider sx={{ borderColor: theme.palette.grey[800] }} />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.success.dark,
            width: 40,
            height: 40,
            fontSize: 16,
          }}
        >
          {initials}
        </Avatar>
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
      </Box>
    </Drawer>
  );
}
