import { FONT_URLS } from '@/drawables/utils/utils';
import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from 'react';
import { preloadFont } from 'troika-three-text';

export interface ThemeContextProps {
	fontURL: string;
	loadFontURL: Dispatch<SetStateAction<string>>;
}

const ThemeContext = createContext<ThemeContextProps>({
	fontURL: '',
	loadFontURL: () => '',
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [fontURL, setFontURL] = useState('');
	const loadFontURL = (url: string) => {
		setFontURL('');
		preloadFont({ font: url }, () => {
			setFontURL(url);
		});
	};

	useEffect(() => {
		loadFontURL(FONT_URLS.Mono);
	}, []);

	return (
		<ThemeContext.Provider value={{ fontURL, loadFontURL }}>
			{fontURL.length > 0 && children}
		</ThemeContext.Provider>
	);
};
