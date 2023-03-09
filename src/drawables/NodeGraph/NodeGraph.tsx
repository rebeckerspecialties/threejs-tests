import { HighlightedText } from '@/drawables/HighlightedText/HighlightedText';
import { Block } from '@/drawables/InstancedBlocks/InstancedBlocks';
import { getBlockScaleFromText, getCharSizeFromFontSize } from '@/drawables/utils/block';
import { defaultBlockColor, mixColors, textBgColorsEntity } from '@/drawables/utils/colors';
import {
	defaultGraphBlockDepth,
	defaultGraphBlockGeometry,
	defaultGraphBlockSize,
} from '@/drawables/utils/geometries';
import { useMounted } from '@/drawables/utils/useMounted';
import { defined, getWordIndexesFromText } from '@/drawables/utils/utils';
import { useTextSelectionContext } from '@/providers';
import { TextSelections } from '@/providers/TextSelectionProvider/TextSelectionProvider';
import { useFrame, useThree } from '@react-three/fiber';
import React, { createRef, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { Color, Group, InstancedMesh, Object3D, Quaternion, Vector3 } from 'three';
import ThreeForceGraph from 'three-forcegraph';
import { defaultGraphBlockMaterial } from '../utils/materials';
import useDrag from './useDrag';
import { genTree } from './utils';

export interface GraphBlock extends Block {
	/**
	 * Source and target are used to create links between nodes.
	 * Source is the id of the node
	 */
	source: number;
	/**
	 * Source and target are used to create links between nodes.
	 * Target is the id of the node that is the target of the link
	 */
	target?: number;
}

interface Props {
	blocks: GraphBlock[];
}

const SCALE_MODIFIER = 0.1;
const GRAPH_FONT_SIZE = 0.5;
const { width: charWidth, height: charHeight } = getCharSizeFromFontSize(GRAPH_FONT_SIZE);

function getScaleAndColorMod(
	text: string,
	textSelections: TextSelections,
): { scaleMod: number; blockColor: Color } {
	const selectedTexts = Object.keys(textSelections);

	const wordIndexes = getWordIndexesFromText(text, selectedTexts);
	if (selectedTexts.length !== 0 && wordIndexes.length !== 0) {
		const colors = selectedTexts
			.filter(
				(selectedText) => wordIndexes.findIndex((wordI) => wordI.text === selectedText) !== -1,
			)
			.map((selectedText) => textBgColorsEntity[textSelections[selectedText].hexColor]);
		const blockColor =
			colors.length === 3
				? mixColors(colors.concat(new Color(3, 3, 3))) // force highlight if it contains all 3 selected texts
				: mixColors(colors.concat(new Color(0.5, 0.5, 0.5)));

		return {
			scaleMod: SCALE_MODIFIER,
			blockColor,
		};
	}
	return {
		scaleMod: 0,
		blockColor: defaultBlockColor,
	};
}

export const NodeGraph: React.FC<Props> = ({ blocks }) => {
	const { scene } = useThree();
	const { textSelections } = useTextSelectionContext();
	const graphRef = useRef<ThreeForceGraph>();
	const nodeMeshRef = useRef<InstancedMesh>(null);
	const textPositionRefs: Array<RefObject<Group>> = blocks.map(() => createRef());
	const isMounted = useMounted();

	const instancesBeingDragged = useDrag({
		graph: graphRef,
		nodeMesh: nodeMeshRef,
		blocks,
	});

	const getZTranslation = useCallback(
		({
			size = defaultGraphBlockSize,
			text = '',
			scale = { width: 1, height: 1, depth: 1 },
		}: {
			size: number;
			text: string;
			scale: { width: number; height: number; depth: number };
		}) => {
			const selectedTexts = Object.keys(textSelections);

			if (
				selectedTexts.length !== 0 &&
				getWordIndexesFromText(text, selectedTexts, {
					findOne: true,
				}).length !== 0
			) {
				return (size * (scale.depth + SCALE_MODIFIER)) / 2 + 0.011;
			} else {
				return (size * scale.depth) / 2 + 0.011;
			}
		},
		[textSelections],
	);

	// update the node position
	const updateNodePosition = useCallback(
		(graph: ThreeForceGraph) => {
			if (!defined(graph)) {
				return;
			}

			graph.nodePositionUpdate((object: InstancedMesh, coords, node) => {
				if (defined(node.id)) {
					// update node fixed positions
					node.fx = coords.x;
					node.fy = coords.y;
					node.fz = coords.z;

					// get the instance id by the node id which is the source of the block
					const instanceId = blocks.findIndex((block) => block.source === node.id);

					// get matrix
					object.getMatrixAt(instanceId, object.matrix);

					// update position of the matrix
					object.matrix.setPosition(coords.x, coords.y ?? 0, coords.z ?? 0);

					// update instance matrix
					object.setMatrixAt(instanceId, object.matrix);
					object.instanceMatrix.needsUpdate = true;

					if (defined(textPositionRefs[instanceId]?.current)) {
						// update position of texts instances
						const { text = '', scale = { width: 1, height: 1, depth: 1 } } = blocks[instanceId];
						textPositionRefs[instanceId].current?.position.set(coords.x, coords.y, coords.z);
						textPositionRefs[instanceId].current?.translateZ(
							getZTranslation({ size: defaultGraphBlockDepth, text, scale }),
						);
					}

					return true;
				}
			});
		},
		[textPositionRefs, blocks, getZTranslation],
	);

	// Create a graph for the blocks
	const graph = useMemo(() => {
		if (!isMounted && !defined(nodeMeshRef.current)) {
			return;
		}

		if (defined(graphRef.current)) {
			updateNodePosition(graphRef.current);
			return graphRef.current;
		}

		const graph = new ThreeForceGraph().graphData(genTree(blocks));

		const object3D = new Object3D();

		// set the node mesh as the object for each node
		graph.nodeThreeObject((node) => {
			// get the instance id by the node id which is the source of the block
			const instanceId = blocks.findIndex((block) => block.source === node.id);

			const { scale = { width: 0, height: 0, depth: 1 }, text = '' } =
				blocks[!Number.isNaN(instanceId) ? Number(instanceId) : 0];
			const { scaleMod, blockColor } = getScaleAndColorMod(text, textSelections);

			// calculate dynamic block size from its text content
			const { x: scaleTextX, y: scaleTextY } = getBlockScaleFromText(text, {
				boxInitialSize: defaultGraphBlockSize,
				lineHeight: charHeight,
				charWidth,
			});

			object3D.scale.set(
				scale.width + scaleMod + scaleTextX,
				scale.height + scaleMod + scaleTextY,
				scale.depth + scaleMod,
			);
			object3D.updateMatrix();

			if (node?.id !== undefined && defined(nodeMeshRef.current)) {
				// set matrix of the instanced mesh to the node's matrix
				nodeMeshRef.current?.setMatrixAt(Number(instanceId), object3D.matrix);
				nodeMeshRef.current.instanceMatrix.needsUpdate = true;

				// set color of the instanced mesh to the node's color
				nodeMeshRef.current?.setColorAt(Number(instanceId), blockColor);
				if (defined(nodeMeshRef.current.instanceColor)) {
					nodeMeshRef.current.instanceColor.needsUpdate = true;
				}
			}

			return nodeMeshRef.current ?? new Object3D();
		});

		updateNodePosition(graph);

		graphRef.current = graph;

		return graph;
	}, [blocks, isMounted, textSelections, updateNodePosition]);

	useFrame(() => {
		if (defined(graphRef.current) && defined(nodeMeshRef.current)) {
			// this is simple and light enough to run on every frame for now
			for (let idx = 0; idx < blocks.length; idx++) {
				const { scale = { width: 0, height: 0, depth: 1 }, text = '' } = blocks[idx];
				const { scaleMod, blockColor } = getScaleAndColorMod(text, textSelections);

				// get instance of the mesh
				nodeMeshRef.current?.getMatrixAt(idx, nodeMeshRef.current?.matrix);

				const position = new Vector3();
				const rotation = new Quaternion();
				const scaleToModify = new Vector3();
				nodeMeshRef.current.matrix.decompose(position, rotation, scaleToModify);

				// calculate dynamic block size from its text content
				const { x: blockScaleTextX, y: blockScaleTextY } = getBlockScaleFromText(text, {
					boxInitialSize: defaultGraphBlockSize,
					lineHeight: charHeight,
					charWidth,
				});

				scaleToModify.set(
					scale.width + scaleMod + blockScaleTextX,
					scale.height + scaleMod + blockScaleTextY,
					scale.depth + scaleMod,
				);

				nodeMeshRef.current.setColorAt(idx, blockColor);
				nodeMeshRef.current.matrix.compose(position, rotation, scaleToModify);
				nodeMeshRef.current.setMatrixAt(idx, nodeMeshRef.current.matrix);
			}
			nodeMeshRef.current.instanceMatrix.needsUpdate = true;
			if (defined(nodeMeshRef.current.instanceColor)) {
				nodeMeshRef.current.instanceColor.needsUpdate = true;
			}
		}
	});

	// add the graph to the scene
	useEffect(() => {
		graph?.linkColor(() => 'red');
		graph?.linkOpacity(0.2);

		if (defined(graph)) {
			scene.add(graph);
		}

		// cleanup
		return () => {
			// remove the graph from the scene
			if (defined(graph)) {
				scene.remove(graph);
			}
		};
	}, [graph, scene]);

	useFrame(() => {
		graph?.tickFrame();
	});

	// node graph is rendered in the code above
	return (
		<>
			<instancedMesh
				ref={nodeMeshRef}
				args={[defaultGraphBlockGeometry, defaultGraphBlockMaterial, blocks.length]}
			/>

			{blocks.map(
				({ text = '', position = { x: 0, y: 0, z: 0 } }, blockIdx) =>
					text.length > 0 && (
						<HighlightedText
							key={`t-${blockIdx}`}
							ref={textPositionRefs[blockIdx]}
							text={text}
							position={position}
							fontSize={GRAPH_FONT_SIZE}
							addInteraction={
								// depending on the instances being dragged or not, we add or remove the interaction
								// as our intances ids are the same as the blocks ids, we can use the following condition
								instancesBeingDragged.find((id) => id === blockIdx) === undefined
							}
						/>
					),
			)}
		</>
	);
};
