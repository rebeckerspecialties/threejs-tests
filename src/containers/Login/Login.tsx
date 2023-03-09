import { defined } from '@/drawables/utils/utils';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useGitHubAuthContext } from '@/providers';
import qs from 'query-string';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
	const { user, error: loginError, login } = useGitHubAuthContext();
	const queryParams = useQueryParams();
	const navigate = useNavigate();

	const navigateGitHubOAuth = () => {
		// mock local dev to make device test easier (localhost vs vite https ip)
		// disable this condition to debug possible api issues
		if (import.meta.env.DEV) {
			login('DevMockCode');
			return;
		}

		const queryStringObj = {
			client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
			scope: 'gist',
			redirect_uri: import.meta.env.VITE_GITHUB_REDIRECT_URI,
		};
		const url = `https://github.com/login/oauth/authorize?${qs.stringify(queryStringObj)}`;
		window.location.href = url;
	};

	useEffect(() => {
		if (defined(user?.token)) {
			navigate('/');
		} else if (defined(loginError)) {
			navigate('/login');
		}
	}, [user, loginError, navigate]);

	useEffect(() => {
		const code = queryParams.get('code');
		if (defined(code)) {
			login(code);
		}
	}, [queryParams, login]);

	return (
		<>
			<button className="gh-login-button" onClick={navigateGitHubOAuth}>
				Login with GitHub
			</button>
		</>
	);
};

export default Login;
