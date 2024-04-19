'use client'
import Link from 'next/link'

import { useUser } from '@clerk/nextjs'
import { useGate } from 'statsig-react'
import { Badge, Button, Center, Flex, Space, Text, Title } from '@mantine/core'

import Logo from 'assets/svgs/logo'

import classes from './page.module.css'

export default function Page(): JSX.Element {
	const { isLoaded, isSignedIn } = useUser()
	const { value: is_signup_allowed } = useGate('is_signup_allowed')
	return (
		<Flex component="header" align="center" h="100dvh" className={classes.header}>
			{!is_signup_allowed && (
				<Badge variant="light" color="pink" className={classes.coming_soon}>
					Coming Soon
				</Badge>
			)}
			<Flex direction="column" align="center" justify="center" w="100%">
				<Logo size={120} />
				<Space h={8} />
				<Title>Track Subs</Title>
				<Space h={8} />
				<Text ta="center" size="18px" px={16} w={380} style={{ lineHeight: '24px' }}>
					Streamline your finances and stay on top of recurring expenses effortlessly.
				</Text>
				<Space h={16} />
				{is_signup_allowed && isLoaded ? (
					isSignedIn ? (
						<Link href="/dashboard">
							<Button>Go to dashboard</Button>
						</Link>
					) : (
						<Link href="/login">
							<Button>Get Started</Button>
						</Link>
					)
				) : null}
			</Flex>
		</Flex>
	)
}
