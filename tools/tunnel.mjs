/**
 * A TRUSTED https:// URL for the phone, in one command.
 *
 *     npm run dev:tunnel
 *
 * Starts the dev server and a Cloudflare quick tunnel in front of it, waits for
 * the tunnel's own URL, and prints the two addresses to open on the phone.
 *
 * WHY NOT JUST USE dev:phone. That server has a SELF-SIGNED certificate, and a
 * browser that has been told to proceed past a certificate warning does not
 * necessarily hand back everything a properly secured page gets. Sensors are
 * exactly the kind of API that can be withheld, so a certificate warning turns
 * "tilt does not work" into a question with two answers and no way to tell them
 * apart. A real certificate removes one of them. This one is Cloudflare's.
 *
 * TWO PROCESSES, ONE COMMAND. It used to be two commands with a port written
 * into both, and that is how a stale server on 5173 sent vite to 5174 while
 * cloudflared went on addressing 5173 - the tunnel answered 404 from a server
 * nobody meant to run. The port is pinned with strictPort so vite FAILS rather
 * than moving, and the tunnel is only started once vite has said it is up.
 */

import { spawn } from 'node:child_process';
import { bin, install } from 'cloudflared';
import { existsSync } from 'node:fs';

const PORT = 5173;
const NEWLINE = String.fromCharCode(10);
const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

function startVite() {
  const child = spawn('npm', ['run', 'dev:tunnel:server'], {
    shell: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let text = '';
  child.stdout.on('data', (chunk) => { text += String(chunk); });
  child.stderr.on('data', (chunk) => { text += String(chunk); });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('vite did not start. Output:\n' + text)), 30000,
    );
    const check = setInterval(() => {
      const clean = text.replace(ANSI, '');
      if (/Local:\s+https?:\/\/\S+/.test(clean)) {
        clearTimeout(timer);
        clearInterval(check);
        resolve(child);
      }
      // strictPort means a busy port is a hard failure, and saying so beats
      // waiting thirty seconds to say nothing.
      if (/Port \d+ is already in use|EADDRINUSE/.test(clean)) {
        clearTimeout(timer);
        clearInterval(check);
        reject(new Error('port ' + PORT + ' is already in use. Close the other '
          + 'dev server first - this one will not move, on purpose.'));
      }
    }, 200);
    child.on('error', reject);
  });
}

function stop(child) {
  if (!child) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

if (!existsSync(bin)) {
  console.log('downloading cloudflared (once)...');
  await install(bin);
}

const vite = await startVite();
console.log('dev server up on http://localhost:' + PORT);

/**
 * Starts the tunnel and returns the address it was given.
 *
 * The binary is spawned and its own output is parsed, rather than using the
 * package's `tunnel()` helper: that helper's URL parser did not match the
 * output of the cloudflared version it ships with, so it resolved undefined and
 * printed a working tunnel as `undefined/?stats=1`. The URL is on a line of its
 * own inside a box of plus signs, which is a shape that has not changed in
 * years - and if it ever does, this fails loudly with the output attached
 * instead of quietly with a broken address.
 */
function startTunnel() {
  const child = spawn(bin, ['tunnel', '--url', 'http://localhost:' + PORT], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let text = '';
  const read = (chunk) => { text += String(chunk); };
  child.stdout.on('data', read);
  child.stderr.on('data', read);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('the tunnel gave no URL in 40s. Output:' + NEWLINE + text)),
      40000,
    );
    const check = setInterval(() => {
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match) {
        clearTimeout(timer);
        clearInterval(check);
        resolve({ child, address: match[0] });
      }
      if (child.exitCode !== null) {
        clearTimeout(timer);
        clearInterval(check);
        reject(new Error('the tunnel exited. Output:' + NEWLINE + text));
      }
    }, 250);
    child.on('error', reject);
  });
}

const { child, address } = await startTunnel();

console.log('');
console.log('  TRUSTED HTTPS, open these on the phone:');
console.log('');
console.log('  game          ' + address + '/?stats=1');
console.log('  sensor test   ' + address + '/sensor-test.html');
console.log('');
console.log('  Leave this running. Ctrl+C ends both.');
console.log('');

child.on('exit', () => { stop(vite); process.exit(0); });

const shutdown = () => {
  stop(child);
  stop(vite);
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
