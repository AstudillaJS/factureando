const fs = require('fs');
const path = require('path');

// Simply copy the PNG as the icon - electron-builder handles conversion
const src = path.join(__dirname, 'public', 'lynx-icon.png');
const dst = path.join(__dirname, 'public', 'favicon.ico');

fs.copyFileSync(src, dst);
console.log('Icon copied successfully');
