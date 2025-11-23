const fs = require('fs');
const path = require('path');

const LOG_FILES = ['server.log', 'browser.log'];
const ERROR_KEYWORDS = ['Error', 'Fail', 'Exception', 'Unhandled'];

console.log("Checking logs for errors...");

let hasErrors = false;

LOG_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`\n--- Checking ${file} ---`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fileErrors = 0;
      
      lines.forEach((line, index) => {
        if (ERROR_KEYWORDS.some(keyword => line.includes(keyword))) {
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
    }
  } else {
    console.log(`\n[INFO] ${file} not found. Skipping.`);
  }
});

if (hasErrors) {
  console.log("\n⚠️  Issues detected in logs. Please review them.");
  process.exit(1);
} else {
  console.log("\n✅ Logs check passed.");
  process.exit(0);
}
