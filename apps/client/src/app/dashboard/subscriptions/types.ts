import type { ComboboxItem } from '@mantine/core'

import type { IMinimalUser } from 'types'

export type CustomComboboxItem = ComboboxItem & { user?: IMinimalUser }

export type IShare = {
	id: string
	amount: number
	percentage: string
	user: IMinimalUser
}