import fs from 'fs';
import path from 'path';

const GIT_PHOTOS_DIR = path.resolve('gitt_photos');
const UPLOAD_DIR = path.resolve('server/uploads');
const DB_PATH = path.resolve('server/data/db.json');

// Helper to sanitize filenames
function sanitizeFilename(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${cleanBase}${ext.toLowerCase()}`;
}

function getMimetype(ext) {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
      return 'video/ogg';
    default:
      return 'application/octet-stream';
  }
}

function cleanName(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  // Remove "WhatsApp Image 2026-06-23 at 7.01.54 PM" -> "Customer Delivery"
  // Keep original if it's not a generic WhatsApp one
  if (base.toLowerCase().includes('whatsapp')) {
    const isVideo = ext.toLowerCase() === '.mp4';
    if (isVideo) {
      return 'Happy Customer Celebration Video';
    } else {
      return 'Luxury Gift Wrap Handover';
    }
  }
  return base.split('-').join(' ').split('_').join(' ');
}

async function run() {
  console.log('🔍 Scanning source directory:', GIT_PHOTOS_DIR);

  if (!fs.existsSync(GIT_PHOTOS_DIR)) {
    console.error('❌ Source directory does not exist:', GIT_PHOTOS_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('Creating upload directory:', UPLOAD_DIR);
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Find all files recursively in gitt_photos
  const filesToProcess = [];
  function scan(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'].includes(ext)) {
          filesToProcess.push({
            fullPath,
            filename: item,
            ext,
            size: stat.size
          });
        }
      }
    }
  }

  scan(GIT_PHOTOS_DIR);
  console.log(`Found ${filesToProcess.length} media files to process.`);

  // Load DB
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ db.json file not found at:', DB_PATH);
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (!db.media) {
    db.media = [];
  }

  let copiedCount = 0;
  let skippedCount = 0;

  for (const file of filesToProcess) {
    const sanitized = sanitizeFilename(file.filename);
    const destPath = path.join(UPLOAD_DIR, sanitized);
    
    // Copy the file
    fs.copyFileSync(file.fullPath, destPath);
    console.log(`Copied: ${file.filename} -> ${sanitized}`);

    // Check if already in db
    const exists = db.media.some(m => m.filename === sanitized);
    if (!exists) {
      const mimetype = getMimetype(file.ext);
      const isVideo = mimetype.startsWith('video');
      const name = cleanName(file.filename);
      
      const mediaItem = {
        name: name,
        filename: sanitized,
        mimetype: mimetype,
        size: file.size,
        url: `http://localhost:5000/uploads/${sanitized}`,
        _id: `med_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };

      db.media.push(mediaItem);
      copiedCount++;
    } else {
      skippedCount++;
    }
  }

  // Save back DB
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`\n🎉 Success! Copied ${filesToProcess.length} files. Added ${copiedCount} new items to db.json. Skipped ${skippedCount} existing database entries.`);
}

run();
