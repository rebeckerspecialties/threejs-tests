import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface TextSelections {
	[text: string]: { hexColor: string };
}

export interface TextSelectionContextProps {
	textSelections: TextSelections;
	setTextSelections: Dispatch<SetStateAction<TextSelections>>;
}

const TextSelectionContext = createContext<TextSelectionContextProps>({
	textSelections: {},
	setTextSelections: () => undefined,
});

export const useTextSelectionContext = () => useContext(TextSelectionContext);

export const TextSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [textSelections, setTextSelections] = useState<TextSelections>({});

	return (
		<TextSelectionContext.Provider value={{ textSelections, setTextSelections }}>
			{children}
		</TextSelectionContext.Provider>
	);
};
