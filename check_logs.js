const fs = require('fs');
const path = require('path');

const LOG_FILES = ['server.log', 'browser.log'];
const ERROR_KEYWORDS = ['Error', 'Fail', 'Exception', 'Unhandled'];

console.log("Checking logs for errors...");

let hasErrors = false;
let filesFound = 0;

LOG_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    filesFound++;
    console.log(`\n--- Checking ${file} ---`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim().length === 0) {
          console.log(`[WARN] ${file} is empty.`);
      }
      
      const lines = content.split('\n');
      let fileErrors = 0;
      
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if (ERROR_KEYWORDS.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
          console.log(`[Line ${index + 1}] ${line.trim()}`);
          fileErrors++;
        }
      });
      
      if (fileErrors > 0) {
        console.log(`Found ${fileErrors} potential errors in ${file}.`);
        hasErrors = true;
      } else {
        console.log(`No errors found in ${file}.`);
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
      hasErrors = true;
    }
  } else {
    console.error(`\n[ERROR] ${file} not found. Make sure you have run './start_debug.sh' first.`);
    hasErrors = true;
  }
});

if (filesFound === 0 && !hasErrors) {
    // Should be caught by the else block above, but just in case
    console.error("\n[ERROR] No log files found.");
    process.exit(1);
}

if (hasErrors) {
  console.log("\n⚠️  Issues detected (or logs missing). Please review.");
  process.exit(1);
} else {
  console.log("\n✅ Logs check passed.");
  process.exit(0);
}
