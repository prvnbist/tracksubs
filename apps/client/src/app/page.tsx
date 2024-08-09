'use client'
import Link from 'next/link'
import Image from 'next/image'

import { useUser } from '@clerk/nextjs'
import {
	Anchor,
	Button,
	Container,
	Flex,
	Group,
	Space,
	Stack,
	Text,
	Title,
	useComputedColorScheme,
} from '@mantine/core'

import { track } from 'utils'
import Logo from 'assets/svgs/logo'

import classes from './page.module.css'

export default function Page(): JSX.Element {
	const { isLoaded, isSignedIn } = useUser()

	const scheme = useComputedColorScheme()

	return (
		<main>
			<Flex component="header" align="center" h="90dvh" className={classes.header}>
				<Flex direction="column" align="center" justify="center" w="100%">
					<Logo size={120} />
					<Space h={8} />
					<Title>Track Subs</Title>
					<Space h={8} />
					<Text ta="center" size="18px" className={classes.tagline}>
						Streamline your finances and stay on top of recurring expenses effortlessly.
					</Text>
					<Space h={16} />
					{isLoaded ? (
						<Group gap={16}>
							{isSignedIn ? (
								<Link href="/dashboard" onClick={() => track('btn-dashboard')}>
									<Button>Go to dashboard</Button>
								</Link>
							) : (
								<Link href="/login" onClick={() => track('btn-login')}>
									<Button>Get Started</Button>
								</Link>
							)}
						</Group>
					) : null}
				</Flex>
			</Flex>
			<Flex
				align="center"
				component="section"
				className={classes.fold_1_wrapper}
				bg={scheme === 'light' ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-dark-6)'}
			>
				<Container w="100%" className={classes.fold_1_content}>
					<div>
						<div
							style={{
								backgroundColor:
									scheme === 'light'
										? 'var(--mantine-color-gray-4)'
										: 'var(--mantine-color-dark-7)',
							}}
						>
							<Stack gap={4}>
								<Image
									src="/images/hulu_card.svg"
									width="260"
									height="60"
									alt="hulu_card"
								/>
								<Image
									src="/images/netflix_card.svg"
									width="260"
									height="60"
									alt="netflix_card"
								/>
								<Image
									src="/images/disney_plus_card.svg"
									width="260"
									height="60"
									alt="disney_plus_card"
								/>
							</Stack>
						</div>
					</div>
					<div>
						<Title order={2} textWrap="balance">
							Stay on Top of Your Subscriptions
						</Title>
						<Space h={16} />
						<Text size="lg">
							Easily track subscriptions, no more spreadsheets or forgetting payments with
							our intuitive system.
						</Text>
					</div>
				</Container>
			</Flex>
			<Group py={16} gap={16} justify="center">
				<Anchor
					c={scheme === 'light' ? 'gray.8' : 'white'}
					target="_blank"
					component={Link}
					underline="hover"
					rel="noreferrer noopener"
					onClick={() => track('btn-github')}
					href="https://github.com/prvnbist/tracksubs"
				>
					Github
				</Anchor>
				<Anchor
					c={scheme === 'light' ? 'gray.8' : 'white'}
					component={Link}
					href="/changelog"
					underline="hover"
				>
					Changelog
				</Anchor>
				<Anchor
					c={scheme === 'light' ? 'gray.8' : 'white'}
					component={Link}
					href="/privacy"
					underline="hover"
				>
					Privacy
				</Anchor>
				<Anchor
					c={scheme === 'light' ? 'gray.8' : 'white'}
					component={Link}
					href="/terms-of-service"
					underline="hover"
				>
					Terms of Service
				</Anchor>
			</Group>
		</main>
	)
}
