/*
 * ref: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
 *
 * Reusable geometries
 *
 */

import { BoxGeometry } from 'three';

export const perfTestCubeGeometry = new BoxGeometry(0.3, 0.3, 0.3);

export const defaultBoxSize = 0.5;
export const defaultBoxGeometry = new BoxGeometry(defaultBoxSize, defaultBoxSize, defaultBoxSize);

export const textHighlightBoxGeometry = new BoxGeometry(0.001, 0.001, 0.00001);

// Graph data structures
export const defaultGraphBlockSize = 15;
export const defaultGraphBlockDepth = 1;
export const defaultGraphBlockGeometry = new BoxGeometry(
	defaultGraphBlockSize,
	defaultGraphBlockSize,
	defaultGraphBlockDepth,
);
