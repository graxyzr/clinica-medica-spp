const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, appointmentController.createAppointment);
router.get('/my-appointments', authenticateToken, appointmentController.getUserAppointments);
router.get('/upcoming', authenticateToken, appointmentController.getUpcomingAppointments);
router.delete('/:id', authenticateToken, appointmentController.cancelAppointment);

module.exports = router;