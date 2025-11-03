import { useState } from "react";
import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import Header from "./Header";
import DrawerMenu from "./DrawerMenu";

export default function Layout() {
    const [open, setOpen] = useState(false);
    const drawerWidth = 230; // Width of the hamburger menu drawer

    const onToggle = () => {
        setOpen(!open);
    }
    return (
        <Box sx={{ display: 'flex' }}>
            <Header drawerToggle={onToggle} open={open} drawerWidth={drawerWidth} />
            <DrawerMenu open={open} onToggle={onToggle} drawerWidth={drawerWidth} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1, p: 1, mt: 8,
                    transition: 'margin-left .3s',
                    marginLeft: open ? `${drawerWidth}px` : 0,
                }}
            >
                <Outlet />
            </Box>
        </ Box>
    );
}
