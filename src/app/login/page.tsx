"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
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
} from "@mui/material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", senha: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        senha: form.senha,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao fazer login");
      setLoading(false);
    }
  }

  const disabled = loading || !form.email || !form.senha;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: (theme) => theme.palette.grey[100],
        display: "flex",
        alignItems: "center",
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <Card elevation={3}>
            <CardHeader
              sx={{ pb: 1 }}
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <LockOutlinedIcon color="primary" />
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    Sistema PAA
                  </Typography>
                </Box>
              }
              subheader={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  Programa de Apoio Acadêmico
                </Typography>
              }
            />
            <Divider />
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
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
                    size="medium"
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
                    size="medium"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={disabled}
                    fullWidth
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <InfoOutlinedIcon
              color="info"
              sx={{ mt: 0.5, fontSize: { xs: 20, sm: 24 } }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Primeiro acesso?
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                paragraph
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, mb: 1 }}
              >
                Se ainda não existe nenhum usuário no sistema, você precisa
                criar o primeiro usuário administrador através do Prisma Studio.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Execute:{" "}
                <Box
                  component="code"
                  sx={{
                    bgcolor: "info.light",
                    px: { xs: 0.75, sm: 1 },
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: { xs: 10, sm: 12 },
                    fontFamily: "monospace",
                    display: "inline-block",
                  }}
                >
                  make prisma-studio
                </Box>
              </Typography>
            </Box>
          </Paper>

          <Box textAlign="center" mt={2}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: { xs: "0.625rem", sm: "0.75rem" } }}
            >
              © {new Date().getFullYear()} Planejamento de Acessibilidade na
              Avaliação
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
