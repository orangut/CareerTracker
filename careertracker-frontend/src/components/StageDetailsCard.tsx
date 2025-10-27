import { Box, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import type { Stage } from "../models/stage";
import { checkIfDate, formatDate } from "../utils/helperFunctions";
import PrimaryTooltip from "./PrimaryTooltip";
import { useState } from "react";
import StageFormDialog, { type PartialStage } from "./StageFormDialog";

type StageDetailsCardProps = {
  stage: Stage;
  onEditStage: (editedStage: PartialStage) => void;
};



const StageDetailsCard = ({ stage, onEditStage }: StageDetailsCardProps) => {
  const [stageFormEditOpen, setStageFormEditOpen] = useState(false);
  const stageFieldsToDisplay = Object.entries(stage).filter(([key, _]) => !key.toLowerCase().includes('id') && !['type', 'notes'].includes(key));
  
  return (
    <Paper elevation={2} sx={{ p: 3, minWidth: '70%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" >
        <Typography variant="h6" gutterBottom sx={{
          textShadow: '1px 2px 8px rgba(0,0,0,0.08)',
          background: 'linear-gradient(90deg, #1976d2 30%, #42a5f5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
        }}>
          {stage.type}
        </Typography>
        <PrimaryTooltip title="Edit Stage" >
          <IconButton size="medium" >
            <EditIcon color='primary' fontSize="medium" onClick={() => setStageFormEditOpen(true)} />
          </IconButton>
        </PrimaryTooltip>
        <StageFormDialog
          key={"edit-stage"}
          open={stageFormEditOpen}
          stage={{ type: stage.type, startedAt: stage.startedAt, completedAt: stage.completedAt, notes: stage.notes }}
          onClose={() => setStageFormEditOpen(false)}
          onSubmit={(stage) => onEditStage(stage)} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={1}>
        {stageFieldsToDisplay.map(([key, value]) => (
          <Stack direction="row" spacing={1} key={key}>
            <Typography variant="body2" color="text.secondary" >{key}:</Typography>
            {checkIfDate(value) ?
              <Typography variant="body2">{formatDate(value as Date | string, true)}</Typography> :
              <Typography variant="body2">{value?.toString() || '—'}</Typography>
            }
          </Stack>
        ))
        }
        <Box>
          <Typography variant="body2" color="text.secondary">notes:</Typography>
          <Stack spacing={0.5} sx={{ pl: 1 }}>
            {stage.notes && stage.notes.length > 0
              ? stage.notes.map((note, idx) => (
                <Typography key={idx} variant="body2">• {note}</Typography>
              ))
              : <Typography variant="body2">No notes.</Typography>
            }
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
};

export default StageDetailsCard;