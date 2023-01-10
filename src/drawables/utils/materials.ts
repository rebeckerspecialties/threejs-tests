/*
 * ref: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
 *
 * Reusable mesh materials
 *
 */

import { MeshPhongMaterial } from 'three';

export const perfTestPhongMaterial = new MeshPhongMaterial({ color: 'white' });

export const defaultTextMaterial = new MeshPhongMaterial({ color: 0xffffff });
