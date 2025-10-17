const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { validateEmail } = require('../middleware/validation');
const router = express.Router();

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, phone, created_at, updated_at 
       FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado.'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: users[0]
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor.'
        });
    }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;
        const updates = [];
        const params = [];

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({
                status: 'error',
                message: 'Email inválido.'
            });
        }

        // Build dynamic update query
        if (name) {
            updates.push('name = ?');
            params.push(name.trim());
        }

        if (email) {
            updates.push('email = ?');
            params.push(email.toLowerCase());
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Senha atual é obrigatória para alterar a senha.'
                });
            }

            // Verify current password
            const [users] = await db.execute(
                'SELECT password_hash FROM users WHERE id = ?',
                [req.user.id]
            );

            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                users[0].password_hash
            );

            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Senha atual incorreta.'
                });
            }

            // Hash new password
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            updates.push('password_hash = ?');
            params.push(newPasswordHash);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Nenhum campo válido para atualização fornecido.'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(req.user.id);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado.'
            });
        }

        // Get updated user
        const [updatedUsers] = await db.execute(
            'SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            status: 'success',
            message: 'Perfil atualizado com sucesso!',
            data: {
                user: updatedUsers[0]
            }
        });

    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Já existe um usuário com este email.'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor ao atualizar perfil.'
        });
    }
});

module.exports = router;