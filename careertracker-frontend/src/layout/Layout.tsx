import { useState } from "react";
import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import Header from "./Header";
import DrawerMenu from "./DrawerMenu";

export default function Layout() {
    const [open, setOpen] = useState(false);
    const drawerWidth = 230; // Width of the hamburger menu drawer

    return (
        <>
            <DrawerMenu open={open} onToggle={(isOpen) => setOpen(isOpen)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    transition: 'margin-left .3s',
                    marginLeft: open ? `${drawerWidth}px` : 0,
                }}
            >
                <Header />
                <Outlet />
            </Box>
        </>
    );
}
