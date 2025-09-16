import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';

const HamburgerMenu = ({ open, onToggle }: { open: boolean; onToggle: (open: boolean) => void }) => {

  const menuItems = (
    <List sx={{ width: 250 }}>
      <HamburgerMenuItem text="Dashboard" path="/" icon={DashboardIcon} onClick={() => onToggle(false)} />
      <HamburgerMenuItem text="Notification" path="/notifaction" icon={NotificationsIcon} onClick={() => onToggle(false)} />
    </List>
  );

  return (
    <div>
      <Button onClick={() => onToggle(true)} sx={{ position: 'fixed', top: 25, left: 16, zIndex: 1200 }}>
        <MenuIcon />
      </Button>
      <Drawer
        anchor="left"
        open={open}
        onClose={() => onToggle(false)}
      >
        {menuItems}
      </Drawer>
    </div>
  );
};

export default HamburgerMenu; 


const HamburgerMenuItem = ({ text, icon: Icon, path, onClick }: { text: string; icon: SvgIconComponent; path: string; onClick: () => void }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton component={Link} to={path} onClick={onClick}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>);
};
