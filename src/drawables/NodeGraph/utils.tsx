import { GraphBlock } from './NodeGraph';

interface Node {
	id: number;
}

interface Link {
	source: number;
	target: number;
}

interface Tree {
	nodes: Node[];
	links: Link[];
}

export function genTree(blocks: GraphBlock[]): Tree {
	const nodes: Node[] = [];
	const links: Link[] = [];
	for (const [i, block] of blocks.entries()) {
		const { source, target } = block;

		nodes.push({ id: source ?? i });
		if (i > 0) {
			links.push({ source, target });
		}
	}
	return { nodes, links };
}
