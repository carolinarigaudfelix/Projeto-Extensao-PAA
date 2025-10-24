import prisma from '../src/lib/prisma';

async function main() {
  console.log('🔄 Ativando todos os usuários...\n');

  const result = await prisma.usuario.updateMany({
    where: { isActive: false },
    data: { isActive: true },
  });

  console.log(`✅ ${result.count} usuário(s) ativado(s) com sucesso!\n`);

  // Verificar resultado
  const usuarios = await prisma.usuario.findMany({
    select: {
      nome: true,
      email: true,
      tipo: true,
      isActive: true,
    },
  });

  console.log('📋 Status atual dos usuários:\n');
  for (const user of usuarios) {
    console.log(
      `  ${user.isActive ? '✅' : '❌'} ${user.nome} (${user.email}) - ${
        user.tipo
      }`,
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erro ao ativar usuários:', error);
  process.exit(1);
});
