"use client";

import { useRoleGuard } from "@/lib/route-guard";
import type { Estudante } from "@/types/estudante";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  idade: z.coerce.number().int().min(1, "Idade inválida"),
  matricula: z.string().min(3, "Matrícula muito curta"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  yearSchooling: z.coerce.number().int().min(1, "Ano escolar inválido"),
  turma: z.string().optional().or(z.literal("")),
  curso: z.string().optional().or(z.literal("")),
  isSpecialNeeds: z.boolean().default(false),
  specialNeedsDetails: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function EditarAlunoPage() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    hasRole,
  } = useRoleGuard(["ADMIN", "COORDENADOR", "PROFESSOR", "PEDAGOGO"]);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormValues>({
    nome: "",
    idade: 0,
    matricula: "",
    email: "",
    telefone: "",
    yearSchooling: 0,
    turma: "",
    curso: "",
    isSpecialNeeds: false,
    specialNeedsDetails: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasRole) return;

    async function loadAluno() {
      try {
        const res = await fetch(`/api/alunos/${id}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.message || "Falha ao carregar aluno");
          setLoading(false);
          return;
        }
        const data: Estudante = await res.json();
        setForm({
          nome: data.nome,
          idade: data.idade,
          matricula: data.matricula,
          email: data.email || "",
          telefone: data.telefone || "",
          yearSchooling: data.yearSchooling,
          turma: data.turma || "",
          curso: data.curso || "",
          isSpecialNeeds: data.isSpecialNeeds,
          specialNeedsDetails: data.specialNeedsDetails || "",
        });
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro inesperado");
        setLoading(false);
      }
    }

    loadAluno();
  }, [id, hasRole]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSaving(true);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[i.path[0].toString()] = i.message;
      });
      setFieldErrors(errs);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/alunos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.message || "Falha ao atualizar aluno");
        setSaving(false);
        return;
      }
      router.push(`/dashboard/alunos/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setSaving(false);
    }
  }

  if (authLoading)
    return (
      <Typography variant="body2" color="text.secondary">
        Carregando...
      </Typography>
    );
  if (!isAuthenticated)
    return (
      <Typography color="error">Você precisa estar autenticado.</Typography>
    );
  if (!hasRole) return <Typography color="error">Acesso restrito.</Typography>;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Box display="flex" flexDirection="column" gap={2}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Editar Aluno
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Atualize as informações do aluno
      </Typography>
      {error && (
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
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              fullWidth
              error={Boolean(fieldErrors.nome)}
              helperText={fieldErrors.nome}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Idade"
              name="idade"
              type="number"
              value={form.idade}
              onChange={handleChange}
              required
              fullWidth
              error={Boolean(fieldErrors.idade)}
              helperText={fieldErrors.idade}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Matrícula"
              name="matricula"
              value={form.matricula}
              onChange={handleChange}
              required
              fullWidth
              error={Boolean(fieldErrors.matricula)}
              helperText={fieldErrors.matricula}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              fullWidth
              error={Boolean(fieldErrors.telefone)}
              helperText={fieldErrors.telefone}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Ano Escolar"
              name="yearSchooling"
              type="number"
              value={form.yearSchooling}
              onChange={handleChange}
              required
              fullWidth
              error={Boolean(fieldErrors.yearSchooling)}
              helperText={fieldErrors.yearSchooling}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Turma"
              name="turma"
              value={form.turma}
              onChange={handleChange}
              fullWidth
              error={Boolean(fieldErrors.turma)}
              helperText={fieldErrors.turma}
            />
          </Box>
          <Box flex="1 1 300px" maxWidth={500}>
            <TextField
              label="Curso"
              name="curso"
              value={form.curso}
              onChange={handleChange}
              fullWidth
              error={Boolean(fieldErrors.curso)}
              helperText={fieldErrors.curso}
            />
          </Box>
          <Box flex="1 1 100%">
            <FormControlLabel
              control={
                <Checkbox
                  name="isSpecialNeeds"
                  checked={form.isSpecialNeeds}
                  onChange={handleChange}
                />
              }
              label="Possui necessidades especiais"
            />
          </Box>
          <Box flex="1 1 100%">
            <TextField
              label="Detalhes"
              name="specialNeedsDetails"
              value={form.specialNeedsDetails}
              onChange={handleChange}
              multiline
              minRows={3}
              fullWidth
              disabled={!form.isSpecialNeeds}
            />
          </Box>
        </Box>
        <Box display="flex" gap={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : undefined}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
