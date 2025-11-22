import fs from 'fs';
import path from 'path';

const BROWSER_LOG = 'browser.log';
const SERVER_LOG = 'server.log';
const MAX_DISPLAY_LINES = 20; 

function checkLogs() {
    console.log('\x1b[36m🔍 Checking logs for active issues...\x1b[0m');
    let hasIssues = false;
    
    const LOG_REGEX = /^\[(.*?)\] \[(.*?)\] (.*)/;

    // --- 1. Check Browser Logs ---
    if (fs.existsSync(BROWSER_LOG)) {
        try {
            const content = fs.readFileSync(BROWSER_LOG, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim());
            
            // Find the last "Reset/Update" marker
            let lastMarkerIndex = -1;
            let markerLabel = 'Start of session';

            // Common Vite client-side markers
            const markers = ['[vite] hot updated', '[vite] page reload', '[vite] connected'];

            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                if (markers.some(m => line.includes(m))) {
                    lastMarkerIndex = i;
                    markerLabel = 'Last Hot Update / Reload';
                    break;
                }
            }

            // Only consider lines AFTER the marker
            const relevantLines = lines.slice(lastMarkerIndex + 1);
            
            const errorLines = relevantLines.filter(line => {
                const match = line.match(LOG_REGEX);
                if (!match) return false;
                const [_, timestampStr, type, msg] = match;
                return ['ERROR', 'EXCEPTION', 'NETWORK_FAIL', 'FATAL'].includes(type);
            });

            if (errorLines.length > 0) {
                hasIssues = true;
                const recentErrors = errorLines.slice(-MAX_DISPLAY_LINES);
                
                console.log(`\n\x1b[31m🚨 Found ${errorLines.length} active browser issues (since ${markerLabel}):\x1b[0m`);
                
                recentErrors.forEach(line => {
                    const match = line.match(LOG_REGEX);
                    if (match) {
                        const [_, timestampStr, type, msg] = match;
                        let timeDisplay = timestampStr;
                        try { timeDisplay = new Date(timestampStr).toLocaleTimeString(); } catch (e) {}
                        console.log(`   [${timeDisplay}] [${type}] ${msg}`);
                    } else {
                        console.log(`   ${line}`);
                    }
                });
            }
        } catch (err) {
            console.error(`Error reading ${BROWSER_LOG}:`, err.message);
        }
    }

    // --- 2. Check Server Logs ---
    if (fs.existsSync(SERVER_LOG)) {
        try {
            const content = fs.readFileSync(SERVER_LOG, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim());

            // Find the last server update marker
            let lastMarkerIndex = -1;
            let markerLabel = 'Start of session';
            
            // Common Vite server-side markers
            // "hmr update", "page reload", "ready in" (startup)
            const markers = ['hmr update', 'page reload', 'ready in'];

            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].toLowerCase();
                if (markers.some(m => line.includes(m))) {
                    lastMarkerIndex = i;
                    markerLabel = 'Last Server Update';
                    break;
                }
            }

            const relevantLines = lines.slice(lastMarkerIndex + 1);

            const serverErrors = relevantLines.filter(line => {
                const lower = line.toLowerCase();
                return (lower.includes('error') || lower.includes('fail') || lower.includes('exception')) && 
                       !lower.includes('node_modules') && 
                       !lower.includes('debugger attached') &&
                       !lower.includes('pre-transform error: failed to load url');
            });

            if (serverErrors.length > 0) {
                hasIssues = true;
                const recentServerErrors = serverErrors.slice(-MAX_DISPLAY_LINES);
                
                console.log(`\n\x1b[33m⚠️  Found ${serverErrors.length} active server issues (since ${markerLabel}):\x1b[0m`);
                recentServerErrors.forEach(line => console.log(`   ${line.trim()}`));
            }
        } catch (err) {
             console.error(`Error reading ${SERVER_LOG}:`, err.message);
        }
    }

    if (!hasIssues) {
        console.log('\n\x1b[32m✅ No active issues found (Logs clean since last update).\x1b[0m');
    } else {
        console.log('\n\x1b[90m(Tip: Errors before the last HMR/Reload are ignored. Check full logs if needed.)\x1b[0m');
    }
}

checkLogs();