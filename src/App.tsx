import { ImmersiveStats, PlayerNavigation } from '@/drawables';
import { Examples } from '@/examples';
import { TextSelectionProvider, ThemeProvider } from '@/providers';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';
import React from 'react';
import './App.css';

const App: React.FC = () => {
	return (
		<ThemeProvider>
			<TextSelectionProvider>
				<VRButton />
				<Canvas style={{ backgroundColor: 'gray' }}>
					<XR>
						<ambientLight />
						<pointLight position={[10, 10, 10]} />
						{/* <Floor /> */}
						<Controllers />

						<Examples />

						<PerspectiveCamera makeDefault position={[0, 1, 0]}>
							<ImmersiveStats />
						</PerspectiveCamera>

						<PlayerNavigation />
					</XR>
				</Canvas>
			</TextSelectionProvider>
		</ThemeProvider>
	);
};

export default App;
