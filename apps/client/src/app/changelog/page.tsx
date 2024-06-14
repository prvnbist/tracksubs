import Link from 'next/link'
import type { Metadata } from 'next'
import { IconArrowLeft } from '@tabler/icons-react'

import { Container, Button, Space, Title } from '@mantine/core'

export const metadata: Metadata = {
	title: 'Changelog | TrackSubs',
}

export default function Page() {
	return (
		<Container py={120}>
			<Link href="/">
				<Button variant="outline" color="dark.2" leftSection={<IconArrowLeft size={18} />}>
					Home
				</Button>
			</Link>
			<Space h={32} />
			<Title order={2}>Changelog</Title>
			<Space h={24} />
			<Title order={4}>May 19, 2024</Title>
			<ul>
				<li>Dashboard: Subscriptions Count Card</li>
				<li>Dashboard: Renewing This Week/Month Card</li>
			</ul>
			<Space h={24} />
			<Title order={4}>May 17, 2024</Title>
			<ul>
				<li>Auto Light/Dark Theme</li>
			</ul>
			<Space h={24} />
			<Title order={4}>May 16, 2024</Title>
			<ul>
				<li>Dashboard Analytics: Monthly Overview</li>
			</ul>
			<Space h={24} />
			<Title order={4}>May 14, 2024</Title>
			<ul>
				<li>Export Subscriptions</li>
			</ul>
			<Space h={24} />
			<Title order={4}>May 13, 2024</Title>
			<ul>
				<li>Edit Subscription</li>
			</ul>
			<Space h={24} />
			<Title order={4}>May 3, 2024</Title>
			<ul>
				<li>
					<Link href="https://trigger.dev/" target="_blank" rel="noreferrer noopener">
						Trigger.dev Integration
					</Link>
				</li>
				<li>Email Alerts</li>
				<li>User Plan</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 29, 2024</Title>
			<ul>
				<li>Usage stats in settings</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 28, 2024</Title>
			<ul>
				<li>
					<Link href="https://resend.com" target="_blank" rel="noreferrer noopener">
						Resend Integration
					</Link>
				</li>
				<li>Welcome email on new user signup</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 25, 2024</Title>
			<ul>
				<li>Transactions Page</li>
				<li>Mark subscription past due date as paid via creating a transaction</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 23, 2024</Title>
			<ul>
				<li>Payment methods settings</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 22, 2024</Title>
			<ul>
				<li>Profile Settings</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 19, 2024</Title>
			<ul>
				<li>
					<Link
						target="_blank"
						rel="noreferrer noopener"
						href="https://marketingplatform.google.com/about/analytics"
					>
						Added google analytics
					</Link>
				</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 18, 2024</Title>
			<ul>
				<li>
					<Link href="https://statsig.com" target="_blank" rel="noreferrer noopener">
						Statsig integration
					</Link>
				</li>
				<li>Added privacy policy and terms of service pages</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 17, 2024</Title>
			<ul>
				<li>Onboarding screen</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 16, 2024</Title>
			<ul>
				<li>Filter subscriptions by renew cycle</li>
				<li>
					Added analytics for
					<ul>
						<li>Subscriptions renewing in the current week</li>
						<li>Top five most expensive subscriptions grouped by currency</li>
					</ul>
				</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 10, 2024</Title>
			<ul>
				<li>Delete subscription</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Apr 8, 2024</Title>
			<ul>
				<li>Added subscriptions</li>
			</ul>
			<Space h={24} />
			<Title order={4}>Mar 29, 2024</Title>
			<ul>
				<li>
					<Link href="https://clerk.com" target="_blank" rel="noreferrer noopener">
						Clerk auth integration
					</Link>
				</li>
				<li>First Commit</li>
			</ul>
		</Container>
	)
}
