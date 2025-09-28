import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_ICON = path.resolve(__dirname, '../icon.png');
const OUTPUT_DIR = path.resolve(__dirname, '../icons');
const SIZES = [16, 32, 48, 128, 256, 512];

async function ensureSourceExists() {
  try {
    await access(SOURCE_ICON, constants.R_OK);
  } catch (error) {
    throw new Error(`Source icon not found at ${SOURCE_ICON}`);
  }
}

async function createIcons() {
  await ensureSourceExists();
  await mkdir(OUTPUT_DIR, { recursive: true });

  await Promise.all(
    SIZES.map(async (size) => {
      const destination = path.join(OUTPUT_DIR, `icon-${size}.png`);
      await sharp(SOURCE_ICON)
        .resize(size, size, { fit: 'cover' })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(destination);
    })
  );
}

async function main() {
  try {
    await createIcons();
    const relativeDir = path.relative(process.cwd(), OUTPUT_DIR);
    console.log(`Generated icons in ${relativeDir}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
