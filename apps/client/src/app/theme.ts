import { Inter, Unbounded } from 'next/font/google'

import { MantineThemeOverride, createTheme } from '@mantine/core'

const inter = Inter({ subsets: ['latin'] })
const unbounded = Unbounded({ subsets: ['latin'] })

const theme: MantineThemeOverride = createTheme({
	primaryShade: 4,
	autoContrast: true,
	primaryColor: 'yellow',
	fontFamily: inter.style.fontFamily,
	headings: {
		fontWeight: '400',
		fontFamily: unbounded.style.fontFamily,
	},
})

export default theme
