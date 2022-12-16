import { useEffect, useRef, useState } from 'react';
import { formatBytes } from '../../formats';
import { defined } from '../../utils';

// Computes a random interval in milliseconds such that on average there is one measurement every five minutes
function measurementInterval() {
	const MEAN_INTERVAL_IN_MS = 5 * 60 * 1000;
	return -Math.log(Math.random()) * MEAN_INTERVAL_IN_MS;
}

function getMemoryUsageLegacyAPI(): number | null {
	// @ts-ignore - performance.memory is not in the TypeScript definition file.
	if (!performance.memory) {
		return null;
	}
	// @ts-ignore  - performance.memory is not in the TypeScript definition file.
	const memory = performance.memory;

	return memory.usedJSHeapSize;
}

function scheduleMeasurement() {
	const interval = measurementInterval();

	const timeoutId = setTimeout(performMeasurement, interval);
	return timeoutId;
}

type MemoryUsageBytes = {
	result: number;
	legacyResult: boolean;
} | null;

async function performMeasurement(): Promise<MemoryUsageBytes | null> {
	let memoryUsageBytes: MemoryUsageBytes = null;

	// Check measurement API is available.
	// @ts-ignore - performance.measureUserAgentSpecificMemory is not in the TypeScript definition file.
	if (!window.crossOriginIsolated || !performance.measureUserAgentSpecificMemory) {
		// If not, fall back to performance.memory.
		const result = getMemoryUsageLegacyAPI();

		if (defined(result)) {
			memoryUsageBytes = {
				result,
				legacyResult: true,
			};
		}
	} else {
		try {
			// Invoke performance.measureUserAgentSpecificMemory().
			// @ts-ignore - performance.measureUserAgentSpecificMemory is not in the TypeScript definition file.
			const result = await performance.measureUserAgentSpecificMemory();

			if (defined(result)) {
				memoryUsageBytes = {
					result: result.bytes,
					legacyResult: false,
				};
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'SecurityError') {
				console.log('The context is not secure.');
				return null;
			}
			// Rethrow other errors.
			throw error;
		}
	}

	// Return the result.
	return memoryUsageBytes;
}

function useGetMemoryStats() {
	const [measuredMemory, setMeasuredMemory] = useState<MemoryUsageBytes | null>();
	const [loading, setLoading] = useState<boolean | null>(null);
	const timeoutId = useRef<number | null>(null);

	useEffect(() => {
		const getMemoryMeasurement = async () => {
			try {
                setLoading(true);
				const measurement = await performMeasurement();

				setMeasuredMemory(measurement);

				timeoutId.current = scheduleMeasurement();
			} catch (err) {
				console.error(err);
			} finally {
                setLoading(false);
            }
		};

		getMemoryMeasurement();

		return () => {
			if (timeoutId.current) {
				clearTimeout(timeoutId.current);
			}
		};
	}, []);

	return {
		measuredMemory,
		loading,
	};
}

export default useGetMemoryStats;
