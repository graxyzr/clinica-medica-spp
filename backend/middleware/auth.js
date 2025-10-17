const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Acesso negado. Token de autenticação não fornecido.'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Formato de token inválido. Use: Bearer <token>'
            });
        }

        const token = authHeader.replace('Bearer ', '').trim();

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token não pode estar vazio.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const [users] = await db.execute(
            'SELECT id, name, email, phone FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido. Usuário não encontrado.'
            });
        }

        // Add user to request object
        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expirado.'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro na autenticação.'
        });
    }
};

module.exports = authMiddleware;