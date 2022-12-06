import { FLOOR_SIZE } from '@/drawables/utils/utils';
import React from 'react';

export const Floor: React.FC = () => {
	return <gridHelper position={[0, 0, 0]} args={[FLOOR_SIZE, FLOOR_SIZE]} />;
};
