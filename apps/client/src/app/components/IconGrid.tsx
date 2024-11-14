import { useMemo } from 'react'
import SVG from 'react-inlinesvg'
import { motion } from 'motion/react'

import { useMediaQuery } from '@mantine/hooks'
import { Box, Flex, getGradient, Group, useMantineTheme } from '@mantine/core'

type LineProps = {
	orientation?: 'horizontal' | 'vertical'
	cols?: number
	rows?: number
	top?: number
	left?: number
	delay?: number
	isReversed?: boolean
}

const Line = (props: LineProps) => {
	const {
		left = 0,
		top = 0,
		delay = 0,
		cols = 6,
		rows = 6,
		isReversed = false,
		orientation = 'horizontal',
	} = props

	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const cellSize = isMobile ? 28 : 64

	const theme = useMantineTheme()
	const isVertical = orientation === 'vertical'
	const bg = getGradient(
		{
			deg: isVertical ? 180 : 0,
			...(isReversed ? { from: 'dark.7', to: 'dark.3' } : { from: 'dark.3', to: 'dark.7' }),
		},
		theme
	)
	return (
		<Box
			bg={bg}
			pos="absolute"
			top={cellSize * top}
			left={cellSize * left}
			component={motion.div}
			style={{ ...(isReversed && { right: 0 }) }}
			{...(isVertical ? { w: 1 } : { h: 1 })}
			transition={{ delay, duration: 0.8, ease: 'linear' }}
			initial={{
				...(isVertical ? { height: 0 } : { width: 0 }),
			}}
			animate={{
				...(isVertical ? { height: cellSize * rows } : { width: cellSize * cols }),
			}}
		/>
	)
}

const Cell = ({
	logo,
	cellSize = 64,
	iconSize = 18,
}: { logo: string | number; cellSize?: number; iconSize?: number }) => {
	return (
		<motion.div
			animate={{
				opacity: [0, 0.8],
			}}
			transition={{
				duration: 1,
				ease: 'linear',
			}}
		>
			<Flex
				h={cellSize}
				w={cellSize}
				component={Box}
				opacity={0.3}
				align="center"
				justify="center"
			>
				{!!logo && <SVG src={`/icons/${logo}`} width={iconSize} height={iconSize} />}
			</Flex>
		</motion.div>
	)
}

const L_ROW_1 = [
	'1password-light.svg',
	'adobe.svg',
	'airbnb.svg',
	0,
	'apple.svg',
	'arc_browser.svg',
]
const L_ROW_2 = ['asana-logo.svg', 0, 'auth0.svg', 'authy.svg']
const L_ROW_3 = ['aws.svg', 'azure.svg', 'binance.svg']
const L_ROW_4 = ['canva.svg']
const L_ROW_5 = ['claude-ai-icon.svg', 'cloudflare.svg']
const L_ROW_6 = ['coinbase.svg']

const R_ROW_1 = ['copilot.svg', 'datadog.svg', 'digitalocean.svg', 0, 'framer.svg', 'figma.svg']
const R_ROW_2 = ['github-light.svg', 0, 'heroku.svg', 'hulu.svg']
const R_ROW_3 = ['linear.svg', 'linkedin.svg', 'loom.svg']
const R_ROW_4 = ['netflix.svg']
const R_ROW_5 = ['openai.svg', 'patreon.svg']
const R_ROW_6 = ['spotify.svg']

const Left = ({
	renderRow,
}: { renderRow: (logos: Array<string | number>) => Array<JSX.Element> }) => {
	return (
		<Flex direction="column">
			<Flex pos="relative">{renderRow(L_ROW_1)}</Flex>
			<Flex pos="relative">
				<Line />
				<Line orientation="vertical" left={1} top={-1} />
				{renderRow(L_ROW_2)}
			</Flex>
			<Flex pos="relative">
				<Line cols={4} />
				<Line rows={3} left={2} top={-2} orientation="vertical" />
				{renderRow(L_ROW_3)}
			</Flex>
			<Flex pos="relative">
				<Line cols={3} />
				<Line orientation="vertical" rows={3} left={3} top={-3} />
				{renderRow(L_ROW_4)}
			</Flex>
			<Flex pos="relative">
				<Line cols={2} />
				<Line orientation="vertical" rows={2} left={4} top={-4} />
				{renderRow(L_ROW_5)}
			</Flex>
			<Flex pos="relative">
				<Line cols={2} />
				<Line orientation="vertical" rows={1} left={5} top={-5} />
				<Line orientation="vertical" rows={1} left={6} top={-5} />
				{renderRow(L_ROW_6)}
			</Flex>
		</Flex>
	)
}

const Right = ({
	renderRow,
}: { renderRow: (logos: Array<string | number>) => Array<JSX.Element> }) => {
	return (
		<Flex direction="column" dir="rtl">
			<Flex pos="relative">{renderRow(R_ROW_1)}</Flex>
			<Flex pos="relative">
				<Line isReversed left={0} />
				<Line orientation="vertical" left={5} top={-1} />
				{renderRow(R_ROW_2)}
			</Flex>
			<Flex pos="relative">
				<Line isReversed cols={4} left={2} />
				<Line rows={3} left={4} top={-2} orientation="vertical" />
				{renderRow(R_ROW_3)}
			</Flex>
			<Flex pos="relative">
				<Line isReversed cols={3} left={3} />
				<Line orientation="vertical" rows={3} left={3} top={-3} />
				{renderRow(R_ROW_4)}
			</Flex>
			<Flex pos="relative">
				<Line isReversed cols={2} left={4} />
				<Line orientation="vertical" rows={2} left={2} top={-4} />
				{renderRow(R_ROW_5)}
			</Flex>
			<Flex pos="relative">
				<Line isReversed cols={2} left={4} />
				<Line orientation="vertical" rows={1} left={1} top={-5} />
				<Line orientation="vertical" rows={1} left={0} top={-5} />
				{renderRow(R_ROW_6)}
			</Flex>
		</Flex>
	)
}

export default function IconGrid() {
	const isMobile = useMediaQuery('(max-width: 56.25em)')

	const cellSize = isMobile ? 28 : 64
	const iconSize = isMobile ? 12 : 18

	const renderRow = useMemo(
		() => (logos: Array<string | number>) =>
			logos.map(logo => <Cell key={logo} logo={logo} cellSize={cellSize} iconSize={iconSize} />),
		[cellSize, iconSize]
	)
	return (
		<Group justify="space-between" w="100%" top={0} pos="absolute">
			<Left renderRow={renderRow} />
			<Right renderRow={renderRow} />
		</Group>
	)
}
