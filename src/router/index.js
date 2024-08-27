import { createRouter, createWebHistory } from 'vue-router';
import { hasPermission, hasRouteAccess } from '@/modules/auth';

const isAuthenticated = !!window.localStorage.getItem('access_token');

const removeAccessToken = () => {
	window.localStorage.removeItem('access_token');
	window.localStorage.removeItem('user');
};

if (!isAuthenticated) {
	removeAccessToken();
}

const getUserRoles = () => {
	let roles = [];

	try {
		roles = JSON.parse(window.localStorage.getItem('user'))?.roles ?? [];
	} catch (ex) {
		roles = [];
	}

	return roles;
};

const roles = getUserRoles();

// TODO: Validate user roles
const dashboardRoute = () => {
	// if (hasPermission(['superadmin', 'admin'], roles)) {
	// 	return import('@/views/Admin/Dashboard.vue');
	// } else if (hasPermission(['viewer'], roles)) {
	// 	return import('@/views/Viewer/Dashboard.vue');
	// }
	return import('@/views/Admin/Dashboard.vue');
};

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			meta: {
				title: 'Home',
			},
			component: () => dashboardRoute(),
		},

		// System
		{
			path: '/system',
			name: 'system',
			meta: {
				title: 'System settings',
			},
			component: () => import('@/views/Admin/System/Index.vue'),
		},

		// Auth
		{
			path: '/auth/login',
			name: 'auth_login',
			meta: {
				title: 'Login',
				public: true,
			},
			component: () => import('@/views/Auth/Login.vue'),
		},
		{
			path: '/auth/check',
			name: 'auth_check',
			meta: {
				title: 'Validating user session',
				public: true,
			},
			component: () => import('@/views/Auth/Check.vue'),
		},
		{
			path: '/auth/register',
			name: 'auth_register',
			meta: {
				title: 'Register',
				public: true,
			},
			component: () => import('@/views/Auth/Register.vue'),
		},
		{
			path: '/auth/recover',
			name: 'auth_recover',
			meta: {
				title: 'Password recovery',
				public: true,
			},
			component: () => import('@/views/Auth/Recover.vue'),
		},

		// Administrator
		{
			path: '/admin/users',
			name: 'admin_users',
			meta: {
				title: 'Manage users',
				roles: ['superadmin', 'admin'],
			},
			component: () => import('@/views/Admin/Users/Index.vue'),
		},
		{
			path: '/admin/users/review',
			name: 'admin_users_review',
			meta: {
				title: 'Users pending activation',
				roles: ['superadmin', 'admin'],
			},
			component: () => import('@/views/Admin/Users/Review.vue'),
		},

		// // User
		// {
		// 	path: '/user/settings',
		// 	name: 'user_settings',
		// 	meta: {
		// 		title: 'User settings',
		// 	},
		// 	component: () => import('@/views/User/Profile.vue'),
		// },

		// Errors
		{
			path: '/:pathMatch(.*)*',
			name: '404',
			meta: {
				title: 'Not Found - HTTP 404',
				public: true,
			},
			component: () => import('@/views/Errors/404.vue'),
		},
		{
			path: '/403',
			name: '403',
			meta: {
				title: 'Forbidden - HTTP 403',
				public: true,
			},
			component: () => import('@/views/Errors/403.vue'),
		},
	],
});

const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';

router.beforeEach((to, from, next) => {
	// Set title
	document.title = to?.meta?.title
		? `${to?.meta?.title} - ${defaultTitle}`
		: `${defaultTitle} - ${defaultDescription}`;

	if (!isAuthenticated && (to?.meta?.public ?? false) !== true) {
		if (to.name === 'auth_login') {
			return next();
		}

		return next({ name: 'auth_login' });
	}

	// Auth guard
	if (isAuthenticated) {
		// if (!hasRouteAccess(to?.meta?.roles ?? [], roles)) {
		// 	removeAccessToken();
		// 	return next({ name: '403' });
		// }

		if (['auth_login', 'auth_register']?.includes(to.name)) {
			return next({ name: 'auth_check' });
		}
	}

	return next();
});

export default router;
