// RuleModal.tsx - Modal component for creating/editing notification rules

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { Zap } from 'lucide-react';
import { useUser } from "../../context/UserContext.tsx";
import type { NotificationRule, RuleModalProps } from "../../models/NotificationRule.ts";
import { StageOptions, StageFields } from "../../models/NotificationRule.ts";

/**
 * Form for creating or editing a notification rule.
 */
const RuleModal: React.FC<RuleModalProps> = ({ open, onClose, rule, onSave, loading }) => {
    const { user } = useUser();

    const [formData, setFormData] = useState<NotificationRule>({
        userId: user!.id,
        name: '',
        stageType: StageOptions[0],
        stageField: StageFields[0],
        offsetHalfHours: -48, // Default: 24 hours before
        messageTemplate: '',
        isEnabled: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (rule) {
            setFormData({
                _id: rule._id,
                userId: user!.id,
                name: rule.name,
                stageType: rule.stageType,
                stageField: rule.stageField,
                offsetHalfHours: rule.offsetHalfHours,
                messageTemplate: rule.messageTemplate,
                isEnabled: rule.isEnabled,
            });
        } else {
            // Reset for new rule
            setFormData({
                userId: user!.id,
                name: '',
                stageType: StageOptions[0],
                stageField: StageFields[0],
                offsetHalfHours: -48,
                messageTemplate: '',
                isEnabled: true,
            });
        }
        setErrors({});
    }, [rule, open, user]);

    // Handler for TextField inputs
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let typedValue: string | number = value;
        if (name === 'offsetHalfHours') {
            typedValue = parseFloat(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: typedValue,
        }));
    };

    // Handler for Select inputs
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handler for Switch inputs
    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked,
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Rule Name is required.";
        if (formData.offsetHalfHours === undefined || formData.offsetHalfHours === null || isNaN(parseFloat(String(formData.offsetHalfHours)))) {
            newErrors.offsetHalfHours = "Offset must be a valid number.";
        }
        if (!formData.messageTemplate.trim()) newErrors.messageTemplate = "Message Template is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(rule ? rule._id : null, formData);
        }
    };

    const formatStageType = (option: string) => {
        return option.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="span" fontWeight="bold">
                    {rule ? 'Edit Rule' : 'Create New Rule'}
                </Typography>
                <IconButton onClick={onClose} size="small" color="inherit">
                    <Zap />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                    <TextField
                        label="Rule Name"
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        required
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth required>
                            <InputLabel id="stage-type-label">Stage Type</InputLabel>
                            <Select
                                labelId="stage-type-label"
                                name="stageType"
                                value={formData.stageType}
                                label="Stage Type"
                                onChange={handleSelectChange}
                            >
                                {StageOptions.map((option: string) => (
                                    <MenuItem key={option} value={option}>
                                        {formatStageType(option)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel id="stage-field-label">Stage Field (Date)</InputLabel>
                            <Select
                                labelId="stage-field-label"
                                name="stageField"
                                value={formData.stageField}
                                label="Stage Field (Date)"
                                onChange={handleSelectChange}
                            >
                                {StageFields.map((field: string) => (
                                    <MenuItem key={field} value={field}>{field}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <TextField
                        label="Offset (in hours)"
                        name="offsetHalfHours"
                        type="number"
                        value={formData.offsetHalfHours}
                        onChange={handleTextChange}
                        required
                        fullWidth
                        helperText="e.g., -48 for 24 hours BEFORE; 2 for 1 hour AFTER"
                        slotProps={{
                            htmlInput: {
                                step: "0.5",
                                min: "-384",
                                max: "384"
                            }
                        }}
                        error={!!errors.offsetHalfHours}
                    />

                    <TextField
                        label="Notification Message Template"
                        name="messageTemplate"
                        value={formData.messageTemplate}
                        onChange={handleTextChange}
                        multiline
                        rows={3}
                        required
                        fullWidth
                        error={!!errors.messageTemplate}
                        helperText={errors.messageTemplate}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                name="isEnabled"
                                checked={formData.isEnabled}
                                onChange={handleSwitchChange}
                            />
                        }
                        label="Rule is Enabled"
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2 }}>
                        <Button onClick={onClose} variant="outlined" disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Rule'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default RuleModal;