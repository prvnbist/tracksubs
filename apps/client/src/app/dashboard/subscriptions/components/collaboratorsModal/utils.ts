import type { ISelectedCollaborator } from '.'

export const calculateShare = (
	user_id: string,
	amount: number,
	count: number,
	isPercentage: boolean
) => {
	return {
		user_id,
		amount: isPercentage ? 0 : Number(amount / count),
		percentage: isPercentage ? 100 / count : 0,
		percentageAmount: isPercentage
			? String((amount * Number(100 / count)) / 100).replace(/(\.\d{2})\d*/, '$1')
			: '0.00',
	}
}

export const calculateLeftBalance = (
	amount: number,
	collaborators: ISelectedCollaborator[],
	splitStrategy: string
) =>
	amount -
	collaborators.reduce(
		(acc, curr) =>
			acc + (splitStrategy === 'PERCENTAGE' ? amount * (curr.percentage / 100) : curr.amount),
		0
	)
