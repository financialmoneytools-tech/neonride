import { defineConfig } from 'vite';

/**
 * NEON RIDE - build config. Plain HTTP, which is what `npm run dev` and every
 * note in this repo assume.
 *
 * Phone testing uses vite.phone.config.js, which merges HTTPS on top of this
 * one. See the note there for why it has to.
 */
export default defineConfig({});
