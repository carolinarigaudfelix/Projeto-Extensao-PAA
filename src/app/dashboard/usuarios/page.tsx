"use client";

import { useRoleGuard } from "@/lib/route-guard";
import { mascararCPF } from "@/lib/validators";
import type { Usuario as UsuarioType } from "@/types/usuario";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Usuario = UsuarioType & { criado: string };

export default function UsuariosDashboardPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(["ADMIN"]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/usuarios");
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários");
      }
      const data = await response.json();
      setUsuarios(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar usuários"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (hasRole) fetchUsuarios();
  }, [hasRole, fetchUsuarios]);

  const handleAskDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/usuarios/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao excluir usuário");
      }
      setConfirmOpen(false);
      setDeletingId(null);
      await fetchUsuarios();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir usuário");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!deleting) setConfirmOpen(false);
  };

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
              <TableCell>Criado em</TableCell>
              <TableCell>Criado por</TableCell>
              <TableCell>Atualizado em</TableCell>
              <TableCell>Atualizado por</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              ["a", "b", "c"].map((id) => (
                <TableRow key={`skeleton-${id}`}>
                  <TableCell colSpan={10}>
                    <Skeleton height={32} />
                  </TableCell>
                </TableRow>
              ))
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
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
                  <TableCell>{usuario.nome || "Sem nome"}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.tipo}
                      size="small"
                      color={usuario.tipo === "ADMIN" ? "primary" : "success"}
                      variant={usuario.tipo === "ADMIN" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>
                    {usuario.cpf ? mascararCPF(usuario.cpf) : "-"}
                  </TableCell>
                  <TableCell>
                    {usuario.criado
                      ? new Date(usuario.criado).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {usuario.criadoPorNome || usuario.criadoPor || "-"}
                  </TableCell>
                  <TableCell>
                    {usuario.atualizado
                      ? new Date(usuario.atualizado).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {usuario.atualizadoPorNome || usuario.atualizadoPor || "-"}
                  </TableCell>
                  <TableCell>
                    {usuario.isActive ? "Ativo" : "Inativo"}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      href={`/dashboard/usuarios/${usuario.id}/editar`}
                      size="small"
                    >
                      Editar
                    </Button>
                    <IconButton
                      aria-label="Excluir"
                      color="error"
                      onClick={() => handleAskDelete(usuario.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja desativar este usuário? Você pode reativá-lo
            editando o cadastro.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
