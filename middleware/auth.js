const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticação que verifica o token JWT
 * e adiciona as informações do usuário no objeto request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // O token vem como "Bearer <token>", então precisamos pegar só o token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      // Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário no banco
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          membroPedagogico: {
            select: {
              id: true,
              cargo: true,
            },
          },
        },
      });

      if (!(usuario?.id)) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Adiciona as informações do usuário no objeto request
      req.user = usuario;
      next();
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se o usuário tem uma das roles permitidas
 * @param {string[]} rolesPermitidas Array com os tipos de usuário permitidos
 */
const verificarPermissao = (rolesPermitidas) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      if (!rolesPermitidas.includes(req.user.tipo)) {
        return res.status(403).json({
          message: 'Você não tem permissão para acessar este recurso',
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};

module.exports = {
  authMiddleware,
  verificarPermissao,
};
