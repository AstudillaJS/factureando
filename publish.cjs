const { execSync } = require('child_process');
// process.env.GH_TOKEN should be set in the shell environment before running
try {
  execSync('npm run release', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
