/*
 * ref: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
 *
 * Reusable geometries
 *
 */

import { BoxGeometry } from 'three';

export const perfTestCubeGeometry = new BoxGeometry(0.3, 0.3, 0.3);
