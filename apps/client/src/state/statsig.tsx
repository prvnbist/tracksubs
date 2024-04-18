'use client'

import { PropsWithChildren } from 'react'
import { StatsigProvider } from 'statsig-react'

const StatsigWrapper = ({ children }: PropsWithChildren) => {
	return (
		<StatsigProvider
			waitForInitialization={true}
			sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
			user={{ userID: process.env.NEXT_PUBLIC_STATSIG_USER_ID }}
			options={{
				environment: {
					tier: process.env.NODE_ENV === 'development' ? 'development' : 'production',
				},
			}}
		>
			{children}
		</StatsigProvider>
	)
}

export default StatsigWrapper
