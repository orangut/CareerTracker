// src/models/jobApplication.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './user'; // Import the User model

const allStages = [
    'applied',
    'phone_screen',
    'technical_interview',
    'final_interview',
    'offer',
    'rejected',
    'withdrawn',
] as const;

const allRemoteOptions = ['remote', 'hybrid', 'onsite'] as const;

export interface JobApplicationAttributes {
    id: number;
    company: string;
    position: string;
    location: string;
    applicationDate: Date;
    interestLevel: number;
    currentStage: typeof allStages[number];
    salaryMin?: number;
    salaryMax?: number;
    remoteOption: typeof allRemoteOptions[number];
    jobUrl: string;
    isEdit: boolean;
    notes?: string[];
    stages?: string[];
    userId: number;
}

interface JobApplicationCreationAttributes extends Optional<JobApplicationAttributes, 'id'> {}

class JobApplication extends Model<JobApplicationAttributes, JobApplicationCreationAttributes> implements JobApplicationAttributes {
    public id!: number;
    public company!: string;
    public position!: string;
    public location!: string;
    public applicationDate!: Date;
    public interestLevel!: number;
    public currentStage!: typeof allStages[number];
    public salaryMin?: number;
    public salaryMax?: number;
    public remoteOption!: typeof allRemoteOptions[number];
    public jobUrl!: string;
    public isEdit!: boolean;
    public notes?: string[];
    public stages?: string[];
    public userId!: number;
}

JobApplication.init({
    id: {
        type: DataTypes.INTEGER, // Corrected to INTEGER
        autoIncrement: true,
        primaryKey: true,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    interestLevel: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currentStage: {
        type: DataTypes.ENUM(...allStages),
        allowNull: false,
    },
    salaryMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    salaryMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    remoteOption: {
        type: DataTypes.ENUM(...allRemoteOptions),
        allowNull: false,
    },
    jobUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    },
    isEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    notes: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    stages: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: true,
});

// Define the association
JobApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default JobApplication;