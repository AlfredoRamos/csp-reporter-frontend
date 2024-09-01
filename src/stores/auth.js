import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { parseAccessToken } from '@/modules/auth';

export const useAuthStore = defineStore('auth', () => {
	const token = useStorage('access_token', null);
	const user = useStorage('user', null);

	const accessToken = computed(() => {
		return token.value;
	});

	const setAccessToken = async (jwe) => {
		token.value = jwe ?? null;

		const data = await parseAccessToken(jwe);
		delete data?.user?.id;

		user.value = JSON.stringify(data?.user);
	};

	const userData = computed(() => {
		try {
			return JSON.parse(user.value);
		} catch (ex) {
			return null;
		}
	});

	const clean = () => {
		token.value = null;
		user.value = null;
	};

	return { accessToken, setAccessToken, userData, clean };
});
