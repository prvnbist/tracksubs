/** @type {import('next').NextConfig} */
module.exports = {
	experimental: {
		serverComponentsExternalPackages: ['knex'],
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
