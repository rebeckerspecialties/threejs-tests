import { PerformanceMonitor, Sky, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';
import React from 'react';
import { Object3D } from 'three';
import './App.css';
import { Floor, SampleBoxes } from './drawables';

const App: React.FC = () => {
	const object3D = new Object3D();
	return (
		<>
			<VRButton />
			<Canvas>
				<PerformanceMonitor>
					<XR>
						<Stats />
						<Sky sunPosition={[0, 1, 0]} />
						<Floor />
						<ambientLight />
						<pointLight position={[10, 10, 10]} />
						<Controllers />

						<SampleBoxes count={50000} object3D={object3D} />
					</XR>
				</PerformanceMonitor>
			</Canvas>
		</>
	);
};

export default App;
