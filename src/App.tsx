import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';
import React from 'react';
import './App.css';
import { ImmersiveStats } from './drawables';
import { Examples } from './examples';
import { TextSelectionProvider } from './providers';

const App: React.FC = () => {
	return (
		<TextSelectionProvider>
			<VRButton />
			<Canvas style={{ backgroundColor: 'gray' }}>
				<XR>
					<ambientLight />
					<pointLight position={[10, 10, 10]} />
					<Controllers />

					<Examples />

					<PerspectiveCamera makeDefault>
						<ImmersiveStats />
					</PerspectiveCamera>
				</XR>
			</Canvas>
		</TextSelectionProvider>
	);
};

export default App;
