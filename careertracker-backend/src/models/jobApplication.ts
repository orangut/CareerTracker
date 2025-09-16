// src/models/jobApplication.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// Extracted constants for ENUM types to improve reusability and readability
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

// Define the attributes that can be created (excluding id, as it's auto-generated)
interface JobApplicationCreationAttributes extends Optional<JobApplicationAttributes, 'id'> {}

// Define the interface for the JobApplication model attributes
export interface JobApplicationAttributes {
    id: string;
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
    isEdit: boolean; // Added isEdit
    notes?: string[];
    stages?: string[];
}

// Create the JobApplication model class
class JobApplication extends Model<JobApplicationAttributes, JobApplicationCreationAttributes> implements JobApplicationAttributes {
    public id!: string;
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
}

// Initialize the model with column definitions
JobApplication.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
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
        type: DataTypes.JSON, // Stores an array of strings as a JSON array
        allowNull: true,
    },
    stages: {
        type: DataTypes.JSON, // Stores an array of strings as a JSON array
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: true, // Adds createdAt and updatedAt columns
});

export default JobApplication;