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
	{ basename: '/webapp' }, // GH project pages - this is the repo name
);
