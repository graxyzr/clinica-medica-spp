const db = require('../models');

exports.getAllProfessionals = async (req, res) => {
    try {
        const { specialty } = req.query;
        let whereClause = {};

        if (specialty) {
            whereClause = {
                specialty: {
                    [db.Sequelize.Op.like]: `%${specialty}%`
                }
            };
        }

        const professionals = await db.Professional.findAll({
            where: whereClause,
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

exports.getSpecialties = async (req, res) => {
    try {
        const specialties = await db.Professional.findAll({
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('specialty')), 'specialty']
            ],
            order: [['specialty', 'ASC']]
        });

        const specialtyList = specialties.map(item => item.specialty);

        res.json(specialtyList);
    } catch (error) {
        console.error('Erro ao buscar especialidades:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};