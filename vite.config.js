import { defineConfig } from 'vite';

/**
 * NEON RIDE - build config. Plain HTTP, which is what `npm run dev` and every
 * note in this repo assume.
 *
 * Phone testing uses vite.phone.config.js, which merges HTTPS on top of this
 * one. See the note there for why it has to.
 *
 * `base: './'` because itch.io serves the build from a subdirectory: an
 * absolute `/assets/...` path resolves against the host root there and loads a
 * blank page. Runtime asset URLs (sprites/, thumbs/) are already relative for
 * the same reason - keep them that way, Vite does not rewrite string literals.
 */
export default defineConfig({
  base: './',
});
