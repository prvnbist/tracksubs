/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async knex => {
	await knex('service').del()
	await knex('service').insert([
		{
			key: 'amazon_prime',
			title: 'Amazon Prime',
			website: 'https://www.primevideo.com',
		},
		{
			key: 'disney_plus',
			title: 'Disney Plus',
			website: 'https://www.disneyplus.com',
		},
		{
			key: 'hbo_max',
			title: 'HBO Max',
			website: 'https://www.max.com',
		},
		{ key: 'hulu', title: 'Hulu', website: 'https://www.hulu.com' },
		{
			key: 'netflix',
			title: 'Netflix',
			website: 'https://netflix.com',
		},
	])
}
