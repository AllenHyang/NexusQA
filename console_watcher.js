import puppeteer from 'puppeteer';
import fs from 'fs';

const LOG_FILE = 'browser.log';

// Ensure log file exists and is empty on start
fs.writeFileSync(LOG_FILE, '');

function logToFile(type, text) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] ${text}\n`;
  fs.appendFileSync(LOG_FILE, logLine);
}

(async () => {
  const TARGET_URL = 'http://localhost:3000';
  
  console.log(`\x1b[36m[Watcher]\x1b[0m Starting universal console watcher for: ${TARGET_URL}`);
  console.log(`\x1b[36m[Watcher]\x1b[0m Logs are being written to ${LOG_FILE}`);
  console.log('---------------------------------------------------');

  const browser = await puppeteer.launch({
    headless: false, // Visible browser for user interaction
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Catch Console Logs
  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    const text = msg.text();
    
    let color = '\x1b[37m'; // White
    let icon = '📝';

    if (type === 'ERROR') {
        color = '\x1b[31m'; // Red
        icon = '❌';
    } else if (type === 'WARNING') {
        color = '\x1b[33m'; // Yellow
        icon = '⚠️';
    } else if (type === 'INFO') {
        color = '\x1b[36m'; // Cyan
        icon = 'ℹ️';
    }

    console.log(`${icon} ${color}[${type}] ${text}\x1b[0m`);
    logToFile(type, text);
  });

  // 2. Catch Uncaught Exceptions
  page.on('pageerror', err => {
    const text = err.toString();
    console.error(`🔥 \x1b[31m[EXCEPTION] ${text}\x1b[0m`);
    logToFile('EXCEPTION', text);
  });

  // 3. Catch Failed Requests (404s, 500s)
  page.on('requestfailed', request => {
    const text = `${request.url()} - ${request.failure()?.errorText}`;
    console.error(`🚫 \x1b[31m[NETWORK FAIL] ${text}\x1b[0m`);
    logToFile('NETWORK_FAIL', text);
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    console.log(`\x1b[32m[Watcher]\x1b[0m Connected successfully! Listening...`);
  } catch (error) {
    console.error(`\x1b[31m[Watcher] Connection failed. Is the app running on ${TARGET_URL}?\x1b[0m`);
    // Don't exit, allow retry or manual fix
  }
})();
