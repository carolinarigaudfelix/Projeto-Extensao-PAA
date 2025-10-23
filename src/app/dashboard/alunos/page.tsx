"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Estudante {
  id: string;
  nome: string;
  idade: number;
  matricula: string;
  email?: string;
  telefone?: string;
  yearSchooling: number;
  turma?: string;
  curso?: string;
  isSpecialNeeds: boolean;
  specialNeedsDetails?: string | null;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const carregarAlunos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/alunos");
      if (!res.ok) throw new Error("Falha ao carregar alunos");
      const data: Estudante[] = await res.json();
      setAlunos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  const handleAskDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/alunos/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Falha ao excluir aluno");
      }
      setConfirmOpen(false);
      setDeletingId(null);
      await carregarAlunos();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir aluno");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!deleting) setConfirmOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Alunos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os estudantes cadastrados
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            component={NextLink}
            href="/dashboard/alunos/novo"
            variant="contained"
            color="primary"
          >
            Novo aluno
          </Button>
          <Tooltip title="Atualizar">
            <span>
              <IconButton
                onClick={carregarAlunos}
                disabled={loading}
                color="primary"
              >
                <RefreshOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Card variant="outlined" sx={{ mt: 3, borderColor: "error.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erro
            </Typography>
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Matrícula</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Curso</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Turma</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box display="flex" gap={2} alignItems="center" py={1}>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={70} />
                    <Skeleton variant="text" width={60} />
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {!loading && alunos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" py={1}>
                    Nenhum aluno encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              alunos.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{a.nome}</TableCell>
                  <TableCell>{a.matricula}</TableCell>
                  <TableCell>{a.curso || "-"}</TableCell>
                  <TableCell>{a.turma || "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={NextLink}
                      href={`/dashboard/alunos/${a.id}`}
                      size="small"
                      variant="text"
                    >
                      Detalhes
                    </Button>
                    <IconButton
                      aria-label="Editar"
                      color="primary"
                      component={NextLink}
                      href={`/dashboard/alunos/${a.id}/editar`}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Excluir"
                      color="error"
                      onClick={() => handleAskDelete(a.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
            Tem certeza que deseja desativar este aluno? Você pode reativá-lo
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
    </Container>
  );
}
