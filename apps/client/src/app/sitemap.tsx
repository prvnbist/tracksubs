import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.tracksubs.co'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 1,
		},
		{
			url: `${BASE_URL}/login`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/terms-of-service`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
	]
}
