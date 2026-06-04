const https = require('https');

const token = process.env.GH_TOKEN || "";
const options = {
  hostname: 'api.github.com',
  path: '/repos/AstudillaJS/factureando/releases',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js',
    'Authorization': `token ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const releases = JSON.parse(data);
    const release = releases.find(r => r.tag_name === 'v1.0.16' && r.draft === true);
    if (!release) {
      console.log('No draft release found for v1.0.16');
      process.exit(1);
    }
    
    console.log(`Found draft release with id ${release.id}. Patching...`);
    
    const patchData = JSON.stringify({ draft: false, name: 'Factureando v1.0.16' });
    const patchOptions = {
      hostname: 'api.github.com',
      path: `/repos/AstudillaJS/factureando/releases/${release.id}`,
      method: 'PATCH',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': patchData.length
      }
    };
    
    const patchReq = https.request(patchOptions, (patchRes) => {
      let pData = '';
      patchRes.on('data', chunk => pData += chunk);
      patchRes.on('end', () => {
        if (patchRes.statusCode === 200) {
          console.log('Successfully published release!');
        } else {
          console.log(`Failed to patch. Status: ${patchRes.statusCode}`, pData);
          process.exit(1);
        }
      });
    });
    
    patchReq.on('error', console.error);
    patchReq.write(patchData);
    patchReq.end();
  });
});

req.on('error', console.error);
req.end();
