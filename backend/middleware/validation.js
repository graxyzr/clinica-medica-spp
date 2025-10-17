const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateUserRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.'
        });
    }

    if (!email || !validateEmail(email)) {
        return res.status(400).json({
            message: 'Email é obrigatório e deve ser válido.'
        });
    }

    if (!password || !validatePassword(password)) {
        return res.status(400).json({
            message: 'Senha é obrigatória e deve ter pelo menos 6 caracteres.'
        });
    }

    next();
};

const validateAppointment = (req, res, next) => {
    const { professional_id, service_id, date, start_time } = req.body;

    if (!professional_id) {
        return res.status(400).json({ message: 'Profissional é obrigatório.' });
    }

    if (!service_id) {
        return res.status(400).json({ message: 'Serviço é obrigatório.' });
    }

    if (!date) {
        return res.status(400).json({ message: 'Data é obrigatória.' });
    }

    if (!start_time) {
        return res.status(400).json({ message: 'Horário de início é obrigatório.' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).json({ message: 'Formato de data inválido. Use YYYY-MM-DD.' });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time)) {
        return res.status(400).json({ message: 'Formato de horário inválido. Use HH:MM.' });
    }

    next();
};

module.exports = {
    validateUserRegistration,
    validateAppointment,
    validateEmail,
    validatePassword
};