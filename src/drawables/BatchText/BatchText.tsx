import { Block } from '@/drawables/InstancedBlocks/InstancedBlocks';
import { defaultTextMaterial } from '@/drawables/utils/materials';
import { defined } from '@/drawables/utils/utils';
import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import { Object3D } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { BatchedMesh } from 'three/examples/jsm/objects/BatchedMesh';

interface Props {
	blocks: Block[];
}

/**
 * Receives a list of blocks to render their texts
 */
export const BatchText: React.FC<Props> = ({ blocks }) => {
	const { scene } = useThree();
	const batchedMeshRef = useRef<any>(null); // `typeof BatchedMesh` makes this ref.current a read-only prop, forcing any

	useEffect(() => {
		const haveOneText = blocks.some(({ text = '' }) => text.length > 0);
		if (haveOneText && defined(scene)) {
			const fontLoader = new FontLoader();
			fontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => {
				const textGeos: TextGeometry[] = [];
				let totalTexts = 0;
				let totalVertices = 0;
				blocks.forEach(({ text = '' }) => {
					if (text.length > 0) {
						const geometry = new TextGeometry(text, { font, size: 0.08, height: 0 });
						totalVertices += geometry.attributes.position.count;
						totalTexts++;
						textGeos.push(geometry);
					}
				});
				batchedMeshRef.current = new BatchedMesh(
					totalTexts,
					totalVertices,
					undefined,
					defaultTextMaterial,
				);
				const object3D = new Object3D();
				let lastRotation = 0;
				let textIdx = 0;
				for (let i = 0; i < blocks.length; i++) {
					const { position = { x: 0, y: 0, z: 0 }, text = '', rotationY = 0 } = blocks[i];

					if (text.length === 0) {
						continue;
					}

					const idx = batchedMeshRef.current.applyGeometry(textGeos[textIdx]); // idx needs to be stored in case you need to update
					textIdx++; // textGeos stores geometries that only contain text

					object3D.position.set(position.x, position.y, position.z);
					object3D.rotateY(rotationY - lastRotation);
					lastRotation = rotationY;
					object3D.updateMatrix();
					batchedMeshRef.current.setMatrixAt(idx, object3D.matrix);
				}
				batchedMeshRef.current.position.set(0, 0.2, -5);
				scene.add(batchedMeshRef.current);
			});
		}

		return function cleanup() {
			if (defined(batchedMeshRef.current)) {
				scene.remove(batchedMeshRef.current);
				batchedMeshRef.current.dispose();
			}
		};
	}, [blocks, scene]);

	return null;
};
