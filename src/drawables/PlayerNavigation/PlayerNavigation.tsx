import { defined, FLOOR_SIZE } from '@/drawables/utils/utils';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import React, { useRef } from 'react';

// Extract this to a util file if used in another place
function toVelocityValue(axisValue: number): number {
	const absValue = Math.abs(axisValue);
	// Fine-tuning the speed - using just the axisValue bring a bad experience
	if (absValue <= 0.15) {
		return 0;
	} else if (absValue <= 0.5) {
		return (absValue / 5) * (axisValue < 0 ? -1 : 1);
	} else if (absValue <= 0.8) {
		return (absValue / 7) * (axisValue < 0 ? -1 : 1);
	} else {
		return (absValue / 10) * (axisValue < 0 ? -1 : 1);
	}
}

interface PlayerNavigationControllerState {
	buttonPressed: boolean;
	position: { x: number; y: number; z: number };
}

export const PlayerNavigation: React.FC = () => {
	const { player, session, controllers } = useXR();
	const controllersStateRef = useRef<{ [id: number]: PlayerNavigationControllerState }>({});

	useFrame(() => {
		if (!defined(session?.inputSources) || !defined(player?.position) || !defined(controllers)) {
			return;
		}

		for (let i = 0; i < controllers.length; i++) {
			// Navigate using controller stick (Oculus Quest) or touchpad (Oculus Go)
			const [touchX = 0, touchY = 0, thumbX = 0, thumbY = 0] =
				controllers[i]?.inputSource?.gamepad?.axes ?? [];
			if (touchX !== 0 || touchY !== 0 || thumbX !== 0 || thumbY !== 0) {
				const posX = toVelocityValue(touchX !== 0 ? touchX : thumbX);
				const posZ = toVelocityValue(touchY !== 0 ? touchY : thumbY); // Position Y in the controller translates to Z in space
				const { x, y, z } = player.position;
				const newX = x + posX >= -FLOOR_SIZE && x + posX <= FLOOR_SIZE ? x + posX : x; // Limit of walking area
				const newZ = z + posZ >= -FLOOR_SIZE && z + posZ <= FLOOR_SIZE ? z + posZ : z; // Limit of walking area
				player.position.set(newX, y, newZ);
			}

			// Navigate using climbing gesture (Oculus Quest)
			// button[1] should represent the squeeze button on Quest - see https://immersive-web.github.io/webxr-gamepads-module/#xr-standard-gamepad-mapping
			// Chrome WebXR extension detects buttons[0] as a squeeze button, change that when testing on browser
			if (controllers[i]?.inputSource?.gamepad?.buttons[1].pressed === true) {
				const {
					x: currX = 0,
					y: currY = 0,
					z: currZ = 0,
				} = controllers[i]?.children?.[0]?.position ?? {};

				// First frame setup
				if (!controllersStateRef.current[i]?.buttonPressed) {
					controllersStateRef.current[i] = {
						buttonPressed: true,
						position: { x: currX, y: currY, z: currZ },
					};
				}

				const { x: lastX = 0, z: lastZ = 0 } = controllersStateRef.current[i]?.position;

				if (currX !== lastX || currZ !== lastZ) {
					const { x, y, z } = player.position;
					const newX =
						x + lastX - currX >= -FLOOR_SIZE && x + lastX - currX <= FLOOR_SIZE
							? x + lastX - currX
							: x; // Limit of walking area
					const newZ =
						z + lastZ - currZ >= -FLOOR_SIZE && z + lastZ - currZ <= FLOOR_SIZE
							? z + lastZ - currZ
							: z; // Limit of walking area
					player.position.set(newX, y, newZ);
					controllersStateRef.current[i].position = { x: currX, y: currY, z: currZ };
				}
			}
			// Released the squeeze button
			// Chrome WebXR extension detects buttons[0] as a squeeze button, change that when testing on browser
			if (
				controllers[i]?.inputSource?.gamepad?.buttons[1].pressed === false &&
				controllersStateRef.current[i]?.buttonPressed
			) {
				controllersStateRef.current[i].buttonPressed = false;
			}
		}
	});

	return null;
};
