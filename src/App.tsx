import { PerspectiveCamera, Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';
import React from 'react';
import { Object3D } from 'three';
import './App.css';
import { Floor, ImmersiveStats, SampleBoxes } from './drawables';

const App: React.FC = () => {
	const object3D = new Object3D();
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

					<SampleBoxes count={10000} object3D={object3D} />

					<PerspectiveCamera makeDefault>
						<ImmersiveStats />
					</PerspectiveCamera>
				</XR>
			</Canvas>
		</>
	);
};

export default App;
