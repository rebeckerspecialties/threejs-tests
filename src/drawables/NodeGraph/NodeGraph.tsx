import { Block } from '@/drawables/InstancedBlocks/InstancedBlocks';
import { getBlockScaleFromText, getCharSizeFromFontSize } from '@/drawables/utils/block';
import {
	defaultBlockColor,
	defaultThemeColor,
	findMatchBlockColor,
} from '@/drawables/utils/colors';
import {
	defaultGraphBlockDepth,
	defaultGraphBlockGeometry,
	defaultGraphBlockSize,
	textHighlightBoxGeometry,
} from '@/drawables/utils/geometries';
import { defined, FONT_URLS } from '@/drawables/utils/utils';
import { useTextSelectionContext } from '@/providers';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
	Color,
	Group,
	InstancedMesh,
	Matrix4,
	MeshBasicMaterial,
	Object3D,
	Quaternion,
	Vector3,
} from 'three';
import ThreeForceGraph from 'three-forcegraph';
import { getSelectionRects, Text as TroikaText } from 'troika-three-text';
import { genTree } from './utils';

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

export const NodeGraph: React.FC<Props> = ({ blocks }) => {
	const { scene } = useThree();
	const { selectedText } = useTextSelectionContext();
	const tickRef = useRef({ lastTick: 0, lastSelectedText: '' });
	const groupRef = useRef<Group[]>([]);
	const graphRef = useRef<ThreeForceGraph>();
	const nodeMeshRef = useRef<InstancedMesh>();

	const getSelectionIndexes = useCallback(
		(text: string) => {
			if (text.length === 0 || selectedText.length === 0) {
				return [];
			}

			// get indexes where text was found and mount colorRanges entity
			const selectionIndexes: number[] = [];
			for (let i = 0; i <= text.length - selectedText.length; i++) {
				if (text.slice(i, i + selectedText.length) === selectedText) {
					selectionIndexes.push(i);
				}
			}

			return selectionIndexes;
		},
		[selectedText],
	);

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
			if (selectedText.length > 0 && text.includes(selectedText)) {
				return (size * (scale.depth + SCALE_MODIFIER)) / 2 + 0.011;
			} else {
				return (size * scale.depth) / 2 + 0.011;
			}
		},
		[selectedText],
	);

	// create function to update the node position, and takes the graph as a parameter
	const updateNodePosition = useCallback(
		(graph: ThreeForceGraph) => {
			if (!defined(graph)) {
				return;
			}

			graph.nodePositionUpdate((object: InstancedMesh, coords, node) => {
				if (defined(node.id)) {
					// get matrix
					object.getMatrixAt(Number(node.id), object.matrix);

					// update position of the matrix
					object.matrix.setPosition(coords.x, coords.y ?? 0, coords.z ?? 0);

					// update instance matrix
					object.setMatrixAt(Number(node.id), object.matrix);

					object.instanceMatrix.needsUpdate = true;

					// update the group ref position
					if (defined(groupRef.current?.[node.id])) {
						const { text, scale } = blocks[node.id] ?? {};
						const { x: scaleTextX, y: scaleTextY } = getBlockScaleFromText(text, {
							boxInitialSize: defaultGraphBlockSize,
							lineHeight: charHeight,
							charWidth,
							paddingX: 0,
							paddingY: 0,
						});

						groupRef.current?.[node.id].position.set(
							coords.x - (scaleTextX * defaultGraphBlockSize) / 2,
							(coords.y ?? 0) + (scaleTextY * defaultGraphBlockSize) / 2,
							coords.z ?? 0,
						);
						groupRef.current?.[node.id].translateZ(
							getZTranslation({ size: defaultGraphBlockDepth, text, scale }),
						);

						scene.add(groupRef.current?.[node.id]);
					}

					return true;
				}
			});
		},
		[blocks, getZTranslation, scene],
	);

	// Create a graph for the blocks
	const graph = useMemo(() => {
		if (defined(graphRef.current)) {
			updateNodePosition(graphRef.current);
			return graphRef.current;
		}

		const graph = new ThreeForceGraph().graphData(genTree(blocks));

		// create a instanced mesh for all nodes in the graph
		nodeMeshRef.current = new InstancedMesh(
			defaultGraphBlockGeometry,
			new MeshBasicMaterial({
				color: defaultBlockColor,
				opacity: 0.7,
				transparent: true,
				depthWrite: false,
			}),
			blocks.length,
		);
		const object3D = new Object3D();

		// set the node mesh as the object for each node
		graph.nodeThreeObject((node) => {
			const { scale = { width: 0, height: 0, depth: 1 }, text = '' } =
				blocks[!Number.isNaN(node.id) ? Number(node.id) : 0];

			let scaleMod = 0;
			let blockColor = defaultBlockColor;

			if (selectedText.length > 0 && text.includes(selectedText)) {
				scaleMod = SCALE_MODIFIER;
				blockColor = findMatchBlockColor;
			}

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

				const textObject = new TroikaText();
				textObject.text = text;
				textObject.font = FONT_URLS.Mono;
				textObject.fontSize = GRAPH_FONT_SIZE;
				textObject.color = defaultThemeColor.editor.foreground;
				textObject.sync();

				// create instanced mesh for the selection
				const selectionMesh = new InstancedMesh(
					textHighlightBoxGeometry,
					new MeshBasicMaterial({
						color: defaultThemeColor.editor.findMatchBackground,
					}),
					getSelectionIndexes(text).length,
				);

				// move the selection mesh to the front
				selectionMesh.position.set(0, 0, -0.01);

				const textGroup = new Group();
				textGroup.add(textObject);
				textGroup.add(selectionMesh);
				groupRef.current?.push(textGroup);
			}

			return nodeMeshRef.current ?? object3D;
		});

		updateNodePosition(graph);

		graphRef.current = graph;

		return graph;
	}, [blocks, getSelectionIndexes, selectedText, updateNodePosition]);

	useLayoutEffect(() => {
		if (defined(graphRef.current) && defined(nodeMeshRef.current)) {
			for (let idx = 0; idx < blocks.length; idx++) {
				const { scale = { width: 0, height: 0, depth: 1 }, text = '' } = blocks[idx];

				let scaleMod = 0;
				let blockColor: Color = defaultBlockColor;

				if (selectedText.length > 0 && text.includes(selectedText)) {
					scaleMod = 0.1;
					blockColor = findMatchBlockColor;
				}
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

				// update the text position
				if (defined(groupRef.current?.[idx])) {
					const { x: scaleTextX, y: scaleTextY } = getBlockScaleFromText(text, {
						boxInitialSize: defaultGraphBlockSize,
						lineHeight: charHeight,
						charWidth,
						paddingX: 0,
						paddingY: 0,
					});
					groupRef.current?.[idx].position.set(
						position.x - (scaleTextX * defaultGraphBlockSize) / 2,
						position.y + (scaleTextY * defaultGraphBlockSize) / 2,
						position.z,
					);

					groupRef.current?.[idx].translateZ(
						getZTranslation({ size: defaultGraphBlockDepth, text, scale }),
					);
				}
			}

			nodeMeshRef.current.instanceMatrix.needsUpdate = true;
		}
	}, [blocks, blocks.length, getZTranslation, selectedText]);

	// add the graph to the scene
	useEffect(() => {
		const group = groupRef.current;
		graph.linkColor(() => 'red');
		graph.linkOpacity(0.2);

		scene.add(graph);

		return () => {
			// remove the graph from the scene
			scene.remove(graph);

			// remove the group ref from the scene
			group?.forEach((group) => {
				scene.remove(group);
			});
		};
	}, [graph, scene]);

	useFrame(() => {
		graph.tickFrame();

		if (tickRef.current.lastSelectedText !== selectedText) {
			graph.graphData().nodes.forEach((node) => {
				// get the group ref
				const group = groupRef.current?.[!Number.isNaN(node.id) ? Number(node.id) : 0];

				// get the text object and assert it is a troila text
				const textObject = group?.children.find(
					(child) => !(child instanceof InstancedMesh),
				) as TroikaText;

				// get the selection mesh and assert it is an instanced mesh
				let selectionMesh = group.children.find(
					(child) => child instanceof InstancedMesh,
				) as InstancedMesh;

				// get the selection indexes
				const selectionIndexes = getSelectionIndexes(blocks[Number(node?.id)]?.text ?? '');

				if (!defined(textObject) || !defined(selectionMesh)) {
					return;
				}

				// replace instanced mesh if the selection indexes are different
				if (selectionIndexes.length > selectionMesh.count) {
					selectionMesh.dispose();
					selectionMesh = new InstancedMesh(
						textHighlightBoxGeometry,
						new MeshBasicMaterial({
							color: defaultThemeColor.editor.findMatchBackground,
						}),
						selectionIndexes.length,
					);

					// move the selection mesh to the front
					selectionMesh.position.set(0, 0, -0.01);

					group?.remove(group?.children[1]);
					group?.add(selectionMesh);
				}

				if (
					!defined(textObject?.textRenderInfo) ||
					selectionIndexes.length === 0 ||
					!defined(selectionMesh)
				) {
					// delete instances of the selection mesh
					selectionMesh.count = 0;
					return;
				}

				for (let i = 0; i < selectionIndexes.length; i++) {
					// considering word selection (line doesn't break in Text), so we only need first occurrence
					const rects: [{ left: number; right: number; top: number; bottom: number }] =
						getSelectionRects(
							textObject.textRenderInfo,
							selectionIndexes[i],
							selectionIndexes[i] + selectedText.length,
						);

					let left = 0;
					let right = 0;
					let top = 0;
					let bottom = 0;

					if (defined(rects[0])) {
						left = rects[0].left;
						right = rects[0].right;
						top = rects[0].top;
						bottom = rects[0].bottom;
					}

					const width = right - left;
					const height = top - bottom;
					const posX = width / 2 + left;
					const posY = height / 2 + bottom;

					const object3D = new Object3D();
					object3D.position.set(posX, posY, 0.0005); // adjust z position closer to text
					object3D.scale.set(width * 1000, height * 1000, 1000); // 1000 factor since geometry starts at 0.001

					object3D.updateMatrix();

					selectionMesh.setMatrixAt(i, object3D.matrix);

					// delete rest of the instances
					for (let j = selectionIndexes.length; j < selectionMesh.count; j++) {
						selectionMesh.setMatrixAt(j, new Matrix4());
					}

					selectionMesh.updateMatrix();
				}
				selectionMesh.instanceMatrix.needsUpdate = true;
				tickRef.current.lastSelectedText = selectedText;
			});
		}
	});

	return null;
};
