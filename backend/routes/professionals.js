const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professionalController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, professionalController.getAllProfessionals);
router.get('/specialties', authenticateToken, professionalController.getSpecialties);
router.get('/:id', authenticateToken, professionalController.getProfessionalById);

module.exports = router;