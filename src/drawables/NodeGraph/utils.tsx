import { GraphBlock } from '@/drawables/NodeGraph/NodeGraph';
import { defined } from '@/drawables/utils/utils';

// This is a type from the three-forcegraph library, but it's not exported so we have to copy it here
export type NodeObject = object & {
	id?: string | number;
	x?: number;
	y?: number;
	z?: number;
	vx?: number;
	vy?: number;
	vz?: number;
	fx?: number;
	fy?: number;
	fz?: number;
};

interface Link {
	source: number;
	target?: number;
}

interface Tree {
	nodes: NodeObject[];
	links: Link[];
}

export function genTree(blocks: GraphBlock[]): Tree {
	const nodes: NodeObject[] = [];
	const links: Link[] = [];
	for (const [i, block] of blocks.entries()) {
		const { source, target } = block;

		// three-forcegraph expects the node id to be the source value
		nodes.push({ id: source });
		if (i > 0) {
			links.push({ source, ...(defined(target) ? { target } : {}) });
		}
	}
	return { nodes, links };
}
