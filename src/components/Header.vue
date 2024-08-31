<script setup>
import { ref, inject } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import Dropdown from '@/components/Dropdown.vue';
import endpoints from '@/modules/endpoints';
import { hasPermission } from '@/modules/auth';

const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';

const props = defineProps(['class']);
const http = inject('http');
const router = useRouter();
const auth = useAuthStore();
const open = ref(false);
const loading = ref(false);
const roles = auth?.userData?.roles ?? [];

const toggle = () => {
	open.value = !open.value;
};

const handleLogout = (e) => {
	e.preventDefault();

	loading.value = true;
	http.post(endpoints?.auth?.logout, null, {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	}).finally(() => {
		loading.value = false;
		auth?.clean();
		router.go();
	});
};
</script>

<template>
	<header
		class="bg-sky-900 text-gray-50 shadow sticky top-0 left-0 right-0 z-10"
		:class="{ [props?.class]: props?.class?.length > 0 }"
	>
		<div
			class="flex flex-wrap items-center justify-between gap-4 mx-auto px-4 md:px-6 lg:px-8 py-2"
		>
			<RouterLink
				:to="{ name: 'home' }"
				:title="`${defaultTitle} - ${defaultDescription}`"
				class="flex flex-wrap items-center justify-between gap-1 font-bold"
			>
				<div
					class="block bg-logo bg-no-repeat bg-contain bg-center w-10 h-10"
				></div>
				{{ defaultTitle }}
			</RouterLink>
			<button
				type="button"
				class="navbar-toggler lg:hidden flex justify-center p-2 text-xl bg-sky-700 hover:bg-sky-700/70 text-gray-50 rounded disabled:cursor-not-allowed"
				aria-label="Toggle menu"
				@click="toggle"
			>
				<Icon v-if="open" icon="heroicons:x-mark-solid" class="block" />
				<Icon v-else icon="heroicons:bars-3-solid" class="block" />
			</button>
			<div
				:class="{ hidden: !open }"
				class="flex lg:flex flex-wrap grow flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-end w-full lg:w-auto gap-2 lg:gap-4"
			>
				<Dropdown
					class="w-fit rounded transition ease-in-out duration-75"
					trigger-class="hover:bg-sky-700/70 text-gray-50"
					open-class="bg-gray-700/70"
				>
					<template #trigger>
						<Icon
							icon="heroicons:user-solid"
							:inline="true"
							class="inline-block"
						/>
						{{ auth?.userData?.email }}
						<Icon
							icon="heroicons:chevron-down-solid"
							:inline="true"
							class="inline-block"
						/>
					</template>
					<template #content>
						<RouterLink
							v-if="false"
							:to="{ name: 'user_settings' }"
							class="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-75 ease-in-out"
						>
							<Icon
								icon="heroicons:cog-6-tooth-solid"
								:inline="true"
								class="inline-block mr-1"
							/>User settings
						</RouterLink>
						<RouterLink
							v-if="hasPermission(['admin', 'superadmin'], roles)"
							:to="{ name: 'system' }"
							class="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-75 ease-in-out"
						>
							<Icon
								icon="heroicons:wrench-screwdriver-solid"
								:inline="true"
								class="inline-block mr-1"
							/>
							System settings
						</RouterLink>
						<RouterLink
							v-if="hasPermission(['superadmin'], roles)"
							:to="{ name: 'admin_users' }"
							class="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-75 ease-in-out"
						>
							<Icon
								icon="heroicons:user-group-solid"
								:inline="true"
								class="inline-block mr-1"
							/>
							Manage users
						</RouterLink>
						<button
							type="button"
							@click.prevent="handleLogout"
							:disabled="loading"
							class="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-75 ease-in-out"
						>
							<Icon
								v-if="loading"
								icon="svg-spinners:tadpole"
								:inline="true"
								class="inline-block mr-1"
							/>
							<Icon
								v-else
								icon="heroicons:arrow-right-on-rectangle-solid"
								:inline="true"
								class="inline-block mr-1"
							/>
							Log out
						</button>
					</template>
				</Dropdown>
			</div>
		</div>
	</header>
</template>
