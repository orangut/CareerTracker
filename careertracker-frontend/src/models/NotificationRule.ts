// NotificationRule.ts - Type definitions for notification rules

// Base rule data structure (as stored in backend)
export interface RuleData {
    _id: string;
    userId: string;
    name: string;
    stageType: string;
    stageField: string;
    messageTemplate: string;
    isEnabled: boolean;
    offsetMs: number; // Time offset in milliseconds
    createdAt: Date;
    updatedAt: Date;
}

// Frontend Interface (converts ms to half-hours for display/editing)
export interface RuleFrontend extends Omit<RuleData, 'offsetMs' | 'createdAt' | 'updatedAt'> {
    offsetHalfHours: number; // Time offset in half-hours
    createdAt: Date;
    updatedAt: Date;
}

// Form data structure (used when creating/updating rules)
export interface RuleFormData {
    userId: string;
    name: string;
    stageType: string;
    stageField: string;
    messageTemplate: string;
    isEnabled: boolean;
    offsetHalfHours: number;
}

// NotificationRule interface (with optional _id for creation)
export interface NotificationRule extends RuleFormData {
    _id?: string;
}

// Props for the RuleModal Component
export interface RuleModalProps {
    open: boolean;
    onClose: () => void;
    rule: RuleFrontend | null;
    onSave: (id: string | null, data: NotificationRule) => Promise<void>;
    loading: boolean;
}

// Constants
export const MS_PER_HALF_HOUR = 1800000; // 30 * 60 * 1000

export const StageOptions: string[] = [
    'applied',
    'phone_screen',
    'technical_interview',
    'final_interview',
    'offer',
    'rejected',
    'withdrawn'
];

export const StageFields: string[] = [
    'completedAt',
    'scheduledDate',
    'submissionDate'
];

// Utility functions
export const msToHalfHours = (ms: number): number => {
    if (isNaN(ms)) return 0;
    return parseFloat((ms / MS_PER_HALF_HOUR).toFixed(1));
};

export const halfHoursToMs = (halfHours: number): number => {
    if (isNaN(halfHours)) return 0;
    return Math.round(halfHours * MS_PER_HALF_HOUR);
};

export const ruleToFrontend = (rule: RuleData): RuleFrontend => ({
    _id: rule._id,
    userId: rule.userId,
    name: rule.name,
    stageType: rule.stageType,
    stageField: rule.stageField,
    messageTemplate: rule.messageTemplate,
    isEnabled: rule.isEnabled,
    offsetHalfHours: msToHalfHours(rule.offsetMs),
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
});

export const getTriggerText = (offsetHalfHours: number, stageField: string, stageType: string): string => {
    const hours = Math.abs(offsetHalfHours / 2);
    const timeText = offsetHalfHours > 0
        ? `${hours} hours AFTER`
        : `${hours} hours BEFORE`;

    return `Trigger: ${timeText} the ${stageField} of stage ${stageType}.`;
};