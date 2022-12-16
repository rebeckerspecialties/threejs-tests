import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
	// TODO: We have to make sure that payments do not get affected by this. (Cross-Origin Isolation)
	plugins: [react(), crossOriginIsolation(), basicSsl()],
});
