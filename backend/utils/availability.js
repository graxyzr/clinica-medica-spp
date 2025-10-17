function calculateAvailableSlots(startWorkTime, endWorkTime, slotDuration, existingAppointments) {
    const slots = [];
    const slotDurationMs = slotDuration * 60 * 1000;

    const start = new Date(`1970-01-01T${startWorkTime}`);
    const end = new Date(`1970-01-01T${endWorkTime}`);

    let currentTime = new Date(start);

    while (currentTime < end) {
        const slotEnd = new Date(currentTime.getTime() + slotDurationMs);

        if (slotEnd <= end) {
            const slotStartStr = currentTime.toTimeString().slice(0, 5);
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            // Check if slot conflicts with existing appointments
            const hasConflict = existingAppointments.some(appointment => {
                const apptStart = new Date(`1970-01-01T${appointment.start_time}`);
                const apptEnd = new Date(`1970-01-01T${appointment.end_time}`);

                return (currentTime < apptEnd && slotEnd > apptStart);
            });

            if (!hasConflict) {
                slots.push({
                    start_time: slotStartStr,
                    end_time: slotEndStr
                });
            }
        }

        // Move to next slot (30-minute intervals)
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
}

module.exports = { calculateAvailableSlots };