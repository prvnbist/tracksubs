'use client'
import Link from 'next/link'

import { useUser } from '@clerk/nextjs'
import { Button, Flex, Space, Text, Title } from '@mantine/core'

import Logo from '@/assets/svgs/logo'

import classes from './page.module.css'

export default function Page(): JSX.Element {
	const { isLoaded, isSignedIn } = useUser()
	return (
		<main>
			<Flex component="header" align="center" h="100dvh" className={classes.header}>
				<Flex direction="column" align="center" justify="center" w="100%">
					<Logo size={120} />
					<Space h={8} />
					<Title>MySubs</Title>
					<Space h={8} />
					<Text ta="center" size="18px" w={320} style={{ lineHeight: '24px' }}>
						Manage subscriptions hassle-free. Track, organize, and save with ease.
					</Text>
					<Space h={16} />
					{isLoaded ? (
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
		</main>
	)
}
