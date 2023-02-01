import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface TextSelectionContextProps {
	selectedText: string;
	setSelectedText: Dispatch<SetStateAction<string>>;
}

const TextSelectionContext = createContext<TextSelectionContextProps>({
	selectedText: '',
	setSelectedText: () => '',
});

export const useTextSelectionContext = () => useContext(TextSelectionContext);

export const TextSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [selectedText, setSelectedText] = useState('');

	return (
		<TextSelectionContext.Provider value={{ selectedText, setSelectedText }}>
			{children}
		</TextSelectionContext.Provider>
	);
};
