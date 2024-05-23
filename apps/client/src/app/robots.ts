import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/privacy', '/terms-of-service'],
			disallow: '/dashboard/',
		},
		sitemap: 'https://tracksubs.co/sitemap.xml',
	}
}
