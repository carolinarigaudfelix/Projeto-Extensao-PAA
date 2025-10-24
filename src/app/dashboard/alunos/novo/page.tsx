'use client';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useRoleGuard } from '@/lib/route-guard';

// Mantém validação original para envio ao backend
const baseSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  idade: z.coerce.number().int().min(1, 'Idade inválida'),
  matricula: z.string().min(3, 'Matrícula muito curta'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  yearSchooling: z.coerce.number().int().min(1, 'Ano escolar inválido'),
  turma: z.string().optional().or(z.literal('')),
  curso: z.string().optional().or(z.literal('')),
  isSpecialNeeds: z.boolean().default(false),
  specialNeedsDetails: z.string().optional().or(z.literal('')),
});

// Campos adicionais do wizard (ficam apenas client-side por enquanto)
interface EquipeMembro {
  id: string;
  nome: string;
  funcao: string;
  contato: string;
}

interface WizardExtra {
  apoioEducacional: string[]; // sala de recurso, agente apoio, outros
  apoioOutros: string;
  equipePedagogica: EquipeMembro[];
  objetivosAvaliacao: string;
  conhecimentoEstudante: string;
  conhecimentoMultiplasFormas: string;
  conhecimentoDescricao: string;
  planificacaoDescricao: string;
  intervencaoPreliminar: string;
  intervencaoCompreensiva: string;
  intervencaoTransicional: string;
  observacoes: string;
  draft: boolean;
}

type FormValues = z.infer<typeof baseSchema> & WizardExtra;

export default function NovoAlunoPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard([
    'ADMIN',
    'COORDENADOR',
    'PROFESSOR',
    'PEDAGOGO',
  ]);
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({
    nome: '',
    idade: 0,
    matricula: '',
    email: '',
    telefone: '',
    yearSchooling: 0,
    turma: '',
    curso: '',
    isSpecialNeeds: false,
    specialNeedsDetails: '',
    apoioEducacional: [],
    apoioOutros: '',
    equipePedagogica: [],
    objetivosAvaliacao: '',
    conhecimentoEstudante: '',
    conhecimentoMultiplasFormas: '',
    conhecimentoDescricao: '',
    planificacaoDescricao: '',
    intervencaoPreliminar: '',
    intervencaoCompreensiva: '',
    intervencaoTransicional: '',
    observacoes: '',
    draft: false,
  });
  const [error, setError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  // Carregar rascunho se existir
  useEffect(() => {
    try {
      const raw = localStorage.getItem('wizardAlunoDraft');
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function toggleApoio(opcao: string) {
    setForm((prev) => ({
      ...prev,
      apoioEducacional: prev.apoioEducacional.includes(opcao)
        ? prev.apoioEducacional.filter((o) => o !== opcao)
        : [...prev.apoioEducacional, opcao],
    }));
  }

  function addMembroEquipe() {
    setForm((prev) => ({
      ...prev,
      equipePedagogica: [
        ...prev.equipePedagogica,
        { id: crypto.randomUUID(), nome: '', funcao: '', contato: '' },
      ],
    }));
  }

  function updateMembro(id: string, key: keyof EquipeMembro, value: string) {
    setForm((prev) => ({
      ...prev,
      equipePedagogica: prev.equipePedagogica.map((m) =>
        m.id === id ? { ...m, [key]: value } : m,
      ),
    }));
  }

  function deleteMembro(id: string) {
    setForm((prev) => ({
      ...prev,
      equipePedagogica: prev.equipePedagogica.filter((m) => m.id !== id),
    }));
  }

  const totalSteps = 7;
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

  function salvarRascunho() {
    try {
      localStorage.setItem(
        'wizardAlunoDraft',
        JSON.stringify({
          ...form,
          draft: true,
          savedAt: new Date().toISOString(),
        }),
      );
      setForm((prev) => ({ ...prev, draft: true }));
      setDraftMessage('Rascunho salvo localmente.');
      // Limpa mensagem após alguns segundos
      setTimeout(() => setDraftMessage(''), 4000);
    } catch {
      setError('Falha ao salvar rascunho no navegador. Verifique permissões.');
    }
  }

  async function handleSubmit(e: React.FormEvent, draft = false) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    setSaving(true);

    // Se for rascunho: salva imediatamente sem validar obrigatórios
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

    try {
      const payload = {
        ...parsed.data,
        apoioEducacional: form.apoioEducacional,
        apoioOutros: form.apoioOutros,
        equipePedagogica: form.equipePedagogica,
        objetivosAvaliacao: form.objetivosAvaliacao,
        conhecimentoEstudante: form.conhecimentoEstudante,
        conhecimentoMultiplasFormas: form.conhecimentoMultiplasFormas,
        conhecimentoDescricao: form.conhecimentoDescricao,
        planificacaoDescricao: form.planificacaoDescricao,
        intervencaoPreliminar: form.intervencaoPreliminar,
        intervencaoCompreensiva: form.intervencaoCompreensiva,
        intervencaoTransicional: form.intervencaoTransicional,
        observacoes: form.observacoes,
      };
      const res = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.message || 'Falha ao criar aluno');
        setSaving(false);
        return;
      }
      localStorage.removeItem('wizardAlunoDraft');
      setSuccessMessage('Aluno criado com sucesso. Redirecionando...');
      setTimeout(() => {
        router.push('/dashboard/alunos');
        router.refresh();
      }, 800);
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

  // Renderização de cada step
  const stepComponents = [
    // 1. Identificação
    <Box key="step1" display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexWrap="wrap" gap={2}>
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
        <TextField
          label="Ano de Escolaridade"
          name="yearSchooling"
          type="number"
          value={form.yearSchooling}
          onChange={handleChange}
          required
          fullWidth
          error={Boolean(fieldErrors.yearSchooling)}
          helperText={fieldErrors.yearSchooling}
        />
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
        <TextField
          label="Telefone"
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          fullWidth
          error={Boolean(fieldErrors.telefone)}
          helperText={fieldErrors.telefone}
        />
        <TextField
          label="Turma"
          name="turma"
          value={form.turma}
          onChange={handleChange}
          fullWidth
          error={Boolean(fieldErrors.turma)}
          helperText={fieldErrors.turma}
        />
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
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Atendimento Educacional Especializado?
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant={form.isSpecialNeeds ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setForm((p) => ({ ...p, isSpecialNeeds: true }))}
          >
            SIM
          </Button>
          <Button
            variant={!form.isSpecialNeeds ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setForm((p) => ({ ...p, isSpecialNeeds: false }))}
          >
            NÃO
          </Button>
        </Box>
      </Box>
      {form.isSpecialNeeds && (
        <TextField
          label="Detalhes do atendimento"
          name="specialNeedsDetails"
          value={form.specialNeedsDetails}
          onChange={handleChange}
          multiline
          minRows={3}
          fullWidth
        />
      )}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Apoio Educacional
        </Typography>
        <Box display="flex" flexDirection="column" gap={0.5}>
          {['Sala de recurso', 'Agente de apoio à inclusão', 'Outros'].map(
            (op) => (
              <FormControlLabel
                key={op}
                control={
                  <Checkbox
                    checked={form.apoioEducacional.includes(op)}
                    onChange={() => toggleApoio(op)}
                  />
                }
                label={op}
              />
            ),
          )}
        </Box>
        {form.apoioEducacional.includes('Outros') && (
          <TextField
            label="Se outros, quais?"
            name="apoioOutros"
            value={form.apoioOutros}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 1 }}
          />
        )}
      </Box>
    </Box>,
    // 2. Equipe Pedagógica & Objetivos
    <Box key="step2" display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          2. Equipe Pedagógica
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="Tabela equipe pedagógica">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.equipePedagogica.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell>
                    <TextField
                      value={m.nome}
                      onChange={(e) =>
                        updateMembro(m.id, 'nome', e.target.value)
                      }
                      size="small"
                      fullWidth
                      placeholder="Nome"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={m.funcao}
                      onChange={(e) =>
                        updateMembro(m.id, 'funcao', e.target.value)
                      }
                      size="small"
                      fullWidth
                      placeholder="Função"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={m.contato}
                      onChange={(e) =>
                        updateMembro(m.id, 'contato', e.target.value)
                      }
                      size="small"
                      fullWidth
                      placeholder="Contato"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="Remover"
                      size="small"
                      onClick={() => deleteMembro(m.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addMembroEquipe}
                  >
                    Adicionar membro
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          3. Objetivos para Avaliação
        </Typography>
        <TextField
          label="Descreva os objetivos para esta avaliação"
          name="objetivosAvaliacao"
          value={form.objetivosAvaliacao}
          onChange={handleChange}
          multiline
          minRows={4}
          fullWidth
        />
      </Box>
    </Box>,
    // 3. Conhecimento
    <Box key="step3" display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          4. Conhecimento - Estudante
        </Typography>
        <TextField
          label="Descreva o conhecimento do estudante"
          name="conhecimentoEstudante"
          value={form.conhecimentoEstudante}
          onChange={handleChange}
          multiline
          minRows={4}
          fullWidth
        />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          4.1 Múltiplas formas de representar (expressar) o conteúdo
        </Typography>
        <TextField
          label="Descreva as formas múltiplas"
          name="conhecimentoMultiplasFormas"
          value={form.conhecimentoMultiplasFormas}
          onChange={handleChange}
          multiline
          minRows={4}
          fullWidth
        />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          4.2 Conhecimento do estudante (detalhado)
        </Typography>
        <TextField
          label="Detalhe adicional sobre o conhecimento"
          name="conhecimentoDescricao"
          value={form.conhecimentoDescricao}
          onChange={handleChange}
          multiline
          minRows={4}
          fullWidth
        />
      </Box>
    </Box>,
    // 4. Planificação
    <Box key="step4" display="flex" flexDirection="column" gap={3}>
      <Paper
        variant="outlined"
        sx={{ p: 2, bgcolor: 'primary.light', opacity: 0.15 }}
      >
        <Typography variant="body2" fontWeight={500}>
          Nesta seção, descreva como as diferentes disciplinas podem colaborar
          para a avaliação do estudante.
        </Typography>
      </Paper>
      <TextField
        label="Descreva a planificação interdisciplinar"
        name="planificacaoDescricao"
        value={form.planificacaoDescricao}
        onChange={handleChange}
        multiline
        minRows={5}
        fullWidth
      />
    </Box>,
    // 5. Intervenção
    <Box key="step5" display="flex" flexDirection="column" gap={3}>
      <TextField
        label="6.1 - Intervenção Preliminar"
        name="intervencaoPreliminar"
        value={form.intervencaoPreliminar}
        onChange={handleChange}
        multiline
        minRows={3}
        fullWidth
      />
      <TextField
        label="6.2 - Intervenção Compreensiva"
        name="intervencaoCompreensiva"
        value={form.intervencaoCompreensiva}
        onChange={handleChange}
        multiline
        minRows={3}
        fullWidth
      />
      <TextField
        label="6.3 - Intervenção Transicional"
        name="intervencaoTransicional"
        value={form.intervencaoTransicional}
        onChange={handleChange}
        multiline
        minRows={3}
        fullWidth
      />
    </Box>,
    // 6. Observações finais
    <Box key="step6" display="flex" flexDirection="column" gap={3}>
      <TextField
        label="7. Observações"
        name="observacoes"
        value={form.observacoes}
        onChange={handleChange}
        multiline
        minRows={6}
        fullWidth
      />
    </Box>,
    // 7. Revisão
    <Box key="step7" display="flex" flexDirection="column" gap={3}>
      <Typography variant="h6" fontWeight={600}>
        Revisão (Resumo dos dados principais)
      </Typography>

      {/* Informações Pessoais */}
      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="primary"
            gutterBottom
          >
            📋 Informações Pessoais
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2">
              <strong>Nome:</strong> {form.nome || '(não informado)'}
            </Typography>
            <Typography variant="body2">
              <strong>Idade:</strong> {form.idade || '(não informado)'}
            </Typography>
            <Typography variant="body2">
              <strong>Matrícula:</strong> {form.matricula || '(não informado)'}
            </Typography>
            {form.email && (
              <Typography variant="body2">
                <strong>Email:</strong> {form.email}
              </Typography>
            )}
            {form.telefone && (
              <Typography variant="body2">
                <strong>Telefone:</strong> {form.telefone}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Informações Acadêmicas */}
      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="primary"
            gutterBottom
          >
            🎓 Informações Acadêmicas
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2">
              <strong>Ano Escolar:</strong>{' '}
              {form.yearSchooling || '(não informado)'}
            </Typography>
            {form.turma && (
              <Typography variant="body2">
                <strong>Turma:</strong> {form.turma}
              </Typography>
            )}
            {form.curso && (
              <Typography variant="body2">
                <strong>Curso:</strong> {form.curso}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Necessidades Específicas */}
      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="primary"
            gutterBottom
          >
            ♿ Necessidades Específicas
          </Typography>
          <Typography variant="body2">
            <strong>Possui necessidades específicas:</strong>{' '}
            {form.isSpecialNeeds ? 'Sim' : 'Não'}
          </Typography>
          {form.isSpecialNeeds && form.specialNeedsDetails && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                {form.specialNeedsDetails}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Apoio Educacional */}
      {form.apoioEducacional.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              🤝 Apoio Educacional
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {form.apoioEducacional.map((apoio) => (
                <Box
                  key={apoio}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {apoio}
                </Box>
              ))}
            </Box>
            {form.apoioOutros && (
              <Box mt={2}>
                <Typography variant="body2">
                  <strong>Outros apoios:</strong> {form.apoioOutros}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Equipe Pedagógica */}
      {form.equipePedagogica.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              👥 Equipe Pedagógica ({form.equipePedagogica.length} membro
              {form.equipePedagogica.length !== 1 ? 's' : ''})
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {form.equipePedagogica.map((membro, idx) => (
                <Box
                  key={membro.id}
                  sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}
                >
                  <Typography variant="body2">
                    <strong>{idx + 1}.</strong> {membro.nome || '(sem nome)'}
                  </Typography>
                  {membro.funcao && (
                    <Typography variant="body2" color="text.secondary">
                      Função: {membro.funcao}
                    </Typography>
                  )}
                  {membro.contato && (
                    <Typography variant="body2" color="text.secondary">
                      Contato: {membro.contato}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Planejamento de Avaliação */}
      {(form.objetivosAvaliacao ||
        form.conhecimentoEstudante ||
        form.conhecimentoMultiplasFormas ||
        form.conhecimentoDescricao) && (
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              📊 Planejamento de Avaliação
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {form.objetivosAvaliacao && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Objetivos da Avaliação:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.objetivosAvaliacao}
                  </Typography>
                </Box>
              )}
              {form.conhecimentoEstudante && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Conhecimento do Estudante:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.conhecimentoEstudante}
                  </Typography>
                </Box>
              )}
              {form.conhecimentoMultiplasFormas && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Múltiplas Formas de Representação:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.conhecimentoMultiplasFormas}
                  </Typography>
                </Box>
              )}
              {form.conhecimentoDescricao && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Descrição Adicional:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.conhecimentoDescricao}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Intervenções */}
      {(form.planificacaoDescricao ||
        form.intervencaoPreliminar ||
        form.intervencaoCompreensiva ||
        form.intervencaoTransicional) && (
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              🎯 Intervenções e Planificação
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {form.planificacaoDescricao && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Planificação Interdisciplinar:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.planificacaoDescricao}
                  </Typography>
                </Box>
              )}
              {form.intervencaoPreliminar && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Intervenção Preliminar:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.intervencaoPreliminar}
                  </Typography>
                </Box>
              )}
              {form.intervencaoCompreensiva && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Intervenção Compreensiva:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.intervencaoCompreensiva}
                  </Typography>
                </Box>
              )}
              {form.intervencaoTransicional && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Intervenção Transicional:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.intervencaoTransicional}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Observações Finais */}
      {form.observacoes && (
        <Card variant="outlined">
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
            >
              📝 Observações Finais
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {form.observacoes}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
        <Typography variant="body2" color="info.dark">
          ℹ️ Revise todas as informações acima antes de salvar. Você pode voltar
          aos passos anteriores para fazer alterações.
        </Typography>
      </Box>
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
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, letterSpacing: 0.5 }}
            >
              Planejamento de Acessibilidade na Avaliação - PAA
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Progresso do formulário
            </Typography>
          </Box>
          <CheckCircleOutlinedIcon sx={{ opacity: 0.4 }} />
        </Box>
        <Box sx={{ px: 2.5, pt: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Box flex={1}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                color="primary"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </Box>
            <Typography variant="caption" fontWeight={600} minWidth={60}>
              {progressPercent}% concluído
            </Typography>
          </Box>
        </Box>
        {(error || draftMessage || successMessage) && (
          <Box px={2.5}>
            {error && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, mb: 2, borderColor: 'error.light' }}
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
                <Typography variant="body2" color="text.primary">
                  {draftMessage}
                </Typography>
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
            {(() => {
              const labels = [
                '1. Identificação do Estudante',
                '2-3. Equipe e Objetivos',
                '4. Conhecimento',
                '5. Planificação',
                '6. Intervenção',
                '7. Observações',
                'Revisão',
              ];
              return labels[step];
            })()}
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
                    aria-label="Voltar"
                  >
                    Anterior
                  </Button>
                )}
                {step < totalSteps - 1 && (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIosIcon fontSize="inherit" />}
                    onClick={nextStep}
                    aria-label="Próximo"
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
