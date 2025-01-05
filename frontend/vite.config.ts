import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [sveltekit(), enhancedImages()],
	server: {
		port: 1420,
		strictPort: true,
		hmr: {
			protocol: 'ws',
			port: 1421
		}
	},
	preview: {
		port: 1420
	}
});
