#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const manifestPath = path.join(projectRoot, 'manifest.config.ts');

function exec(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    ...options
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function ensureCleanGitState() {
  let output = '';

  const child = spawn('git', ['status', '--porcelain'], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'inherit']
  });

  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Failed to inspect git status'));
      }
    });
    child.on('error', reject);
  });

  if (output.trim().length > 0) {
    throw new Error('Git working tree is dirty. Please commit or stash changes before running this script.');
  }
}

function validateVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('Version must follow semantic versioning (e.g., 0.2.0). Do not include a leading v.');
  }
}

async function updatePackageJson(version) {
  const raw = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(raw);
  pkg.version = version;
  const formatted = `${JSON.stringify(pkg, null, 2)}\n`;
  await writeFile(packageJsonPath, formatted, 'utf-8');
}

async function updateManifest(version) {
  const raw = await readFile(manifestPath, 'utf-8');
  const updated = raw.replace(/version:\s*'[^']*'/, `version: '${version}'`);

  if (updated === raw) {
    throw new Error('Failed to update manifest version. Expected to find version property.');
  }

  await writeFile(manifestPath, updated, 'utf-8');
}

async function main() {
  try {
    await ensureCleanGitState();

    const newVersion = process.argv[2];
    if (!newVersion) {
      throw new Error('Usage: npm run release:prepare -- <new-version>');
    }

    validateVersion(newVersion);

    console.log(`Updating package.json version to ${newVersion}...`);
    await updatePackageJson(newVersion);

    console.log('Updating manifest version...');
    await updateManifest(newVersion);

    console.log('Installing dependencies to refresh lockfile...');
    await exec('npm', ['install']);

    const tagName = `v${newVersion}`;

    console.log('Committing version bump...');
    await exec('git', ['commit', '-am', `chore(release): ${tagName}`]);

    console.log(`Creating git tag ${tagName}...`);
    await exec('git', ['tag', tagName]);

    console.log(`\nDone! Review commit and tag, then push with:\n  git push origin main --tags\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
