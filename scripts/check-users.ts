import prisma from '../src/lib/prisma';

async function main() {
  console.log('🔍 Verificando usuários no banco de dados...\n');

  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      isActive: true,
      senhaHash: true,
    },
  });

  if (usuarios.length === 0) {
    console.log('❌ Nenhum usuário encontrado no banco de dados!');
    console.log(
      '\n💡 Execute "make prisma-studio" para criar o primeiro usuário.',
    );
    console.log(
      '   Ou crie um usuário via script com senha criptografada usando bcrypt.\n',
    );
  } else {
    console.log(`✅ Encontrados ${usuarios.length} usuário(s):\n`);
    for (const user of usuarios) {
      console.log(`  📧 Email: ${user.email}`);
      console.log(`  👤 Nome: ${user.nome}`);
      console.log(`  🏷️  Tipo: ${user.tipo}`);
      console.log(
        `  ${user.isActive ? '✅' : '❌'} Status: ${
          user.isActive ? 'Ativo' : 'Inativo'
        }`,
      );
      console.log(
        `  ${user.senhaHash ? '🔒' : '⚠️ '} Senha: ${
          user.senhaHash ? 'Configurada' : 'NÃO CONFIGURADA'
        }`,
      );
      console.log('');
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Erro ao verificar usuários:', error);
  process.exit(1);
});
