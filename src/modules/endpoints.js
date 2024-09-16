const apiPath = (import.meta.env.VITE_API_HOST ?? '') + '/api/v1';

const endpoints = {
	system: {
		cache: {
			purge: apiPath + '/system/cache/purge',
		},
		csrf: apiPath + '/system/csrf',
	},
	auth: {
		login: apiPath + '/auth/login',
		check: apiPath + '/auth/check',
		logout: apiPath + '/auth/revoke',
		register: apiPath + '/auth/register',
		recover: {
			index: apiPath + '/auth/recover',
			validate: apiPath + '/auth/recover/validate',
			update: apiPath + '/auth/recover/update',
		},
	},
	activations: {
		index: apiPath + '/activations/users/all',
		review: apiPath + '/activations/review/:id',
	},
	csp: {
		reports: {
			index: apiPath + '/csp/reports/all',
		},
	},
};

export default endpoints;
