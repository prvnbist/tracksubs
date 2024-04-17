'use client'

import { IBM_Plex_Mono, Inter, Unbounded } from 'next/font/google'

import { MantineThemeOverride, Table, createTheme } from '@mantine/core'

const inter = Inter({ subsets: ['latin'] })
const unbounded = Unbounded({ subsets: ['latin'] })
const ibm_plex_mono = IBM_Plex_Mono({ weight: '500', subsets: ['latin'] })

const theme: MantineThemeOverride = createTheme({
	primaryShade: 4,
	autoContrast: true,
	primaryColor: 'yellow',
	fontFamily: inter.style.fontFamily,
	fontFamilyMonospace: ibm_plex_mono.style.fontFamily,
	headings: {
		fontWeight: '400',
		fontFamily: unbounded.style.fontFamily,
	},
	components: {
		Table: Table.extend({
			styles: {
				th: {
					paddingTop: '0px',
					paddingBottom: '0px',
					fontSize: '12px',
					fontWeight: '500',
					textTransform: 'uppercase',
					color: 'var(--mantine-color-dark-2)',
				},
				td: {
					paddingTop: '0px',
					paddingBottom: '0px',
				},
				tr: {
					height: '32px',
				},
			},
		}),
	},
})

export default theme
