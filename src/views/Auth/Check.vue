<script setup>
import { ref, inject, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import Guest from '@/layouts/Guest.vue';
import Alert from '@/components/Alert.vue';
import endpoints from '@/modules/endpoints';

const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';

const http = inject('http');
const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
const errors = ref([]);

onBeforeMount(async () => {
	auth?.guard()
		.then((token) => {
			loading.value = true;
			http.post(endpoints?.auth?.check, null, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then((response) => {
					if (response?.status === 200) {
						window.location.href = new URL(
							router.resolve({ name: 'home' })?.href,
							window.location.origin,
						)?.href;
					}
				})
				.catch((error) => {
					errors.value = error?.response?.data?.error ?? [
						'Internal error.',
					];
					auth?.clean();
					setTimeout(() => {
						router.push({ name: 'auth_login' });
					}, 5000);
				})
				.finally(() => {
					loading.value = false;
				});
		})
		.catch((error) => {
			loading.value = false;
			errors.value = [error];
			setTimeout(() => {
				router.push({ name: 'auth_login' });
			}, 5000);
			return;
		});
});
</script>

<template>
	<Guest>
		<div
			class="flex flex-col flex-wrap gap-4 text-gray-600 leading-normal text-center"
		>
			<div>
				<h1 class="font-bold text-lg">
					Loggin in to
					<abbr :title="defaultDescription">{{ defaultTitle }}</abbr>
				</h1>
				<p v-if="loading">Please wait while we verify your session.</p>
			</div>
			<template v-if="errors?.length > 0">
				<Alert type="error" title="Error logging in" :narrow="false">{{
					errors?.join('\n')
				}}</Alert>

				<div class="text-gray-600 leading-normal text-center">
					You will be redirected automatically to the login page.
				</div>
				<RouterLink
					:to="{ name: 'auth_login' }"
					class="whitespace-nowrap bg-green-600 hover:bg-green-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded-sm w-fit mx-auto"
				>
					<Icon
						icon="heroicons:arrow-left-on-rectangle-solid"
						:inline="true"
						class="inline-block mr-1"
					/>
					Log in
				</RouterLink>
			</template>
			<div
				v-if="loading"
				class="flex flex-col items-center justify-center gap-2 w-full"
			>
				<Icon
					icon="svg-spinners:bars-scale"
					class="w-16 h-16 drop-shadow-md text-sky-700"
				/>
				<div class="text-center select-none drop-shadow-md">
					Loading
					<Icon
						icon="svg-spinners:3-dots-move"
						:inline="true"
						class="inline-block"
					/>
				</div>
			</div>
		</div>
	</Guest>
</template>
