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
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Já existe um usuário cadastrado com este email.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
            [name.trim(), email.toLowerCase(), passwordHash, phone || null]
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
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Usuário criado com sucesso!',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    created_at: user.created_at
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Já existe um usuário com este email.'
            });
        }

        res.status(500).json({
            status: 'error',
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
                status: 'error',
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
                status: 'error',
                message: 'Credenciais inválidas. Verifique seu email e senha.'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciais inválidas. Verifique seu email e senha.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            status: 'success',
            message: 'Login realizado com sucesso!',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor ao fazer login.'
        });
    }
});

module.exports = router;