import React from 'react';
import { Sky } from '@react-three/drei';
import { Canvas, Vector3 } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';
import './App.css';
import { Button, Floor } from './drawables';

const App: React.FC = () => {
	const cubePositions = [];

	for (let i = -1; i <= 1; i = i + 0.5) {
		for (let j = 0.5; j <= 2.5; j = j + 0.5) {
			for (let k = -1; k >= -3; k = k - 0.5) {
				cubePositions.push([i, j, k]);
			}
		}
	}
	return (
		<>
			<VRButton />
			<Canvas>
				<XR>
					<Sky sunPosition={[0, 1, 0]} />
					<Floor />
					<ambientLight />
					<pointLight position={[10, 10, 10]} />
					<Controllers />
					{cubePositions.map((position, idx) => (
						<Button key={idx} position={position as Vector3} size={[0.3, 0.3, 0.3]}>
							{`Cube${idx}`}
						</Button>
					))}
				</XR>
			</Canvas>
		</>
	);
};

export default App;
