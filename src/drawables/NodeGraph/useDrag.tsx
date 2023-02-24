import { useFrame } from '@react-three/fiber';
import { useInteraction, XRController, XRInteractionEvent } from '@react-three/xr';
import { RefObject, useRef, useState } from 'react';
import { InstancedMesh, Vector3 } from 'three';
import ThreeForceGraph from 'three-forcegraph';
import { defined } from '@/drawables/utils/utils';

interface ControllerState {
	pressed: boolean;
	controller: XRController | null;
	point: Vector3 | null;
	selectedInstance: number | null;
	position?: any | null;
}

interface Options {
	graph: RefObject<ThreeForceGraph | undefined>;
	nodeMesh: RefObject<InstancedMesh>;
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

function useDrag({ graph, nodeMesh }: Options) {
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
				pressed: true,
				controller: target,
				point: intersection?.point ?? null,
				selectedInstance: intersection?.instanceId ?? null,
			});
		} else {
			// if the controller is found, update the values
			controllersActionsRef.current[controllerIndex] = {
				pressed: true,
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
				pressed: false,
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
				pressed: false,
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
				controllersActionsRef.current[controllerIndex].pressed &&
				controllersActionsRef.current[controllerIndex].selectedInstance !== instanceId
			) {
				controllersActionsRef.current[controllerIndex] = {
					...controllersActionsRef.current[controllerIndex],
					pressed: false,
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

	useFrame(() => {
		const isAnyControllerSelecting = controllersActionsRef.current.some(
			(controller) => controller.pressed,
		);

		if (!defined(graph.current)) return;

		if (isAnyControllerSelecting && defined(nodeMesh.current)) {
			controllersActionsRef.current.forEach((controller) => {
				if (controller.pressed && defined(nodeMesh.current) && defined(controller.controller)) {
					const { controller: controllerRef, point, selectedInstance: instanceId } = controller;
					const { children } = controllerRef;
					const controllerPosition = children[0].position;

					// get the position of the instance
					nodeMesh.current.getMatrixAt(instanceId ?? 0, nodeMesh.current.matrix);

					const matrixPosition = new Vector3().setFromMatrixPosition(nodeMesh.current.matrix);

					// TODO ⚠️: we set the type of the graph to any because the type definition in the library is wrong - we will update it once the types are fixed in the library
					(graph.current?.d3AlphaTarget(0) as any).resetCountdown(); // keep engine running while dragging

					if (!defined(point)) {
						return;
					}

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

						// update the previous controller position
						controller.position.z = controllerPosition.z;
					}

					// if the controller is moving in the x axis
					if (point.x !== controller.position?.x) {
						const xDifference = point.x - controller.position.x;

						xPosition += xDifference;

						// update the previous controller position
						controller.position.x = point.x;
					}

					// if the controller is moving in the y axis
					if (point.y !== controller.position?.y) {
						const yDifference = point.y - controller.position.y;

						yPosition += yDifference;

						// update the previous controller position
						controller.position.y = point.y;
					}

					// update position of the nodes
					const nodes = graph.current?.graphData().nodes;
					if (defined(nodes)) {
						nodes.forEach((node) => {
							if (node.id === instanceId) {
								node.x = xPosition;
								node.y = yPosition;
								node.z = zPosition;
							}
						});
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
