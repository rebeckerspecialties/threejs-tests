import { TextSelectionProvider, useTextSelectionContext } from '@/providers';
import React, { useEffect } from 'react';

const ChangeTextContextComponent: React.FC<{
	search: string;
	children: React.ReactNode;
}> = ({ search, children }) => {
	const { setSelectedText } = useTextSelectionContext();

	useEffect(() => {
		setSelectedText(search);
	}, [search, setSelectedText]);

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
