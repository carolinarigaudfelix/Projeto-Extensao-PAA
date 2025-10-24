"use client";

import type { AvaliacaoResumo, Estudante } from "@/types/estudante";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function AvaliacoesPage() {
  const [alunos, setAlunos] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAlunos() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/alunos?includeInactive=true");
        if (!res.ok) throw new Error("Falha ao buscar alunos");
        const data = await res.json();
        setAlunos(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchAlunos();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Situação dos Alunos
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Card variant="outlined" sx={{ mb: 2, borderColor: "error.light" }}>
          <CardContent>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erro
            </Typography>
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Matrícula</TableCell>
                <TableCell>Última Avaliação</TableCell>
                <TableCell>Evolução</TableCell>
                <TableCell>Dificuldades</TableCell>
                <TableCell>Próxima Reavaliação</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell>Criado por</TableCell>
                <TableCell>Atualizado em</TableCell>
                <TableCell>Atualizado por</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alunos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    Nenhum aluno encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                alunos.map((aluno) => {
                  const ultima:
                    | (AvaliacaoResumo & {
                        periodoReavaliacao?: number;
                        evolucao?: string;
                        dificuldades?: string;
                      })
                    | null =
                    aluno.avaliacoes && aluno.avaliacoes.length > 0
                      ? aluno.avaliacoes[0]
                      : null;
                  let proxima = "-";
                  if (ultima?.periodoReavaliacao && ultima?.data) {
                    const prox = new Date(ultima.data);
                    prox.setDate(
                      prox.getDate() + (ultima.periodoReavaliacao || 0)
                    );
                    proxima = prox.toLocaleDateString();
                  }
                  return (
                    <TableRow key={aluno.id}>
                      <TableCell>{aluno.nome}</TableCell>
                      <TableCell>{aluno.matricula}</TableCell>
                      <TableCell>
                        {ultima
                          ? new Date(ultima.data).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{ultima?.evolucao || "-"}</TableCell>
                      <TableCell>{ultima?.dificuldades || "-"}</TableCell>
                      <TableCell>{proxima}</TableCell>
                      <TableCell>
                        {aluno.criado
                          ? new Date(aluno.criado).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {aluno.criadoPorNome || aluno.criadoPor || "-"}
                      </TableCell>
                      <TableCell>
                        {aluno.atualizado
                          ? new Date(aluno.atualizado).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {aluno.atualizadoPorNome || aluno.atualizadoPor || "-"}
                      </TableCell>
                      <TableCell>
                        {aluno.isActive ? "Ativo" : "Inativo"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          href={`/dashboard/avaliacoes/novo?aluno=${aluno.id}`}
                        >
                          Nova Avaliação
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
