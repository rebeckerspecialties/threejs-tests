import { useState, useEffect } from 'react';

export function useMounted(extraCondition: boolean = true) {
	const [isMounted, setMounted] = useState(false);

	useEffect(() => {
		if (extraCondition) {
			setMounted(true);
		}

		return () => {
			setMounted(false);
		};
	}, [extraCondition]);

	return isMounted;
}
