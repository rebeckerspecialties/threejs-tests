import { Block } from '@/drawables/InstancedBlocks/InstancedBlocks';
import { getBlockScaleFromText, getCharSizeFromFontSize } from '@/drawables/utils/block';
import { defaultBlockColor, findMatchBlockColor } from '@/drawables/utils/colors';
import {
	defaultGraphBlockDepth,
	defaultGraphBlockGeometry,
	defaultGraphBlockSize,
} from '@/drawables/utils/geometries';
import { defined, getWordIndexesFromText } from '@/drawables/utils/utils';
import { useTextSelectionContext } from '@/providers';
import { useFrame, useThree } from '@react-three/fiber';
import React, {
	createRef,
	RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from 'react';
import { Color, Group, InstancedMesh, Object3D, Quaternion, Vector3 } from 'three';
import ThreeForceGraph from 'three-forcegraph';
import { HighlightedText } from '@/drawables/HighlightedText/HighlightedText';
import { genTree } from './utils';
import { defaultGraphBlockMaterial } from '@/drawables/utils/materials';
import { useMounted } from '@/drawables/utils/useMounted';
import useDrag from './useDrag';

export interface GraphBlock extends Block {
	/**
	 * source and target are used to create links between nodes
	 */
	source: number;
	/**
	 * source and target are used to create links between nodes
	 */
	target: number;
}

interface Props {
	blocks: GraphBlock[];
}

const SCALE_MODIFIER = 0.1;
const GRAPH_FONT_SIZE = 0.5;
const { width: charWidth, height: charHeight } = getCharSizeFromFontSize(GRAPH_FONT_SIZE);

function getScaleAndColorMod(
	text: string,
	selectedText: string,
): { scaleMod: number; blockColor: Color } {
	if (
		selectedText.length !== 0 &&
		getWordIndexesFromText(text, selectedText, {
			findOne: true,
		}).length !== 0
	) {
		return {
			scaleMod: SCALE_MODIFIER,
			blockColor: findMatchBlockColor,
		};
	}
	return {
		scaleMod: 0,
		blockColor: defaultBlockColor,
	};
}

export const NodeGraph: React.FC<Props> = ({ blocks }) => {
	const { scene } = useThree();
	const { selectedText } = useTextSelectionContext();
	const graphRef = useRef<ThreeForceGraph>();
	const nodeMeshRef = useRef<InstancedMesh>(null);
	const textPositionRefs: Array<RefObject<Group>> = blocks.map(() => createRef());
	const isMounted = useMounted();

	const instancesBeingDragged = useDrag({
		graph: graphRef,
		nodeMesh: nodeMeshRef,
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
			if (
				selectedText.length !== 0 &&
				getWordIndexesFromText(text, selectedText, {
					findOne: true,
				}).length !== 0
			) {
				return (size * (scale.depth + SCALE_MODIFIER)) / 2 + 0.011;
			} else {
				return (size * scale.depth) / 2 + 0.011;
			}
		},
		[selectedText],
	);

	// update the node position
	const updateNodePosition = useCallback(
		(graph: ThreeForceGraph) => {
			if (!defined(graph)) {
				return;
			}

			graph.nodePositionUpdate((object: InstancedMesh, coords, node) => {
				if (defined(node.id)) {
					const instanceId = Number(node.id); // we assume that the node id is the same as the instance id

					// get matrix
					object.getMatrixAt(instanceId, object.matrix);

					// update position of the matrix
					object.matrix.setPosition(coords.x, coords.y ?? 0, coords.z ?? 0);

					// update instance matrix
					object.setMatrixAt(instanceId, object.matrix);
					object.instanceMatrix.needsUpdate = true;

					if (defined(textPositionRefs[node.id]?.current)) {
						// update position of texts instances
						const { text, scale = { width: 1, height: 1, depth: 1 } } = blocks[node.id];
						textPositionRefs[node.id].current.position.set(coords.x, coords.y, coords.z);
						textPositionRefs[node.id].current.translateZ(
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
			const { scale = { width: 0, height: 0, depth: 1 }, text = '' } =
				blocks[!Number.isNaN(node.id) ? Number(node.id) : 0];
			const { scaleMod, blockColor } = getScaleAndColorMod(text, selectedText);

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

			if (node?.id !== undefined) {
				// set matrix of the instanced mesh to the node's matrix
				nodeMeshRef.current?.setMatrixAt(Number(node.id), object3D.matrix);

				// set color of the instanced mesh to the node's color
				nodeMeshRef.current?.setColorAt(Number(node.id), blockColor);
			}

			return nodeMeshRef.current ?? new Object3D();
		});

		updateNodePosition(graph);

		graphRef.current = graph;

		return graph;
	}, [blocks, isMounted, selectedText, updateNodePosition]);

	useLayoutEffect(() => {
		if (defined(graphRef.current) && defined(nodeMeshRef.current)) {
			for (let idx = 0; idx < blocks.length; idx++) {
				const { scale = { width: 0, height: 0, depth: 1 }, text = '' } = blocks[idx];
				const { scaleMod, blockColor } = getScaleAndColorMod(text, selectedText);

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

				nodeMeshRef.current.matrix.compose(position, rotation, scaleToModify);

				nodeMeshRef.current.setMatrixAt(idx, nodeMeshRef.current.matrix);

				nodeMeshRef.current.setColorAt(idx, blockColor);
				if (defined(nodeMeshRef.current.instanceColor)) {
					nodeMeshRef.current.instanceColor.needsUpdate = true;
				}
			}

			nodeMeshRef.current.instanceMatrix.needsUpdate = true;
		}
	}, [blocks, blocks.length, getZTranslation, selectedText]);

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
