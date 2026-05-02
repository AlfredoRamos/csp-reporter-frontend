import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { parseAccessToken } from '@/modules/auth';
import { isValidUuidv4 } from '@/modules/utils';

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
		let data = null; // eslint-disable-line no-useless-assignment

		try {
			data = JSON.parse(user.value) ?? null;
		} catch {
			data = null;
		}

		return data;
	});

	const clean = () => {
		token.value = null;
		user.value = null;
	};

	const guard = async () => {
		if (!accessToken.value) {
			clean();
			return Promise.reject('Invalid access token.');
		}

		const data = await parseAccessToken(accessToken.value);
		const now = Math.round(new Date()?.getTime() / 1000);

		if (
			!data ||
			now > data?.exp ||
			now < data?.nbf ||
			!isValidUuidv4(data?.user?.id)
		) {
			clean();
			return Promise.reject('Invalid user data.');
		}

		return accessToken.value;
	};

	return { accessToken, setAccessToken, userData, clean, guard };
});
