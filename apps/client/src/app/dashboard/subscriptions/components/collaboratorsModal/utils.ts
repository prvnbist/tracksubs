import type { ISelectedCollaborator } from '.'

export const calculateLeftBalance = (amount: number, collaborators: ISelectedCollaborator[]) =>
	amount - collaborators.reduce((acc, curr) => acc + curr.amount, 0)
