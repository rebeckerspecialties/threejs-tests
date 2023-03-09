import { useFrame } from '@react-three/fiber';
import { useInteraction, XRController, XRInteractionEvent } from '@react-three/xr';
import { RefObject, useRef, useState } from 'react';
import { InstancedMesh, Vector3 } from 'three';
import ThreeForceGraph from 'three-forcegraph';
import { defined } from '@/drawables/utils/utils';
import { GraphBlock } from '@/drawables/NodeGraph/NodeGraph';
import { NodeObject } from '@/drawables/NodeGraph/utils';

interface ControllerState {
	selectButtonPressed: boolean;
	squeezeButtonPressed?: boolean;
	controller: XRController | null;
	point: Vector3 | null;
	selectedInstance: number | null;
	position?: {
		x: number;
		y: number;
		z: number;
	} | null;
}

interface Options {
	graph: RefObject<ThreeForceGraph | undefined>;
	nodeMesh: RefObject<InstancedMesh>;
	blocks: GraphBlock[];
}

// Type guard for NodeObject
function isNodeObject(object: any): object is NodeObject {
	// if the object has an id, it is a NodeObject
	return 'id' in object;
}

function getControllerIndex(event: XRInteractionEvent, controllersState: ControllerState[]) {
	const {
		target: { index },
	} = event;

	const controllerIndex = controllersState.findIndex(
		(controllerState) => controllerState.controller?.index === index,
	);

	return controllerIndex;
}

function useDrag({ graph, nodeMesh, blocks }: Options) {
	const controllersActionsRef = useRef<ControllerState[]>([]);
	const [instancesBeingDragged, setInstancesBeingDragged] = useState<number[]>([]);

	const updateInstancesBeingDragged = (
		instanceId: number | undefined | null,
		action: 'remove' | 'add',
	) => {
		if (!defined(instanceId)) return;

		setInstancesBeingDragged((instancesBeingDragged) => {
			if (action === 'add') {
				// check if the instance is already being dragged
				if (instancesBeingDragged.includes(instanceId)) return instancesBeingDragged;
				return [...instancesBeingDragged, instanceId];
			}

			return instancesBeingDragged.filter((insId) => insId !== instanceId);
		});
	};

	useInteraction(nodeMesh, 'onSelectStart', (event: XRInteractionEvent) => {
		const { intersection, target } = event;

		// find the controller that is pressing the select button
		const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

		// if the controller is not found, add it to the array
		if (controllerIndex === -1) {
			controllersActionsRef.current.push({
				selectButtonPressed: true,
				controller: target,
				point: intersection?.point ?? null,
				selectedInstance: intersection?.instanceId ?? null,
			});
		} else {
			// if the controller is found, update the values
			controllersActionsRef.current[controllerIndex] = {
				...controllersActionsRef.current[controllerIndex],
				position: null,
				selectButtonPressed: true,
				controller: target,
				point: intersection?.point ?? null,
				selectedInstance: intersection?.instanceId ?? null,
			};
		}

		// update the instances being dragged
		updateInstancesBeingDragged(intersection?.instanceId, 'add');
	});

	useInteraction(nodeMesh, 'onSelectEnd', (event: XRInteractionEvent) => {
		const { intersection } = event;

		// find the controller that is pressing the select button
		const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

		// if the controller is found, update the values
		if (controllerIndex !== -1) {
			controllersActionsRef.current[controllerIndex] = {
				...controllersActionsRef.current[controllerIndex],
				selectButtonPressed: false,
			};

			// update the instances being dragged
			updateInstancesBeingDragged(intersection?.instanceId, 'remove');
		}
	});

	useInteraction(nodeMesh, 'onBlur', (event: XRInteractionEvent) => {
		const { intersection } = event;

		// find the controller that is pressing the select button
		const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

		// if the controller is found, update the values
		if (controllerIndex !== -1) {
			controllersActionsRef.current[controllerIndex] = {
				...controllersActionsRef.current[controllerIndex],
				selectButtonPressed: false,
			};

			// update the instances being dragged
			updateInstancesBeingDragged(intersection?.instanceId, 'remove');
		}
	});

	useInteraction(nodeMesh, 'onMove', (event: XRInteractionEvent) => {
		// Save the instanceId and the offset from the controller to the instance
		const { intersection } = event;

		if (defined(intersection) && defined(nodeMesh.current)) {
			const { point, instanceId } = intersection;

			// find the controller that is pressing the select button
			const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

			// TODO: make the instance keep being dragged even if the user gets through another instance
			// if the user is dragging an instance but encounters another instance, the flag is reseted and the user has to press the select button again
			if (
				controllerIndex !== -1 &&
				controllersActionsRef.current[controllerIndex].selectButtonPressed &&
				controllersActionsRef.current[controllerIndex].selectedInstance !== instanceId
			) {
				controllersActionsRef.current[controllerIndex] = {
					...controllersActionsRef.current[controllerIndex],
					selectButtonPressed: false,
					squeezeButtonPressed: false,
				};

				// update the instances being dragged
				updateInstancesBeingDragged(
					controllersActionsRef.current[controllerIndex].selectedInstance,
					'remove',
				);
			}

			// if the controller is found, update the values
			if (controllerIndex !== -1) {
				controllersActionsRef.current[controllerIndex] = {
					...controllersActionsRef.current[controllerIndex],
					point,
					selectedInstance: instanceId ?? null,
				};
			}
		}
	});

	useInteraction(nodeMesh, 'onSqueezeStart', (event: XRInteractionEvent) => {
		// find the controller that is pressing the select button
		const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

		// if the controller is found, update the values
		if (controllerIndex !== -1) {
			controllersActionsRef.current[controllerIndex] = {
				...controllersActionsRef.current[controllerIndex],
				squeezeButtonPressed: true,
			};
		}
	});

	useInteraction(nodeMesh, 'onSqueezeEnd', (event: XRInteractionEvent) => {
		// find the controller that is pressing the select button
		const controllerIndex = getControllerIndex(event, controllersActionsRef.current);

		// if the controller is found, update the values
		if (controllerIndex !== -1) {
			controllersActionsRef.current[controllerIndex] = {
				...controllersActionsRef.current[controllerIndex],
				squeezeButtonPressed: false,
			};
		}
	});

	useFrame(() => {
		const isAnyControllerSelecting = controllersActionsRef.current.some(
			(controller) => controller.selectButtonPressed,
		);

		if (!defined(graph.current)) return;

		if (isAnyControllerSelecting && defined(nodeMesh.current)) {
			controllersActionsRef.current.forEach((controller) => {
				if (
					controller.selectButtonPressed &&
					defined(nodeMesh.current) &&
					defined(controller.controller)
				) {
					// keep the graph running while the user is dragging an instance
					graph.current?.resetCountdown();
					const { controller: controllerRef, point, selectedInstance: instanceId } = controller;
					const { children } = controllerRef;
					const controllerPosition = children[0].position;

					if (!defined(point) || !defined(instanceId)) {
						return;
					}

					// update position of the nodes
					const nodes = graph.current?.graphData().nodes;
					const links = graph.current?.graphData().links;

					const blockSource = blocks[instanceId]?.source;

					const updatePosition = (id: number) => {
						if (!defined(nodeMesh.current)) return;

						// get the position of the instance
						nodeMesh.current?.getMatrixAt(Number(id), nodeMesh.current.matrix);

						const matrixPosition = new Vector3().setFromMatrixPosition(nodeMesh.current.matrix);

						if (
							!defined(controller.position) ||
							!defined(controller.position.z) ||
							!defined(controller.position.x) ||
							!defined(controller.position.y)
						) {
							// save the current controller position
							controller.position = {
								x: point.x,
								y: point.y,
								z: controllerPosition.z,
							};
						}

						let zPosition = matrixPosition.z;
						let xPosition = matrixPosition.x;
						let yPosition = matrixPosition.y;

						// if the controller is moving in the z axis
						if (controllerPosition.z !== controller.position?.z) {
							// get the difference between the current controller position and the previous one
							const zDifference = controllerPosition.z - controller.position.z;

							zPosition += zDifference * 50; // we add a multiplier to make the movement faster;
						}

						// if the controller is moving in the x axis
						if (point.x !== controller.position?.x) {
							const xDifference = point.x - controller.position.x;

							xPosition += xDifference;
						}

						// if the controller is moving in the y axis
						if (point.y !== controller.position?.y) {
							const yDifference = point.y - controller.position.y;

							yPosition += yDifference;
						}

						if (defined(nodes) && defined(nodes[id])) {
							const node = nodes[id];
							node.fx = xPosition;
							node.fy = yPosition;
							node.fz = zPosition;
						}
					};

					if (defined(controller.squeezeButtonPressed) && controller.squeezeButtonPressed) {
						function getAllChildren(nodeId: number) {
							const linksWithSameSource = links?.filter((link) => {
								if (!defined(link.target)) return false;

								if (isNodeObject(link.target)) {
									return link.target.id === nodeId;
								} else {
									return Number(link.target) === nodeId;
								}
							});

							const childIds = linksWithSameSource
								?.map((link) => {
									if (isNodeObject(link.source)) {
										const node = nodes?.find(
											(node) => node.id === Number((link.source as NodeObject).id),
										);
										return node?.id;
									}

									return link.source;
								})
								.filter((id) => defined(id)) as Array<number | string>;

							let allChildren = childIds;
							for (const childId of childIds) {
								const grandChildren = getAllChildren(Number(childId));
								allChildren = allChildren.concat(grandChildren);
							}

							return allChildren;
						}

						// get all children of the block being dragged
						const instancesIds = [blockSource, ...getAllChildren(blockSource)];

						if (defined(instancesIds) && instancesIds.length !== 0) {
							instancesIds.forEach((id) => {
								updatePosition(Number(id));
							});
						}
					} else {
						updatePosition(instanceId);
					}
					// update the previous controller position
					if (defined(controller.position)) {
						controller.position.x = point.x;
						controller.position.y = point.y;
						controller.position.z = controllerPosition.z;
					}
				} else {
					// if the controller is not pressing the select button, reset the values
					controller.position = null;
				}
			});
		}
	});

	return instancesBeingDragged;
}

export default useDrag;
