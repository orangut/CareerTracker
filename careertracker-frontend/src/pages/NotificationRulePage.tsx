// NotificationRulePage.tsx - Main page component for notification rules management

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Typography,
} from '@mui/material';
import { AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useUser } from "../context/UserContext.tsx";
import type { NotificationRule, RuleFrontend } from "../models/NotificationRule.ts";
import {
    createNotificationRule,
    deleteNotificationRule,
    getNotificationRules,
    updateNotificationRule
} from "../api/notificationRuleApi.ts";
import RuleModal from "../components/notificationRule/RuleModal.tsx";
import RulesTable from "../components/notificationRule/RulesTable.tsx";

/**
 * Main application component for managing notification rules.
 */
const NotificationRulePage: React.FC = () => {
    const { user } = useUser();

    const [rules, setRules] = useState<RuleFrontend[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingRule, setEditingRule] = useState<RuleFrontend | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchRules = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getNotificationRules();
            if (response.status === 200) {
                setRules(response.data);
            } else {
                throw new Error('Failed to fetch rules.');
            }
        } catch (err) {
            setError((err as Error).message || 'An error occurred while fetching rules.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    // --- CRUD Handlers ---

    const handleSave = async (data: NotificationRule) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            let response;

            if (!data._id) {
                // Create new rule
                response = await createNotificationRule(data);
                setSuccessMessage('Rule successfully created.');
            } else {
                // Update existing rule
                response = await updateNotificationRule(data);
                setSuccessMessage('Rule successfully updated.');
            }

            if (response.status >= 200 && response.status < 300) {
                setModalOpen(false);
                setEditingRule(null);
                await fetchRules(); // Refresh list after saving
            } else {
                throw new Error('Failed to save rule.');
            }
        } catch (err) {
            setError((err as Error).message || 'An error occurred while saving the rule.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this notification rule?")) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await deleteNotificationRule(id);

            if (response.status === 200 || response.status === 204) {
                setSuccessMessage('Rule successfully deleted.');
                await fetchRules();
            } else {
                throw new Error('Failed to delete rule.');
            }
        } catch (err) {
            setError((err as Error).message || 'An error occurred while deleting the rule.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (rule: RuleFrontend | null = null) => {
        setEditingRule(rule);
        setModalOpen(true);
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                    Notification Rules Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => handleOpenModal(null)}
                    sx={{ borderRadius: 2 }}
                    color="primary"
                >
                    New Rule
                </Button>
            </Box>

            {/* Status Messages */}
            {successMessage && (
                <Alert
                    icon={<CheckCircle size={20} />}
                    severity="success"
                    onClose={() => setSuccessMessage(null)}
                    sx={{ mb: 2 }}
                >
                    {successMessage}
                </Alert>
            )}
            {error && (
                <Alert
                    icon={<AlertTriangle size={20} />}
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading && rules.length === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress color="primary" />
                    <Typography sx={{ mt: 2 }}>Loading rules...</Typography>
                </Box>
            )}

            {/* Rules Table */}
            {!loading || rules.length > 0 ? (
                <RulesTable
                    rules={rules}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            ) : null}

            {/* Rule Modal */}
            <RuleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                rule={editingRule}
                onSave={(_, data) => handleSave({ ...data, userId: user!.id })}
                loading={loading}
            />
        </Box>
    );
};

export default NotificationRulePage;