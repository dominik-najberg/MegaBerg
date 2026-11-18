// Test harness: drives the game in headless system Chrome (real WebGL through ANGLE/EGL).
// The built-in preview pane has WebGL disabled, so automated playtests run here instead.
import { chromium } from 'playwright-core';

export const URL = process.env.MB_URL || 'http://localhost:5173/';
export const SHOTS = new globalThis.URL('../../docs/screenshots/', import.meta.url).pathname;

export async function launch({ width = 1280, height = 720, gpu = 'egl' } = {}) {
  const args = {
    egl: ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=gl-egl'],
    vulkan: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=vulkan', '--enable-features=Vulkan'],
    swift: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  }[gpu];
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome',
    headless: true,
    args: [...args, '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--disable-frame-rate-limit=false'],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  return { browser, page, errors };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await sleep(ms);
  await page.keyboard.up(key);
}

export async function shot(page, name) {
  await page.screenshot({ path: SHOTS + name });
  console.log('screenshot', name);
}

export function report(errors) {
  if (errors.length === 0) console.log('console: 0 errors/warnings');
  else {
    // Collapse repeats: one broken shader floods the console with the same warning every frame.
    const counts = new Map();
    for (const e of errors) counts.set(e, (counts.get(e) ?? 0) + 1);
    console.log('console issues:\n' + [...counts].map(([e, n]) => (n > 1 ? `${e}  (x${n})` : e)).join('\n'));
  }
}
