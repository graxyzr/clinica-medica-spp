/**
 * Calculate available time slots for a professional
 * @param {string} startWorkTime - Professional's start work time (HH:MM:SS)
 * @param {string} endWorkTime - Professional's end work time (HH:MM:SS)
 * @param {number} slotDuration - Duration of the slot in minutes
 * @param {Array} existingAppointments - Array of existing appointments
 * @returns {Array} Array of available time slots
 */
function calculateAvailableSlots(startWorkTime, endWorkTime, slotDuration, existingAppointments) {
    const slots = [];
    const slotDurationMs = slotDuration * 60 * 1000;

    // Parse work times
    const start = new Date(`1970-01-01T${startWorkTime}`);
    const end = new Date(`1970-01-01T${endWorkTime}`);

    let currentTime = new Date(start);

    // Generate slots in 30-minute intervals
    while (currentTime < end) {
        const slotEnd = new Date(currentTime.getTime() + slotDurationMs);

        // Check if slot fits within work hours
        if (slotEnd <= end) {
            const slotStartStr = currentTime.toTimeString().slice(0, 5);
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            // Check for conflicts with existing appointments
            const hasConflict = existingAppointments.some(appointment => {
                const apptStart = new Date(`1970-01-01T${appointment.start_time}`);
                const apptEnd = new Date(`1970-01-01T${appointment.end_time}`);

                // Check for time overlap
                return (currentTime < apptEnd && slotEnd > apptStart);
            });

            if (!hasConflict) {
                slots.push({
                    start_time: slotStartStr,
                    end_time: slotEndStr
                });
            }
        }

        // Move to next potential slot (30-minute intervals)
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
}

module.exports = {
    calculateAvailableSlots
};