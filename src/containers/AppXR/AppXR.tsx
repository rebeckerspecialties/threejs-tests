import { ImmersiveStats, PlayerNavigation } from '@/drawables';
import { Examples } from '@/examples';
import { TextSelectionProvider } from '@/providers';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Controllers, VRButton, XR } from '@react-three/xr';

const AppXR: React.FC = () => {
	return (
		<TextSelectionProvider>
			<VRButton />
			<Canvas style={{ backgroundColor: 'gray', height: 'calc(100% - 55px)' }}>
				<XR>
					<ambientLight />
					<pointLight position={[10, 10, 10]} />
					<Controllers />

					<Examples />

					<PerspectiveCamera makeDefault position={[0, 1, 0]}>
						<ImmersiveStats />
					</PerspectiveCamera>

					<PlayerNavigation />
				</XR>
			</Canvas>
		</TextSelectionProvider>
	);
};

export default AppXR;
