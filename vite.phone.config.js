import { mergeConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import base from './vite.config.js';

/**
 * NEON RIDE - the phone testing server. `npm run dev:phone`.
 *
 * HTTPS, because DEVICEORIENTATION IS A SECURE-CONTEXT API. Served over plain
 * http:// to a LAN address the sensor events simply never arrive - no error, no
 * permission prompt, nothing at all - so tilt steering looks broken in a way
 * that reads as a bug in the game rather than as a missing certificate.
 *
 * A SEPARATE CONFIG rather than an env var on the one script, because
 * `PHONE=1 vite` is not a thing the Windows shell understands and this project
 * is developed on two Windows laptops. Adding cross-env to carry one boolean is
 * a dependency for nothing.
 *
 * The certificate is self-signed, so the phone will warn once and has to be
 * told to continue. That is expected and is not a sign anything is wrong.
 */
export default mergeConfig(base, {
  plugins: [basicSsl()],
  // --host is also passed on the command line; this makes the intent explicit
  // for anyone reading the config rather than the script.
  server: { host: true },
});
