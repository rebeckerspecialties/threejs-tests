import React from 'react';

export const Floor: React.FC = () => {
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[40, 40]} />
			<meshStandardMaterial color="#666" />
		</mesh>
	);
};
