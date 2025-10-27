import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, Typography, DialogContent, InputAdornment, IconButton, Stack } from '@mui/material';
import { type Stage } from '../models/stage';
import { Trash2 } from 'lucide-react';
import PrimaryTooltip from './PrimaryTooltip';
import AddIcon from '@mui/icons-material/Add';

export type PartialStage = Pick<Stage, 'type' | 'startedAt' | 'completedAt' | 'notes'>;


interface StageFormDialogProps {
    open: boolean;
    onClose: () => void;
    stage?: PartialStage | null;
    onSubmit: (stage: PartialStage) => void;
}

const StageFormDialog: React.FC<StageFormDialogProps> = ({ open, onClose, stage, onSubmit }) => {
    const defaulStageFields = {
        type: 'applied',
        startedAt: new Date(),
        completedAt: new Date(),
        notes: [] as string[],
    }

    const [formState, setFormState] = useState<PartialStage>(defaulStageFields);

    // keep track of mounted to guard async ops if needed
    const isMounted = React.useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Sync / initialize when dialog opens or when `stage` prop changes.
    useEffect(() => {
        if (open) {
            setFormState(stage ?? defaulStageFields);
        }
        // when dialog closes, we defer full reset until exit transition via TransitionProps.onExited
    }, [open, stage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
        const { name, value } = e.target;
        if (name === 'notes' && index !== undefined) {
            const updatedNotes = [...(formState.notes ?? [])];
            updatedNotes[index] = value;
            setFormState({ ...formState, notes: updatedNotes });
        } else {
            setFormState({ ...formState, [name]: value });
        }
    };

    const handleEraseNote = (index: number) => {
        if (formState.notes && formState.notes.length > index) {
            const updatedNotes = [...formState.notes];
            updatedNotes.splice(index, 1);
            setFormState({ ...formState, notes: updatedNotes });
        }
    };

    const addNoteField = () => {
        setFormState({ ...formState, notes: [...(formState.notes ?? []).filter((n) => n.length), ''] });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filteredNotes = (formState.notes ?? []).filter((n) => n.length);
        const payload: PartialStage = ({ ...formState, notes: filteredNotes });
        onSubmit(payload);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionProps={{
                onExited: () => {
                    // reset form after exit transition so the closed UI is fully reset
                    // guard with isMounted in case component unmounted
                    if (isMounted.current) setFormState(defaulStageFields);
                }
            }}
            sx={{ p: 2, minWidth: '480', width: '100%' }}>
            <DialogTitle alignContent={'center'} >
                <Typography color='primary' align='center'>
                    {stage ? 'Edit Stage' : 'Add New Stage'}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Type"
                        name="type"
                        value={formState.type}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2, mt: 2 }}
                    />
                    <TextField
                        label="Started At"
                        type="date"
                        name="startedAt"
                        value={new Date(formState.startedAt).toISOString().split('T')[0]}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Completed At"
                        type="date"
                        name="completedAt"
                        value={formState.completedAt ? new Date(formState.completedAt).toISOString().split('T')[0] : null}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Stack direction="row" alignItems="start"  >
                        <Typography>Notes:</Typography>
                        <PrimaryTooltip title="Add note" >
                            <IconButton size="small" >
                                <AddIcon color='primary' fontSize="small" onClick={addNoteField} />
                            </IconButton>
                        </PrimaryTooltip>
                    </Stack>
                    {formState.notes && formState.notes.map((note, index) => (
                        <TextField
                            key={index}
                            type="text"
                            name="notes"
                            value={note}
                            onChange={(e) => handleChange(e, index)}
                            margin="normal"
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={(_) => handleEraseNote(index)}>
                                            <Trash2 />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    ))}
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Button type="submit" variant="contained">Submit</Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog >
    );
};

export default StageFormDialog;