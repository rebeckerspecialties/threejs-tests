import { TextSelectionProvider, useTextSelectionContext } from '@/providers';
import React, { useEffect } from 'react';

const ChangeTextContextComponent: React.FC<{
	search: string;
	children: React.ReactNode;
}> = ({ search, children }) => {
	const { setTextSelections } = useTextSelectionContext();

	useEffect(() => {
		if (search.length !== 0) {
			setTextSelections({ [search]: { hexColor: '#FF8800' } });
		}
	}, [search, setTextSelections]);

	return <>{children}</>;
};

export const TextProviderWrapper: React.FC<{ searchText: string; children: React.ReactNode }> = ({
	children,
	searchText,
}) => {
	return (
		<TextSelectionProvider>
			<ChangeTextContextComponent search={searchText}>{children}</ChangeTextContextComponent>
		</TextSelectionProvider>
	);
};
