'use client';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { CPFInput } from '@/components/CPFInput';
import { useRoleGuard } from '@/lib/route-guard';
import { limparCPF, validarCPF } from '@/lib/validators';

const tiposValidos = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] as const;

const baseSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha muito curta'),
  cpf: z.string().min(11, 'CPF incompleto'),
  tipo: z.enum(tiposValidos),
});

type FormValues = z.infer<typeof baseSchema> & { draft: boolean };

export default function NovoUsuarioWizardPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(['ADMIN']);
  const router = useRouter();

  const [form, setForm] = useState<FormValues>({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipo: 'PROFESSOR',
    draft: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftMessage, setDraftMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(0);

  // Carregar rascunho
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wizardUsuarioDraft');
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function salvarRascunho() {
    try {
      localStorage.setItem(
        'wizardUsuarioDraft',
        JSON.stringify({
          ...form,
          draft: true,
          savedAt: new Date().toISOString(),
        }),
      );
      setForm((prev) => ({ ...prev, draft: true }));
      setDraftMessage('Rascunho salvo.');
      setTimeout(() => setDraftMessage(''), 4000);
    } catch {
      setError('Falha ao salvar rascunho local.');
    }
  }

  const totalSteps = 4;
  const progressPercent = useMemo(
    () => Math.round(((step + 1 - 1) / (totalSteps - 1)) * 100),
    [step],
  );

  function nextStep() {
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  }
  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit(e: React.FormEvent, draft = false) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    setSaving(true);

    if (draft) {
      salvarRascunho();
      setSaving(false);
      return;
    }

    const parsed = baseSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errs[i.path[0].toString()] = i.message;
      });
      setFieldErrors(errs);
      setSaving(false);
      return;
    }

    // Validar CPF sanitizado
    const cpfL = limparCPF(parsed.data.cpf);
    if (!validarCPF(cpfL)) {
      setFieldErrors((f) => ({ ...f, cpf: 'CPF inválido' }));
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, cpf: cpfL }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Falha ao criar usuário');
        setSaving(false);
        return;
      }
      localStorage.removeItem('wizardUsuarioDraft');
      setSuccessMessage('Usuário criado com sucesso. Redirecionando...');
      setTimeout(() => {
        router.push('/dashboard/usuarios');
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setSaving(false);
    }
  }

  if (isLoading)
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

  const stepComponents = [
    // 1. Identificação
    <Box key="step1" display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Nome"
        name="nome"
        value={form.nome}
        onChange={handleChange}
        fullWidth
        required
        error={Boolean(fieldErrors.nome)}
        helperText={fieldErrors.nome}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
      />
      <CPFInput
        name="cpf"
        label="CPF"
        value={form.cpf}
        onChange={handleChange}
        fullWidth
        required
        helperText={fieldErrors.cpf || 'Digite o CPF (000.000.000-00)'}
        error={Boolean(fieldErrors.cpf)}
      />
    </Box>,
    // 2. Credenciais
    <Box key="step2" display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Senha"
        name="senha"
        type="password"
        value={form.senha}
        onChange={handleChange}
        fullWidth
        required
        error={Boolean(fieldErrors.senha)}
        helperText={fieldErrors.senha || 'Mínimo 6 caracteres'}
      />
    </Box>,
    // 3. Perfil
    <Box key="step3" display="flex" flexDirection="column" gap={2}>
      <TextField
        name="tipo"
        label="Tipo de Usuário"
        value={form.tipo}
        onChange={handleChange}
        select
        fullWidth
        required
        error={Boolean(fieldErrors.tipo)}
        helperText={fieldErrors.tipo}
      >
        {tiposValidos.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
    </Box>,
    // 4. Revisão
    <Box key="step4" display="flex" flexDirection="column" gap={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Revisão dos Dados
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Nome:</strong> {form.nome || '(não informado)'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Email:</strong> {form.email || '(não informado)'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>CPF:</strong> {form.cpf || '(não informado)'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Tipo:</strong> {form.tipo}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (A senha não é exibida por segurança.)
        </Typography>
      </Paper>
    </Box>,
  ];

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 3 } }}>
      <Card elevation={3} sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Novo Usuário - Wizard
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Progresso do formulário
            </Typography>
          </Box>
          <CheckCircleOutlinedIcon sx={{ opacity: 0.35 }} />
        </Box>
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Box flex={1}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                color="primary"
              />
            </Box>
            <Typography variant="caption" fontWeight={600} minWidth={60}>
              {progressPercent}%
            </Typography>
          </Box>
        </Box>
        {(error || draftMessage || successMessage) && (
          <Box px={2.5}>
            {error && (
              <Paper
                variant="outlined"
                sx={{ p: 1.4, mb: 2, borderColor: 'error.light' }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Erro
                </Typography>
                <Typography variant="body2" color="error.main">
                  {error}
                </Typography>
              </Paper>
            )}
            {draftMessage && (
              <Paper
                variant="outlined"
                sx={{ p: 1.2, mb: 2, borderColor: 'primary.light' }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Rascunho
                </Typography>
                <Typography variant="body2">{draftMessage}</Typography>
              </Paper>
            )}
            {successMessage && (
              <Paper
                variant="outlined"
                sx={{ p: 1.2, mb: 2, borderColor: 'success.light' }}
              >
                <Typography
                  variant="subtitle2"
                  color="success.main"
                  gutterBottom
                >
                  Sucesso
                </Typography>
                <Typography variant="body2" color="success.main">
                  {successMessage}
                </Typography>
              </Paper>
            )}
          </Box>
        )}
        <CardContent sx={{ pt: 0, px: 2.5, pb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
            {
              ['1. Identificação', '2. Credenciais', '3. Perfil', '4. Revisão'][
                step
              ]
            }
          </Typography>
          <Box component="form" onSubmit={(e) => handleSubmit(e)}>
            {stepComponents[step]}
            <Box
              mt={3}
              display="flex"
              flexWrap="wrap"
              gap={2}
              justifyContent="space-between"
            >
              <Box display="flex" gap={1}>
                {step > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIosNewIcon fontSize="inherit" />}
                    onClick={prevStep}
                  >
                    Anterior
                  </Button>
                )}
                {step < totalSteps - 1 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIosIcon fontSize="inherit" />}
                    onClick={nextStep}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
              {step === totalSteps - 1 && (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SaveOutlinedIcon />
                      )
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e, true);
                    }}
                  >
                    Salvar Rascunho
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <CheckCircleOutlinedIcon />
                      )
                    }
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Finalizar'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
