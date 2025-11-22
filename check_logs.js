import fs from 'fs';
import path from 'path';

const BROWSER_LOG = 'browser.log';
const SERVER_LOG = 'server.log';
const TIME_WINDOW_MINUTES = 5; // Only check logs from the last 5 minutes

function checkLogs() {
    console.log('\x1b[36m🔍 Checking logs for recent issues...\x1b[0m');
    let hasIssues = false;
    const now = new Date();

    // Regex Literal for safety: /^\[(.*?)\] \[(.*?)\] (.*)/
    // Captures: [Timestamp] [Type] Message
    const LOG_REGEX = /^\[(.*?)\] \[(.*?)\] (.*)/;

    // 1. Check Browser Logs (Structured with timestamps)
    if (fs.existsSync(BROWSER_LOG)) {
        try {
            const content = fs.readFileSync(BROWSER_LOG, 'utf-8');
            const lines = content.split('\n').filter(l => l.trim());
            
            const recentErrors = lines.filter(line => {
                const match = line.match(LOG_REGEX);
                if (!match) return false;

                const [_, timestampStr, type, msg] = match;
                const logTime = new Date(timestampStr);
                
                // Time check - filter within the TIME_WINDOW_MINUTES
                const diffMinutes = (now.getTime() - logTime.getTime()) / 1000 / 60;
                if (diffMinutes > TIME_WINDOW_MINUTES) return false;

                // Type check
                return ['ERROR', 'EXCEPTION', 'NETWORK_FAIL', 'FATAL', 'WARN', 'WARNING'].includes(type);
            });

            if (recentErrors.length > 0) {
                hasIssues = true;
                console.log(`\n\x1b[31m🚨 Found ${recentErrors.length} recent browser issues (last ${TIME_WINDOW_MINUTES} mins):\x1b[0m`);
                
                recentErrors.forEach(line => {
                    const match = line.match(LOG_REGEX);
                    if (match) {
                        const [_, timestampStr, type, msg] = match;
                        const localTime = new Date(timestampStr).toLocaleString(); // Convert to local time
                        console.log(`   [${localTime}] [${type}] ${msg}`);
                    } else {
                        console.log(`   ${line}`);
                    }
                });
            }
        } catch (err) {
            console.error(`Error reading ${BROWSER_LOG}:`, err.message);
        }
    }

    // 2. Check Server Logs (Simple tail check)
    if (fs.existsSync(SERVER_LOG)) {
        try {
            const content = fs.readFileSync(SERVER_LOG, 'utf-8');
            const lines = content.split('\n');
            const tail = lines.slice(-50); 
            
            const serverErrors = tail.filter(line => {
                const lower = line.toLowerCase();
                return (lower.includes('error') || lower.includes('fail') || lower.includes('exception')) && 
                       !lower.includes('node_modules') && 
                       !lower.includes('debugger attached'); 
            });

            if (serverErrors.length > 0) {
                hasIssues = true;
                console.log(`\n\x1b[33m⚠️  Found potential server issues (last 50 lines):\x1b[0m`);
                serverErrors.forEach(line => console.log(`   ${line.trim()}`));
            }
        } catch (err) {
             console.error(`Error reading ${SERVER_LOG}:`, err.message);
        }
    }

    if (!hasIssues) {
        console.log('\n\x1b[32m✅ No fresh issues found in logs.\x1b[0m');
    } else {
        console.log('\n\x1b[90m(Tip: Check full logs in server.log or browser.log for more context)\x1b[0m');
    }
}

checkLogs();