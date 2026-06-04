const forge = require('node-forge');
try {
  const keys = forge.pki.rsa.generateKeyPair(512);
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    { shortName: 'C', value: 'AR' },
    { shortName: 'O', value: 'Test Org' },
    { shortName: 'CN', value: 'Test CN' },
    { type: '2.5.4.5', value: 'CUIT 123456' } // 2.5.4.5 is OID for serialNumber
  ]);
  csr.sign(keys.privateKey, forge.md.sha256.create());
  console.log('OK');
} catch (e) {
  console.error(e);
}
