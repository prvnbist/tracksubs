'use client'
import { useEffect, useState } from 'react'

import { modals } from '@mantine/modals'
import { Button, Center, Loader, Title } from '@mantine/core'

import { useGlobal } from 'state/global'
import { subscriptions_list } from 'actions'
import { CreateEmptyState } from 'components'

import { Create } from './components'

interface Subscription {
	id: string
	title: string
	website: string
	amount: number
	currency: string
	interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
	user_id: string
	next_billing_date: string
	payment_method_id: string
}

export default function Page(): JSX.Element {
	const { user } = useGlobal()

	const [status, setStatus] = useState('LOADING')

	const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

	useEffect(() => {
		if (user.id) {
			;(async () => {
				try {
					setStatus('LOADING')
					const result = await subscriptions_list(user.id!)

					if (result.status === 'ERROR') {
						// handle error
					}

					if (result.data.length === 0) {
						setSubscriptions([])

						setStatus('EMPTY')
						return
					}

					setSubscriptions(result.data)
					setStatus('SUCCESS')
				} catch (error) {
					setStatus('ERROR')
				}
			})()
		}
	}, [user])

	const create = () => {
		modals.open({
			title: 'Create Subscription',
			children: <Create />,
		})
	}

	return (
		<main>
			<Title order={2} mt="md" mb="md">
				Subscriptions
			</Title>
			{status === 'LOADING' && (
				<Center>
					<Loader />
				</Center>
			)}
			{status === 'EMPTY' && (
				<CreateEmptyState
					title="Create a subscription"
					description="You don't have any subscriptions yet, let's start by creating one!"
				>
					<Button onClick={create}>Create Subscription</Button>
				</CreateEmptyState>
			)}
			{status === 'SUCCESS' && <div>{subscriptions.length}</div>}
		</main>
	)
}
