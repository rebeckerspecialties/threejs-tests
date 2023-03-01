import { GraphBlock, NodeGraph } from '@/drawables/NodeGraph/NodeGraph';
import React from 'react';

export const GraphExample: React.FC = () => {
	const blocks: GraphBlock[] = [
		{
			text: 'PRG000_D82B:\n\tRTS\n\nObject_HitTest:\n\tLDA #$01\n\tJMP PRG000_D83D',
			source: 0,
		},
		{
			text: 'Object_HitTestRespond:\n\tLDA #$00 W',
			source: 1,
			target: 0,
		},
		{
			text: 'PRG000_D83D:\n\tSTA <Temp_Var16\n\n\tLDA Objects_PlayerHitStat,X\n\tAND #%11111100\n\tSTA Objects_PlayerHitStat,X\n\n\tCLC\n\n\tLDA <Player_IsDying\n\tORA Player_OffScreen\n\tORA Player_Behind_En\n\tBNE PRG000_D82B\n\n\tJSR Object_CalcBoundBox\n\n\tLDA <Player_Suit\n\tBEQ PRG000_D862\n\n\tLDA #$00\n\n\tLDY Player_IsDucking\t \n\tBNE PRG000_D862\n\n\tLDA #$01',
			source: 2,
			target: 0,
		},
		{
			text: 'PRG000_D862:\n\tASL A\n\tASL A\n\tTAY\n\n\tLDA <Player_SpriteX\n\tADD Player_BoundBox,Y\n\tSTA <Temp_Var3\t\n\n\tLDA <Player_SpriteY\n\tADD Player_BoundBox+2,Y\n\tSTA <Temp_Var7\t\n\n\tLDA Player_BoundBox+1,Y\n\tSTA <Temp_Var4\t\n\n\tLDA Player_BoundBox+3,Y\n\tSTA <Temp_Var8\t\n\n\tJSR ObjectObject_Intersect\n\tBCC PRG000_D82B\n\n\tSTA <Temp_Var1\n\n\tLDA Level_7Vertical\n\tBNE PRG000_D8B1\n\n\tLDA <Player_X\n\tSUB <Objects_X,X\n\tSTA <Temp_Var15\t\n\n\tLDA <Player_XHi\n\tSBC <Objects_XHi,X\n\n\tSTA <Temp_Var14\t\n\n\tBPL PRG000_D8A9\n\n\tLDA <Temp_Var15\n\tJSR Negate\t\n\tSTA <Temp_Var15\t\n\n\tLDA <Temp_Var14\n\tEOR #$ff\t\n\tADC #$00\t\n\tSTA <Temp_Var14',
			source: 3,
			target: 0,
		},
		{
			text: 'PRG000_D8A9:\n\tLDA <Temp_Var14\n\tBNE PRG000_D920\n\n\tLDA <Temp_Var15\n\tBMI PRG000_D920',
			source: 4,
			target: 0,
		},
		{
			text: 'Test 2 5 TEST',
			source: 5,
			target: 0,
		},
		{
			text: 'Test 3 6',
			source: 6,
			target: 5,
		},
	];

	return <NodeGraph blocks={blocks} />;
};
