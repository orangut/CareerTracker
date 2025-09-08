import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {jobData} from "./Constants.tsx";
import App from "./App.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App jobData={jobData}/>
    </StrictMode>,
)
