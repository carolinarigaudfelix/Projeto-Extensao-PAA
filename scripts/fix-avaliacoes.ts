import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Buscando todas as avaliações...');

  const avaliacoes = await prisma.avaliacao.findMany({
    select: {
      id: true,
      avaliadorId: true,
    },
  });

  console.log(`Encontradas ${avaliacoes.length} avaliações.`);

  // Buscar todos os membros pedagógicos
  const membros = await prisma.membroPedagogico.findMany({
    select: { id: true },
  });
  const membrosIds = new Set(membros.map((m) => m.id));

  console.log(`Membros pedagógicos no banco: ${membros.length}`);

  // Encontrar avaliações órfãs (sem avaliador válido)
  const avaliacoesOrfas = avaliacoes.filter(
    (a) => !(a.avaliadorId && membrosIds.has(a.avaliadorId)),
  );

  console.log(`Avaliações órfãs encontradas: ${avaliacoesOrfas.length}`);

  if (avaliacoesOrfas.length > 0) {
    console.log(
      'IDs das avaliações órfãs:',
      avaliacoesOrfas.map((a) => a.id),
    );
    console.log('Deletando avaliações órfãs...');
    const result = await prisma.avaliacao.deleteMany({
      where: {
        id: { in: avaliacoesOrfas.map((a) => a.id) },
      },
    });
    console.log(`${result.count} avaliações deletadas.`);
  }

  console.log('Processo concluído!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
