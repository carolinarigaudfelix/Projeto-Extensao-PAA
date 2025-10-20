'use client';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

interface Estudante {
  id: string;
  nome: string;
}

export default function DashboardPage() {
  const [loadingAlunos, setLoadingAlunos] = useState(true);
  const [erroAlunos, setErroAlunos] = useState('');
  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);

  const carregarAlunos = useCallback(async () => {
    setLoadingAlunos(true);
    setErroAlunos('');
    try {
      const res = await fetch('/api/alunos');
      if (!res.ok) {
        throw new Error('Falha ao carregar alunos');
      }
      const data: Estudante[] = await res.json();
      setTotalAlunos(data.length);
    } catch {
      setErroAlunos('Erro ao buscar total de alunos');
    } finally {
      setLoadingAlunos(false);
    }
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Typography
        variant="h5"
        fontWeight={600}
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        Visão Geral
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={{ xs: 2, sm: 3 }}
      >
        <Card elevation={2}>
          <CardHeader
            avatar={<PeopleAltOutlinedIcon color="primary" />}
            title={
              <Typography variant="subtitle2" color="text.secondary">
                Total de Alunos
              </Typography>
            }
            action={
              <Tooltip title="Atualizar">
                <span>
                  <IconButton
                    onClick={carregarAlunos}
                      disabled={loadingAlunos}
                      size="small"
                    >
                      <RefreshOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              {loadingAlunos ? (
                <Skeleton variant="text" width={80} height={32} />
              ) : erroAlunos ? (
                <Typography variant="body2" color="error">
                  {erroAlunos}
                </Typography>
              ) : (
                <Typography variant="h4" fontWeight={700}>
                  {totalAlunos}
                </Typography>
              )}
              <Box mt={1}>
                <Button
                  href="/dashboard/alunos"
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  Ver todos
                </Button>
              </Box>
            </CardContent>
          </Card>
        {/* Outros cards podem ser adicionados aqui */}
      </Box>
    </Container>
  );
}
