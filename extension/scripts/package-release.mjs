import { mkdir, readFile, rm, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const releaseDir = path.join(projectRoot, 'release');
const packageJsonPath = path.join(projectRoot, 'package.json');

function runCommand(command, args = []) {
  const executable = process.platform === 'win32' && !command.endsWith('.cmd') ? `${command}.cmd` : command;

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${[command, ...args].join(' ')} exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function ensureDistExists() {
  try {
    await access(distDir);
  } catch {
    throw new Error('Build output not found. Run the build before packaging.');
  }
}

async function readPackageVersion() {
  const raw = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw);
  if (!pkg.version) {
    throw new Error('package.json is missing a version field.');
  }
  return pkg.version;
}

function normaliseVersionString(version) {
  return version.startsWith('v') ? version.slice(1) : version;
}

async function zipDist(destinationPath) {
  await mkdir(releaseDir, { recursive: true });
  await rm(destinationPath, { force: true });

  const output = createWriteStream(destinationPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const closePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  archive.on('warning', (warning) => {
    if (warning.code === 'ENOENT') {
      console.warn(warning.message);
    } else {
      throw warning;
    }
  });

  archive.on('error', (error) => {
    throw error;
  });

  archive.pipe(output);
  archive.directory(distDir, false);
  await archive.finalize();
  await closePromise;
}

async function main() {
  try {
    console.log('Generating icons...');
    await runCommand('npm', ['run', 'icons']);

    console.log('Building extension...');
    await runCommand('npm', ['run', 'build']);

    await ensureDistExists();
    const packageVersion = await readPackageVersion();
    const releaseVersion = process.env.RELEASE_VERSION?.trim();
    let artifactSuffix;

    if (releaseVersion && releaseVersion.length > 0) {
      const normalizedReleaseVersion = normaliseVersionString(releaseVersion);

      if (normalizedReleaseVersion !== packageVersion) {
        throw new Error(
          `RELEASE_VERSION (${releaseVersion}) does not match package.json version (${packageVersion}). Ensure they align before packaging.`
        );
      }

      artifactSuffix = releaseVersion;
      console.log(`Using release version ${releaseVersion} from environment.`);
    } else {
      artifactSuffix = `v${packageVersion}`;
      console.log(`No RELEASE_VERSION provided. Falling back to package.json version v${packageVersion}.`);
    }

    const zipName = `v0-preview-extension-${artifactSuffix}.zip`;
    const destinationPath = path.join(releaseDir, zipName);

    console.log(`Packaging dist into release/${zipName}...`);
    await zipDist(destinationPath);

    console.log(`
Release bundle ready: ${path.relative(projectRoot, destinationPath)}
Upload this zip to your GitHub release assets.
`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
