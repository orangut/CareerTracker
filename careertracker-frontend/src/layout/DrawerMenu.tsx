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
import Box from '@mui/material/Box';

interface DrawerMenuProps {
  open: boolean;
  onToggle: () => void;
  drawerWidth?: number;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ open, onToggle, drawerWidth }) => {

  const menuItems = (
    <Box sx={{ width: drawerWidth ?? 250 }} onClick={onToggle}>
      <List>
        <HamburgerMenuItem text="Dashboard" path="/" icon={DashboardIcon} onClick={onToggle} />
        <HamburgerMenuItem text="Notification" path="/notifaction" icon={NotificationsIcon} onClick={onToggle} />
      </List>
    </Box>
  );

  return (
    // <div>
    /* <Button onClick={() => onToggle(true)} sx={{ position: 'fixed', top: 25, left: 16, zIndex: 1200 }}>
      <MenuIcon />
    </Button> */
    <Drawer
      anchor="left"
      open={open}
      onClose={onToggle}
      sx={{
        mt: 100,
        pt: 40,
        '& .MuiDrawer-paper': { width: drawerWidth ?? 250 },
      }}
    >
      {menuItems}
    </Drawer>
    // </div>
  );
};

export default DrawerMenu;


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
