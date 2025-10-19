const jwt = require('jsonwebtoken');
const db = require('../models');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const user = await db.User.create({
            name,
            email,
            password
        });

        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};