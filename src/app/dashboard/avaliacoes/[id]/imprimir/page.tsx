import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Typography,
} from '@mui/material';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PrintActions from './PrintActions';

function Linha({ label, value }: { label: string; value?: string | null }) {
  if (!value || value.trim() === '') return null;
  return (
    <Box mb={1.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default async function ImprimirAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      estudante: {
        select: { id: true, nome: true, matricula: true, email: true },
      },
      avaliador: { select: { nome: true, cargo: true } },
    },
  });

  if (!avaliacao) return notFound();

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
        <Typography variant="h5" fontWeight={600}>
          Avaliação — Impressão
        </Typography>
        <Chip
          label={avaliacao.status === 'FINAL' ? 'Finalizada' : 'Rascunho'}
          size="small"
          color={avaliacao.status === 'FINAL' ? 'success' : 'warning'}
          variant={avaliacao.status === 'FINAL' ? 'filled' : 'outlined'}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Apenas os campos preenchidos são exibidos nesta visualização.
      </Typography>
      <PrintActions />

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Estudante
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" gap={3} flexWrap="wrap" mb={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1">
                {avaliacao.estudante?.nome}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Matrícula
              </Typography>
              <Typography variant="body1">
                {avaliacao.estudante?.matricula}
              </Typography>
            </Box>
            {avaliacao.estudante?.email && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {avaliacao.estudante?.email}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Dados da Avaliação
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box>
            <Linha
              label="Status"
              value={avaliacao.status === 'FINAL' ? 'Finalizada' : 'Rascunho'}
            />
            <Linha
              label="Data"
              value={new Date(avaliacao.data).toLocaleDateString('pt-BR')}
            />
            <Linha label="Descrição" value={avaliacao.descricao} />
            <Linha label="Evolução" value={avaliacao.evolucao ?? ''} />
            <Linha label="Dificuldades" value={avaliacao.dificuldades ?? ''} />
            {avaliacao.periodoReavaliacao ? (
              <Linha
                label="Período para Reavaliação (dias)"
                value={String(avaliacao.periodoReavaliacao)}
              />
            ) : null}
            {avaliacao.avaliador && (
              <Linha
                label="Avaliador"
                value={`${avaliacao.avaliador.nome}${
                  avaliacao.avaliador.cargo
                    ? ` — ${avaliacao.avaliador.cargo}`
                    : ''
                }`}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Box mt={2} data-print-hidden>
        <Typography variant="caption" color="text.secondary">
          Dica: use Cmd+P para imprimir ou salvar em PDF.
        </Typography>
      </Box>
    </Container>
  );
}
