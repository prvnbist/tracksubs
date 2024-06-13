import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

type LayoutProps = {
	children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
	if (auth().sessionClaims?.metadata.is_onboarded === true) {
		redirect('/dashboard')
	}

	return <>{children}</>
}
