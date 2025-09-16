// src/models/user.ts

import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize'; // Assume you have a sequelize connection config file

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

export default User;