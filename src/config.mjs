/**
 * config.mjs — YAML configuration loader
 * Loads profile and portal configs with sensible defaults.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

/**
 * Safely loads a YAML file, returning null if missing.
 */
export function loadYaml(relativePath) {
  const absPath = resolve(ROOT, relativePath);
  if (!existsSync(absPath)) return null;
  const raw = readFileSync(absPath, 'utf8');
  return yaml.load(raw);
}

/**
 * Returns the user profile from config/profile.yml
 */
export function loadProfile() {
  const profile = loadYaml('config/profile.yml');
  if (!profile) {
    console.error('❌ config/profile.yml not found. Copy config/profile.example.yml and fill it in.');
    process.exit(1);
  }
  return profile;
}

/**
 * Returns the portal scanner config from config/portals.yml
 */
export function loadPortals() {
  const portals = loadYaml('config/portals.yml');
  if (!portals) {
    console.error('❌ config/portals.yml not found. Copy config/portals.example.yml and fill it in.');
    process.exit(1);
  }
  return portals;
}

/**
 * Returns the cv.md content as a string.
 */
export function loadCV() {
  const cvPath = resolve(ROOT, 'cv.md');
  if (!existsSync(cvPath)) {
    console.error('❌ cv.md not found in project root.');
    process.exit(1);
  }
  return readFileSync(cvPath, 'utf8');
}

export { ROOT };
