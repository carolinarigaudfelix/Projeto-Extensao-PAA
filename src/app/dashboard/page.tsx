'use client';

import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const carregarEstatisticas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    setStats(null);

    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error(`Erro ao carregar estatísticas: ${res.statusText}`);
      }
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const primaryColor = theme.palette.primary.main;
  const primaryLight = theme.palette.primary.light;
  const primaryDark = theme.palette.primary.dark;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, sm: 4 },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: primaryColor,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
          }}
        >
          Dashboard
        </Typography>
        <Tooltip title="Atualizar estatísticas">
          <IconButton
            onClick={carregarEstatisticas}
            sx={{
              bgcolor: primaryColor,
              color: 'white',
              '&:hover': {
                bgcolor: primaryDark,
              },
            }}
          >
            <RefreshOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, sm: 4 },
        }}
      >
        {/* Card: Total de Alunos */}
        <Card
          elevation={2}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  bgcolor: `${primaryColor}15`,
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PeopleAltOutlinedIcon sx={{ color: primaryColor }} />
              </Box>
            }
            title={
              <Typography variant="subtitle2" color="text.secondary">
                Total de Alunos
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ pt: 1 }}>
            {loading ? (
              <Skeleton variant="text" width={120} height={56} />
            ) : (
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: primaryColor,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {stats?.alunos.total ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card: Alunos Ativos */}
        <Card
          elevation={2}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  bgcolor: `${primaryLight}20`,
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: primaryLight }} />
              </Box>
            }
            title={
              <Typography variant="subtitle2" color="text.secondary">
                Alunos Ativos
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ pt: 1 }}>
            {loading ? (
              <Skeleton variant="text" width={120} height={56} />
            ) : (
              <>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: primaryLight,
                    mb: 2,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  {stats?.alunos.ativos ?? 0}
                </Typography>
                {stats && stats.alunos.total > 0 && (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.alunos.ativos / stats.alunos.total) * 100}
                      sx={{
                        mb: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${primaryLight}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: primaryLight,
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
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
        <Card
          elevation={2}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  bgcolor: '#3B82F620',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccessibilityNewIcon sx={{ color: '#3B82F6' }} />
              </Box>
            }
            title={
              <Typography variant="subtitle2" color="text.secondary">
                Necessidades Especiais
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ pt: 1 }}>
            {loading ? (
              <Skeleton variant="text" width={120} height={56} />
            ) : (
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: '#3B82F6',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {stats?.alunos.comNecessidadesEspeciais ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Card: Cadastros Recentes */}
        <Card
          elevation={2}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardHeader
            avatar={
              <Box
                sx={{
                  bgcolor: '#F59E0B20',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ color: '#F59E0B' }} />
              </Box>
            }
            title={
              <Typography variant="subtitle2" color="text.secondary">
                Cadastros Recentes
              </Typography>
            }
            subheader={
              <Typography variant="caption" color="text.secondary">
                Últimos 30 dias
              </Typography>
            }
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ pt: 1 }}>
            {loading ? (
              <Skeleton variant="text" width={120} height={56} />
            ) : (
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: '#F59E0B',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {stats?.alunos.cadastradosRecentemente ?? 0}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Seção: Usuários do Sistema */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `2px solid ${primaryColor}`,
          }}
        >
          <Box
            sx={{
              bgcolor: `${primaryColor}15`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AdminPanelSettingsIcon
              sx={{ color: primaryColor, fontSize: 32 }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: primaryColor,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Usuários do Sistema
          </Typography>
        </Box>
        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(auto-fit, minmax(180px, 1fr))',
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            <Box
              sx={{
                p: 3,
                bgcolor: `${primaryColor}10`,
                borderRadius: 2,
                border: `2px solid ${primaryColor}`,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Total de Usuários
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: primaryColor,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                {stats?.usuarios.total ?? 0}
              </Typography>
            </Box>
            {stats?.usuarios.porTipo &&
              Object.entries(stats.usuarios.porTipo).map(
                ([tipo, quantidade]) => (
                  <Box
                    key={tipo}
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #e5e7eb',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: primaryColor,
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      {tipo}
                    </Typography>
                    <Chip
                      label={quantidade}
                      sx={{
                        fontSize: '1.25rem',
                        height: 44,
                        fontWeight: 700,
                        bgcolor: `${primaryColor}15`,
                        color: primaryColor,
                        border: `2px solid ${primaryColor}`,
                        '& .MuiChip-label': {
                          px: 3,
                        },
                      }}
                    />
                  </Box>
                ),
              )}
          </Box>
        )}
      </Paper>

      {/* Seção: Ações Rápidas */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `2px solid ${primaryColor}`,
          }}
        >
          <Box
            sx={{
              bgcolor: `${primaryColor}15`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonAddIcon sx={{ color: primaryColor, fontSize: 32 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: primaryColor,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Ações Rápidas
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Button
            component={Link}
            href="/dashboard/alunos/novo"
            variant="contained"
            startIcon={<PersonAddIcon />}
            fullWidth
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              bgcolor: primaryColor,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                bgcolor: primaryDark,
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.2s',
            }}
          >
            Cadastrar Novo Aluno
          </Button>
          <Button
            component={Link}
            href="/dashboard/alunos"
            variant="outlined"
            startIcon={<SchoolIcon />}
            fullWidth
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              borderWidth: 2,
              borderColor: primaryColor,
              color: primaryColor,
              textTransform: 'none',
              '&:hover': {
                borderWidth: 2,
                borderColor: primaryDark,
                bgcolor: `${primaryColor}10`,
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
              transition: 'all 0.2s',
            }}
          >
            Ver Todos os Alunos
          </Button>
          <Button
            component={Link}
            href="/dashboard/usuarios"
            variant="outlined"
            startIcon={<AdminPanelSettingsIcon />}
            fullWidth
            sx={{
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              borderWidth: 2,
              borderColor: primaryColor,
              color: primaryColor,
              textTransform: 'none',
              '&:hover': {
                borderWidth: 2,
                borderColor: primaryDark,
                bgcolor: `${primaryColor}10`,
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
              transition: 'all 0.2s',
            }}
          >
            Gerenciar Sistema
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
