import { Card, CardContent, Typography, Stack, CardHeader } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDate } from '../utils/helperFunctions';

type StageCardProps = {
  id: number,
  isSelected: boolean,
  onSelect: (id: number) => void,
  title: string;
  time: Date | string;
};

const StageCard = ({ id, isSelected, onSelect, title, time }: StageCardProps) => (
  <Card
    key={id}
    onClick={() => onSelect(id)}
    elevation={1}
    sx={{
      width: 240,
      height: 80,
      my: 0.5,
      cursor: 'pointer',
      transition: "0.2s",
      border: isSelected ? "2px solid #1976d2" : "1px solid #ccc",
      backgroundColor: isSelected ? "action.selected" : "background.paper",
      "&:hover": {
        borderColor: "#1976d2",
        boxShadow: 3,
      },
    }}
  >
    <CardContent sx={{ py: 2, px: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <AccessTimeIcon fontSize="small" color="action" />
        <Typography variant="body2">{formatDate(time, true)}</Typography>
      </Stack>
    </CardContent>
  </Card>
);

export default StageCard;