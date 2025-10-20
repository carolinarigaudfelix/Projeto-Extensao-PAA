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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Visão Geral
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="1 1 300px" maxWidth={360}>
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
        </Box>
        {/* Outros cards podem ser adicionados aqui */}
      </Box>
    </Container>
  );
}
