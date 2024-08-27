import axios from 'axios';
import endpoints from '@/modules/endpoints';
import { isValidDate } from '@/modules/utils';

const http = axios;
http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
http.defaults.withCredentials = import.meta.env.PROD;

const csrfSuccessMiddleware = (config) => {
	const allowedMethods = ['post', 'patch', 'put', 'delete'];

	if (!allowedMethods?.includes(config?.method)) {
		return config;
	}

	const csrfValue = window.localStorage.getItem('csrf');
	const csrfDate = new Date(csrfValue);
	const now = new Date();

	// CSRF cookie
	if (
		!csrfValue ||
		!isValidDate(csrfDate) ||
		(isValidDate(csrfDate) && csrfDate.getTime() < now.getTime())
	) {
		const newDate = new Date();
		newDate.setHours(
			now.getHours(),
			now.getMinutes() + 50,
			now.getSeconds(),
			now.getMilliseconds(),
		);

		if (isValidDate(newDate)) {
			http.get(endpoints?.system?.csrf)
				.then(() => {
					window.localStorage.setItem('csrf', newDate);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}

	return config;
};

const permissionsErrorMiddleware = (error) => {
	// Force login
	if (
		[403]?.includes(error?.response?.status) ||
		error?.code === 'ERR_NETWORK'
	) {
		window.localStorage.removeItem('access_token');
		window.localStorage.removeItem('user');
		window.localStorage.removeItem('csrf');
		window.location.reload();
	}

	return Promise.reject(error);
};

http.interceptors.request.use(csrfSuccessMiddleware, null);
http.interceptors.response.use(null, permissionsErrorMiddleware);

export default http;
