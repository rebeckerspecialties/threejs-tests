import { Header } from '@/components';
import { defined } from '@/drawables/utils/utils';
import { useGitHubAuthContext } from '@/providers';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
	const { user } = useGitHubAuthContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (!defined(user?.token)) {
			navigate('/login');
		}
	}, [user, navigate]);

	return (
		<>
			<Header />
			<Outlet />
		</>
	);
};

export default Home;
