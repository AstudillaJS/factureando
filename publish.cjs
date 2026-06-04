require('dotenv').config();
const { execSync } = require('child_process');

try {
  execSync('npm run release', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
