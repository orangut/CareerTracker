// src/models/user.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// Define the interface for the User model attributes
export interface UserAttributes {
    id: number;
    username: string;
    password?: string; // Password is optional for some operations (like login)
}

// Define the attributes that can be created (excluding id)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Create the User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public password!: string;
}

// Initialize the model with column definitions
User.init({
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
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
});

export default User;