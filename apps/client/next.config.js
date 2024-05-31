/** @type {import('next').NextConfig} */
module.exports = {
	experimental: {
		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
	},
	async rewrites() {
		return [
			{
				source: '/script',
				destination: 'https://analytics.prvnbist.com/script.js',
			},
		]
	},
}
