// RulesTable.tsx - Table component for displaying notification rules

import React from 'react';
import {
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { Edit, Trash2 } from 'lucide-react';
import type { RuleFrontend } from "../../models/NotificationRule.ts";
import { getTriggerText } from "../../models/NotificationRule.ts";

interface RulesTableProps {
    rules: RuleFrontend[];
    onEdit: (rule: RuleFrontend) => void;
    onDelete: (id: string) => void;
}

/**
 * Table component for displaying notification rules
 */
const RulesTable: React.FC<RulesTableProps> = ({ rules, onEdit, onDelete }) => {
    const theme = useTheme();

    return (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
            <Table>
                <TableHead sx={{ bgcolor: theme.palette.primary.light + '10' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
                            Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
                            Trigger Condition
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
                            Status
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rules.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Typography variant="subtitle1" color="text.secondary" py={4}>
                                    No rules defined. Click "New Rule" to get started.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rules.map((rule: RuleFrontend) => (
                            <TableRow key={rule._id} hover>
                                <TableCell>
                                    <Typography variant="h6">{rule.name}</Typography>
                                    <Tooltip title="Message Template">
                                        <Typography variant="caption" color="text.secondary">
                                            "{rule.messageTemplate}"
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="primary">
                                        {getTriggerText(rule.offsetHalfHours, rule.stageField, rule.stageType)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={rule.isEnabled ? "Enabled" : "Disabled"}
                                        color={rule.isEnabled ? "success" : "error"}
                                        variant="outlined"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Rule">
                                        <IconButton onClick={() => onEdit(rule)} color="primary">
                                            <Edit size={18} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Rule">
                                        <IconButton onClick={() => onDelete(rule._id)} color="error">
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RulesTable;