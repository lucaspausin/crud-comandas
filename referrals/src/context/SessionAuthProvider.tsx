"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
	children: React.ReactNode;
}

const SessionAuthProvider = ({ children }: Props) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
			{children}
		</SessionProvider>
	);
};

export default SessionAuthProvider;
