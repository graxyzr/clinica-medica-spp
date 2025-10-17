const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Professional = sequelize.define('Professional', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        specialty: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        reviewCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'professionals'
    });

    Professional.associate = function (models) {
        Professional.hasMany(models.Appointment, {
            foreignKey: 'professionalId',
            as: 'appointments'
        });
    };

    return Professional;
};