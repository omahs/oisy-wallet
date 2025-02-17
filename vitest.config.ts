import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(
	(): UserConfig => ({
		plugins: [sveltekit()],
		resolve: {
			alias: [
				{
					find: '$lib',
					replacement: resolve(__dirname, 'src/frontend/src/lib')
				},
				{
					find: '$routes',
					replacement: resolve(__dirname, 'src/frontend/src/routes')
				},
				{
					find: '$eth',
					replacement: resolve(__dirname, 'src/frontend/src/eth')
				},
				{
					find: '$icp',
					replacement: resolve(__dirname, 'src/frontend/src/icp')
				},
				{
					find: '$icp-eth',
					replacement: resolve(__dirname, 'src/frontend/src/icp-eth')
				},
				{
					find: '$tests',
					replacement: resolve(__dirname, 'src/frontend/src/tests')
				},
				{
					find: '$airdrop',
					replacement: resolve(__dirname, 'src/frontend/src/airdrop')
				}
			]
		},
		test: {
			globals: true,
			watch: false,
			silent: true
		}
	})
);
