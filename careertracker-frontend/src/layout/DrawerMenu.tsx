import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';

const HamburgerMenu = ({ open, onToggle }: { open: boolean; onToggle: (open: boolean) => void }) => {

  const menuItems = (
    <List sx={{ width: 250 }}>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/" onClick={() => onToggle(false)}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton component={Link} to="/notifaction" onClick={() => onToggle(false)}>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary="Notification" />
        </ListItemButton>
      </ListItem>
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
