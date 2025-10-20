'use client';

import { useRoleGuard } from '@/lib/route-guard';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  cpf?: string;
  criado: string;
};

export default function UsuariosDashboardPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(['ADMIN']);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/usuarios');
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }
      const data = await response.json();
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar usuários',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (hasRole) fetchUsuarios();
  }, [hasRole, fetchUsuarios]);

  if (isLoading)
    return (
      <Typography variant="body2" color="text.secondary">
        Carregando...
      </Typography>
    );
  if (!isAuthenticated)
    return <Alert severity="error">Você precisa estar autenticado.</Alert>;
  if (!hasRole)
    return <Alert severity="error">Acesso restrito a administradores.</Alert>;

  return (
    <Box>
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os usuários do sistema
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            component={Link}
            href="/dashboard/usuarios/novo"
            variant="contained"
            color="primary"
          >
            Novo usuário
          </Button>
          <IconButton
            aria-label="Recarregar"
            onClick={fetchUsuarios}
            disabled={refreshing}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              ['a', 'b', 'c'].map((id) => (
                <TableRow key={`skeleton-${id}`}>
                  <TableCell colSpan={5}>
                    <Skeleton height={32} />
                  </TableCell>
                </TableRow>
              ))
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Nenhum usuário encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id} hover>
                  <TableCell>{usuario.nome || 'Sem nome'}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.tipo}
                      size="small"
                      color={usuario.tipo === 'ADMIN' ? 'primary' : 'success'}
                      variant={usuario.tipo === 'ADMIN' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{usuario.cpf || '-'}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      href={`/dashboard/usuarios/${usuario.id}/editar`}
                      size="small"
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
