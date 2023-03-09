import { useGitHubAuthContext } from '@/providers';
import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
	const { logout } = useGitHubAuthContext();

	const doLogout = () => {
		logout();
	};

	return (
		<div className="header">
			<button className="logout-button" onClick={doLogout}>
				Logout
			</button>
		</div>
	);
};
