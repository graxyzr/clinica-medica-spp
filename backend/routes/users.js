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
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// PUT /api/users/me - Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;
        const updates = {};
        const params = [];

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Email inválido.' });
        }

        // Build dynamic update query
        let query = 'UPDATE users SET ';
        const fields = [];

        if (name) {
            fields.push('name = ?');
            params.push(name.trim());
        }

        if (email) {
            fields.push('email = ?');
            params.push(email.toLowerCase());
        }

        if (phone !== undefined) {
            fields.push('phone = ?');
            params.push(phone);
        }

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
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
                    message: 'Senha atual incorreta.'
                });
            }

            // Hash new password
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            fields.push('password_hash = ?');
            params.push(newPasswordHash);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                message: 'Nenhum campo válido para atualização fornecido.'
            });
        }

        query += fields.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        params.push(req.user.id);

        // Execute update
        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Get updated user
        const [updatedUsers] = await db.execute(
            'SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            message: 'Perfil atualizado com sucesso!',
            user: updatedUsers[0]
        });

    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Já existe um usuário com este email.'
            });
        }

        res.status(500).json({
            message: 'Erro interno do servidor ao atualizar perfil.'
        });
    }
});

// DELETE /api/users/me - Delete current user account
router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: 'Senha é obrigatória para excluir a conta.'
            });
        }

        // Verify password
        const [users] = await db.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        const isPasswordValid = await bcrypt.compare(password, users[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Senha incorreta. Não foi possível excluir a conta.'
            });
        }

        // Delete user (cascade will handle appointments)
        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ?',
            [req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.json({
            message: 'Conta excluída com sucesso.'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Erro interno do servidor ao excluir conta.'
        });
    }
});

module.exports = router;