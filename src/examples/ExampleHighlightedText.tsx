import React from 'react';
import { Block, InstancedBlocks } from '../drawables/InstancedBlocks/InstancedBlocks';

export const ExampleHighlightedText: React.FC = () => {
	const blocks: Block[] = [
		{
			position: { x: 0, y: 0.5, z: -5 },
			text: 'PRG000_D82B:\n\tRTS\n\nObject_HitTest:\n\tLDA #$01\n\tJMP PRG000_D83D',
		},
		{
			position: { x: 0, y: 2, z: -5 },
			text: 'Object_HitTestRespond:\n\tLDA #$00 W',
		},
		{
			position: { x: 2, y: 2, z: -5 },
			text: 'PRG000_D83D:\n\tSTA <Temp_Var16\n\n\tLDA Objects_PlayerHitStat,X\n\tAND #%11111100\n\tSTA Objects_PlayerHitStat,X\n\n\tCLC\n\n\tLDA <Player_IsDying\n\tORA Player_OffScreen\n\tORA Player_Behind_En\n\tBNE PRG000_D82B\n\n\tJSR Object_CalcBoundBox\n\n\tLDA <Player_Suit\n\tBEQ PRG000_D862\n\n\tLDA #$00\n\n\tLDY Player_IsDucking\t \n\tBNE PRG000_D862\n\n\tLDA #$01',
		},
	];

	return <InstancedBlocks blocks={blocks} />;
};
