"use client";

import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface DashboardStats {
  alunos: {
    total: number;
    ativos: number;
    comNecessidadesEspeciais: number;
    cadastradosRecentemente: number;
  };
  usuarios: {
    total: number;
    porTipo: Record<string, number>;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const carregarEstatisticas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setStats(null);

    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        throw new Error(`Erro ao carregar estatísticas: ${res.statusText}`);
      }
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
        {/* Card: Total de Alunos */}
        <Card>
          <CardHeader
            avatar={<PeopleAltOutlinedIcon color="primary" />}
            title="Total de Alunos"
            action={
              <Tooltip title="Atualizar">
                <IconButton onClick={carregarEstatisticas}>
                  <RefreshOutlinedIcon />
                </IconButton>
              </Tooltip>
            }
          />
          <Divider />
          <CardContent>
            {loading ? (
              <Skeleton variant="text" width={120} height={48} />
            ) : (
              <Typography variant="h3" component="div">
                {stats?.alunos.total ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card: Alunos Ativos */}
        <Card>
          <CardHeader
            avatar={<SchoolIcon color="success" />}
            title="Alunos Ativos"
          />
          <Divider />
          <CardContent>
            {loading ? (
              <Skeleton variant="text" width={120} height={48} />
            ) : (
              <>
                <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                  {stats?.alunos.ativos ?? 0}
                </Typography>
                {stats && stats.alunos.total > 0 && (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.alunos.ativos / stats.alunos.total) * 100}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {(
                        (stats.alunos.ativos / stats.alunos.total) *
                        100
                      ).toFixed(1)}
                      % do total
                    </Typography>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Card: Necessidades Especiais */}
        <Card>
          <CardHeader
            avatar={<AccessibilityNewIcon color="info" />}
            title="Necessidades Especiais"
          />
          <Divider />
          <CardContent>
            {loading ? (
              <Skeleton variant="text" width={120} height={48} />
            ) : (
              <Typography variant="h3" component="div">
                {stats?.alunos.comNecessidadesEspeciais ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card: Cadastros Recentes */}
        <Card>
          <CardHeader
            avatar={<TrendingUpIcon color="warning" />}
            title="Cadastros Recentes"
            subheader="Últimos 30 dias"
          />
          <Divider />
          <CardContent>
            {loading ? (
              <Skeleton variant="text" width={120} height={48} />
            ) : (
              <Typography variant="h3" component="div">
                {stats?.alunos.cadastradosRecentemente ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Seção: Usuários do Sistema */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <AdminPanelSettingsIcon color="primary" fontSize="large" />
          <Typography variant="h5">Usuários do Sistema</Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Skeleton variant="rectangular" width={150} height={32} />
            <Skeleton variant="rectangular" width={150} height={32} />
            <Skeleton variant="rectangular" width={150} height={32} />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total de Usuários
              </Typography>
              <Typography variant="h4">{stats?.usuarios.total ?? 0}</Typography>
            </Box>
            {stats?.usuarios.porTipo &&
              Object.entries(stats.usuarios.porTipo).map(
                ([tipo, quantidade]) => (
                  <Box key={tipo}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {tipo}
                    </Typography>
                    <Chip
                      label={quantidade}
                      color="primary"
                      variant="outlined"
                      size="medium"
                      sx={{ fontSize: "1.2rem", height: 40 }}
                    />
                  </Box>
                )
              )}
          </Box>
        )}
      </Paper>

      {/* Seção: Ações Rápidas */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <PersonAddIcon color="primary" fontSize="large" />
          <Typography variant="h5">Ações Rápidas</Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          <Button
            component={Link}
            href="/dashboard/alunos/novo"
            variant="contained"
            startIcon={<PersonAddIcon />}
            fullWidth
          >
            Cadastrar Novo Aluno
          </Button>
          <Button
            component={Link}
            href="/dashboard/alunos"
            variant="outlined"
            startIcon={<SchoolIcon />}
            fullWidth
          >
            Ver Todos os Alunos
          </Button>
          <Button
            component={Link}
            href="/dashboard/usuarios"
            variant="outlined"
            startIcon={<AdminPanelSettingsIcon />}
            fullWidth
          >
            Gerenciar Sistema
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
