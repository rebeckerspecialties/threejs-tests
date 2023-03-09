import { AppXR, Home, Login } from '@/containers';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Home />,
			children: [
				{
					path: '/',
					element: <AppXR />,
				},
			],
		},
		{
			path: '/login',
			element: <Login />,
		},
	],
	{ basename: '/threejs-tests' }, // GH project pages - this is the repo name
);
