import Tooltip, { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const PrimaryTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper,
    fontWeight: 500,
    fontSize: 12,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.primary.main,
  },
}));

export default PrimaryTooltip;