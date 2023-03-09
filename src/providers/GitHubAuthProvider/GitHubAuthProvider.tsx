import { defined } from '@/drawables/utils/utils';
import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';

interface User {
	token?: string;
}

export interface UserLogin {
	user: User | null;
	error: Error | null;
	login: (code: string) => void;
	logout: () => void;
}

export const GitHubAuthContext = createContext<UserLogin>({
	user: null,
	error: null,
	login: () => {},
	logout: () => {},
});

export const useGitHubAuthContext = () => useContext(GitHubAuthContext);

export const GitHubAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<Error | null>(null);
	let abortController: AbortController = new AbortController();

	const login = async (code: string) => {
		// mock local dev to make device test easier (localhost vs vite https ip)
		// disable this condition to debug possible api issues
		if (import.meta.env.DEV) {
			setUser({ token: 'DevMockToken' });
			setError(null);
			return;
		}

		if (defined(user?.token)) {
			return;
		}

		try {
			const response = await axios.post(
				import.meta.env.VITE_GET_GH_TOKEN_URI,
				{ code },
				{ signal: abortController.signal },
			);
			if (defined(response.data)) {
				setUser({ token: response.data.access_token });
				setError(null);
				if (defined(abortController)) {
					abortController.abort();
				}
			}
		} catch (err) {}
	};

	const logout = () => {
		setUser(null);
		setError(null);
		abortController = new AbortController();
	};

	return (
		<GitHubAuthContext.Provider value={{ user, error, login, logout }}>
			{children}
		</GitHubAuthContext.Provider>
	);
};
