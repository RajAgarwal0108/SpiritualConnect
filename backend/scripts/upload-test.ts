// backend/scripts/upload-test.ts
import { readFileSync } from 'fs';
import { StorageService } from '../services/storage.service';

(async () => {
  const buffer = readFileSync('/Users/rajagarwal/Developer/SpiritualConnect/backend/uploads/krishna.jpg');
  const url = await StorageService.uploadFile(buffer, '/Users/rajagarwal/Developer/SpiritualConnect/backend/uploads/krishna.jpg');
  console.log('Uploaded URL:', url);
})();