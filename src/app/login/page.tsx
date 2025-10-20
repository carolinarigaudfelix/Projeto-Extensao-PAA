'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', senha: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro ao fazer login');
      setLoading(false);
    }
  }

  const disabled = loading || !form.email || !form.senha;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: (theme) => theme.palette.grey[100],
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Card elevation={3}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <LockOutlinedIcon color="primary" />
                  <Typography variant="h5" fontWeight={600}>
                    Sistema PAA
                  </Typography>
                </Box>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Programa de Apoio Acadêmico
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={2}>
                  {error && (
                    <Alert severity="error" variant="outlined">
                      <AlertTitle>Falha no login</AlertTitle>
                      {error}
                    </Alert>
                  )}
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Senha"
                    name="senha"
                    type="password"
                    autoComplete="current-password"
                    value={form.senha}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    size="large"
                    disabled={disabled}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2 }}>
            <InfoOutlinedIcon color="info" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Primeiro acesso?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Se ainda não existe nenhum usuário no sistema, você precisa
                criar o primeiro usuário administrador através do Prisma Studio.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Execute:{' '}
                <Box
                  component="code"
                  sx={{
                    bgcolor: 'info.light',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  make prisma-studio
                </Box>
              </Typography>
            </Box>
          </Paper>

          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.disabled">
              © {new Date().getFullYear()} Programa de Apoio Acadêmico
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
