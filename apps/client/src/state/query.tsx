'use client'

import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	})
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
	if (typeof window === 'undefined') {
		return makeQueryClient()
	}

	if (!browserQueryClient) browserQueryClient = makeQueryClient()
	return browserQueryClient
}

export default function QueryProvider(props: PropsWithChildren) {
	const queryClient = getQueryClient()

	return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}
