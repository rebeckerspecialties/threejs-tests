/*
 * ref: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
 *
 * Reusable mesh materials
 *
 */

import { MeshBasicMaterial, MeshPhongMaterial } from 'three';

export const perfTestPhongMaterial = new MeshPhongMaterial({ color: 'white' });
export const defaultTextMaterial = new MeshPhongMaterial({ color: 0xffffff });

export const defaultGraphBlockMaterial = new MeshBasicMaterial({
	color: '#AAAAAA',
	opacity: 0.9,
	transparent: true,
	depthWrite: false,
});
export const defaultBlockMaterial = new MeshBasicMaterial({ color: 0x708090 });
export const defaultBasicMaterial = new MeshBasicMaterial();
