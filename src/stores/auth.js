import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

export const useAuthStore = defineStore('auth', () => {
	const token = useStorage('access_token', null);
	const user = useStorage('user', null);

	const accessToken = computed(() => {
		return token.value;
	});

	const setAccessToken = (jwe) => {
		token.value = jwe ?? null;
	};

	const userData = computed(() => {
		try {
			return JSON.parse(user.value);
		} catch (ex) {
			return null;
		}
	});

	const setUserData = (data) => {
		user.value = JSON.stringify({
			first_name: data?.first_name ?? null,
			last_name: data?.last_name ?? null,
			email: data?.email ?? null,
			roles: data?.roles ?? [],
		});
	};

	const clean = () => {
		token.value = null;
	};

	return { accessToken, setAccessToken, userData, setUserData, clean };
});
