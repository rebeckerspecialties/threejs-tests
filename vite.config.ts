import { resolve } from 'path';
import { defineConfig } from 'vite';
// import eslintPlugin from 'vite-plugin-eslint';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

// This enables cross-origin isolation for the app.
// See https://web.dev/why-coop-coep/
// We do this because we want to use the new API for memory measurement.
const crossOriginIsolation = () => ({
	name: 'configure-server',

	configureServer(server) {
		server.middlewares.use((_req, res, next) => {
			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
			res.setHeader('Cross-Origin-Opener-Policy-Report-Only', 'same-origin');
			res.setHeader('Cross-Origin-Embedder-Policy-Report-Only', 'require-corp');
			next();
		});
	},
});

// https://vitejs.dev/config/
export default defineConfig({
	base: '',
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	// TODO: We have to make sure that payments do not get affected by this. (Cross-Origin Isolation)
	plugins: [react(), crossOriginIsolation(), basicSsl()],

	// This project currently uses a forked version of ThreeJS (dev branch + unmerged PRs), to test & debug locally:
	//   - clone https://github.com/rebeckerspecialties/three.js
	//   - install the local package in this project (`npm i <path_cloned_threejs>`)
	//   - enable the flag below
	// Enable this to test ThreeJS locally.
	optimizeDeps: { include: ['three'] },
});
