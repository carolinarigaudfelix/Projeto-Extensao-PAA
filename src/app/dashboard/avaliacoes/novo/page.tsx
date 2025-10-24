"use client";

import type { Estudante } from "@/types/estudante";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovaAvaliacaoPage() {
  const [form, setForm] = useState({
    estudanteId: "",
    avaliadorId: "",
    data: new Date().toISOString().slice(0, 10),
    descricao: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [avaliadores, setAvaliadores] = useState<
    { id: string; nome: string }[]
  >([]);
  const router = useRouter();

  // Carregar estudantes e avaliadores ao montar
  useState(() => {
    fetch("/api/alunos?includeInactive=true")
      .then((r) => r.json())
      .then(setEstudantes);
    fetch("/api/usuarios?tipo=PEDAGOGO")
      .then((r) => r.json())
      .then(setAvaliadores);
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Falha ao criar avaliação");
      setSuccess("Avaliação criada com sucesso!");
      setTimeout(() => router.push("/dashboard/avaliacoes"), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box p={2} maxWidth={500} mx="auto">
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Nova Avaliação
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Estudante"
          name="estudanteId"
          value={form.estudanteId}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {estudantes.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.nome}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Avaliador"
          name="avaliadorId"
          value={form.avaliadorId}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {avaliadores.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.nome}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Data"
          name="data"
          type="date"
          value={form.data}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Descrição"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          multiline
          minRows={3}
        />
        {error && (
          <Card variant="outlined" sx={{ mb: 2, borderColor: "error.light" }}>
            <CardContent>
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}
        {success && (
          <Card variant="outlined" sx={{ mb: 2, borderColor: "success.light" }}>
            <CardContent>
              <Typography variant="body2" color="success.main">
                {success}
              </Typography>
            </CardContent>
          </Card>
        )}
        <Box mt={2} display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? <CircularProgress size={18} /> : "Salvar"}
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
      </form>
    </Box>
  );
}
