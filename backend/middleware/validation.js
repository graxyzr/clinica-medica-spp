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
            status: 'error',
            message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.'
        });
    }

    if (!email || !validateEmail(email)) {
        return res.status(400).json({
            status: 'error',
            message: 'Email é obrigatório e deve ser válido.'
        });
    }

    if (!password || !validatePassword(password)) {
        return res.status(400).json({
            status: 'error',
            message: 'Senha é obrigatória e deve ter pelo menos 6 caracteres.'
        });
    }

    next();
};

const validateAppointment = (req, res, next) => {
    const { professional_id, service_id, date, start_time } = req.body;

    if (!professional_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Profissional é obrigatório.'
        });
    }

    if (!service_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Serviço é obrigatório.'
        });
    }

    if (!date) {
        return res.status(400).json({
            status: 'error',
            message: 'Data é obrigatória.'
        });
    }

    if (!start_time) {
        return res.status(400).json({
            status: 'error',
            message: 'Horário de início é obrigatório.'
        });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return res.status(400).json({
            status: 'error',
            message: 'Formato de data inválido. Use YYYY-MM-DD.'
        });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time)) {
        return res.status(400).json({
            status: 'error',
            message: 'Formato de horário inválido. Use HH:MM.'
        });
    }

    // Check if date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return res.status(400).json({
            status: 'error',
            message: 'Não é possível agendar para datas passadas.'
        });
    }

    next();
};

module.exports = {
    validateUserRegistration,
    validateAppointment,
    validateEmail,
    validatePassword
};