const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validateUserRegistration } = require('../middleware/validation');
const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: 'Já existe um usuário cadastrado com este email.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
            [name.trim(), email.toLowerCase(), passwordHash, phone]
        );

        // Get created user (without password)
        const [users] = await db.execute(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        const user = users[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Já existe um usuário com este email.'
            });
        }

        res.status(500).json({
            message: 'Erro interno do servidor ao criar usuário.'
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email e senha são obrigatórios.'
            });
        }

        // Find user by email
        const [users] = await db.execute(
            'SELECT id, name, email, password_hash, phone FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Credenciais inválidas. Verifique seu email e senha.'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Credenciais inválidas. Verifique seu email e senha.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao fazer login.'
        });
    }
});

// GET /api/auth/me - Get current user info (protected)
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        const [users] = await db.execute(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
});

module.exports = router;