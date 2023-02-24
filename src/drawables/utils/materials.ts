/*
 * ref: https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#re-using-geometries-and-materials
 *
 * Reusable mesh materials
 *
 */

import { MeshBasicMaterial, MeshPhongMaterial } from 'three';
import { defaultBlockColor } from './colors';

export const perfTestPhongMaterial = new MeshPhongMaterial({ color: 'white' });

export const defaultTextMaterial = new MeshPhongMaterial({ color: 0xffffff });

export const defaultBlockMaterial = new MeshPhongMaterial({ color: 0x708090 });

export const defaultGraphBlockMaterial = new MeshBasicMaterial({
	color: defaultBlockColor,
	opacity: 0.7,
	transparent: true,
	depthWrite: false,
});
