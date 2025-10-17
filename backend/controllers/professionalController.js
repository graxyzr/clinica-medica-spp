const db = require('../models');

exports.getAllProfessionals = async (req, res) => {
    try {
        const professionals = await db.Professional.findAll({
            order: [['rating', 'DESC']]
        });

        res.json(professionals);
    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.getProfessionalById = async (req, res) => {
    try {
        const { id } = req.params;
        const professional = await db.Professional.findByPk(id);

        if (!professional) {
            return res.status(404).json({ error: 'Profissional não encontrado' });
        }

        res.json(professional);
    } catch (error) {
        console.error('Erro ao buscar profissional:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};