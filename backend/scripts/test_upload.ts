import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testUpload() {
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, 'Dummy PDF content');

  const formData = new FormData();
  formData.append('casFile', fs.createReadStream(dummyPdfPath));
  formData.append('password', 'password123');

  try {
    const res = await fetch('http://localhost:3000/api/portfolio/upload-cas', {
      method: 'POST',
      // @ts-expect-error type mismatch with node-fetch
      body: formData,
      headers: {
        // Simulating the default demo user by NOT sending Authorization header
        // since the backend falls back to the demo user when authHeader is missing
      }
    });
    
    const data = await res.json();
    console.log('Upload response:', data);
  } catch (err) {
    console.error('Error during upload test:', err);
  } finally {
    fs.unlinkSync(dummyPdfPath);
  }
}

testUpload();
