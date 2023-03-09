import { GitHubAuthProvider, ThemeProvider } from '@/providers';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes';

const App: React.FC = () => {
	return (
		<GitHubAuthProvider>
			<ThemeProvider>
				<RouterProvider router={router} />
			</ThemeProvider>
		</GitHubAuthProvider>
	);
};

export default App;
