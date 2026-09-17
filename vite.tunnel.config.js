import { mergeConfig } from 'vite';
import base from './vite.config.js';

/**
 * NEON RIDE - plain HTTP behind a tunnel. `npm run dev:tunnel`.
 *
 * For when the self-signed certificate from vite.phone.config.js is the
 * problem rather than the solution. A browser that has been told to proceed
 * past a certificate warning may still refuse powerful APIs, and
 * DeviceOrientation is one of them - so the fix is a REAL certificate, which
 * means somebody else's.
 *
 * Cloudflare's quick tunnel terminates TLS with a trusted certificate and
 * forwards plain HTTP to this server:
 *
 *     npm run dev:tunnel
 *     cloudflared tunnel --url http://localhost:5173
 *
 * `allowedHosts` is why this is a separate config. Vite refuses requests whose
 * Host header it does not recognise, and a tunnel's host is random per run, so
 * the default server answers a tunnel with a blocked-host error and nothing
 * else. Open here and nowhere else: this config only ever runs deliberately.
 */
export default mergeConfig(base, {
  server: {
    host: true,
    allowedHosts: true,
  },
});
