import {createRoot} from 'react-dom/client'
import App from "./App.tsx";
import {ThemeProvider} from "@mui/material";
import {lightTheme} from "./Theme.tsx";

createRoot(document.getElementById('root')!).render(
    <ThemeProvider theme={lightTheme}>
        <App/>
    </ThemeProvider>
)
