// secure-build.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Generate a unique key and IV for this build
const buildKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Encrypt each config value
const encryptedConfig = {};
Object.keys(process.env).forEach(key => {
  if (key.startsWith('FIREBASE_')) {
    const cipher = crypto.createCipheriv('aes-256-cbc', buildKey, iv);
    let encrypted = cipher.update(process.env[key], 'utf8', 'hex');
    encrypted += cipher.final('hex');
    encryptedConfig[key] = encrypted;
  }
});

// Replace placeholders with encrypted values
Object.keys(encryptedConfig).forEach(key => {
  const regex = new RegExp(`%%${key}%%`, 'g');
  html = html.replace(regex, encryptedConfig[key]);
});

// Add decryption function, build key, and IV to the HTML
const decryptScript = `
<script>
  const buildKey = "${buildKey.toString('hex')}";
  const iv = "${iv.toString('hex')}";
  function decryptConfig(encryptedConfig) {
    const config = {};
    Object.keys(encryptedConfig).forEach(key => {
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(buildKey, 'hex'), Buffer.from(iv, 'hex'));
      let decrypted = decipher.update(Buffer.from(encryptedConfig[key], 'hex'));
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      config[key] = decrypted.toString('utf8');
    });
    return config;
  }
  const firebaseConfig = decryptConfig(${JSON.stringify(encryptedConfig)});
  // Initialize Firebase here
</script>
`;

html = html.replace('</body>', `${decryptScript}</body>`);

fs.writeFileSync(htmlPath, html);
console.log('Secure build completed.');