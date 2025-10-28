export const StatesOptions = [
    'applied',
    'phone_screen',
    'technical_interview',
    'final_interview',
    'offer',
    'rejected',
    'withdrawn'
];

export type StageType = typeof StatesOptions[number];


export type Stage = {
    _id?: string;
    jobApplicationId: string;
    type: StageType;
    startedAt: Date | string;
    completedAt?: Date | string;
    notes?: string[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type StageKeys = keyof Stage;

export function getStageFieldType<K extends StageKeys>(key: K): string {
    return {
        "_id": "string",
        "jobApplicationId": "string",
        "type": "StageType",
        "startedAt": "Date",
        "completedAt": "Date",
        "createdAt": "Date",
        "updatedAt": "Date",
        "notes": "string[]"
    }[key];
}