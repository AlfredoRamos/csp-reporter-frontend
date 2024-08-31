<script setup>
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useNavbarStore } from '@/stores/navbar';
import { useAuthStore } from '@/stores/auth';
import { hasPermission } from '@/modules/auth';

const props = defineProps(['class']);
const navbarToggle = useNavbarStore();
const auth = useAuthStore();
const roles = auth?.userData?.roles ?? [];
</script>

<template>
	<aside
		class="flex flex-col grow transition-all ease-in-out duration-200 h-full fixed top-0 left-0 bg-sky-900 text-gray-50 shadow-md drop-shadow-md overflow-hidden z-[5]"
		:class="{
			'w-16 hover:w-60 group/sidebar': navbarToggle.getState === 'auto',
			'w-60': navbarToggle.getState === 'open',
			'w-16': navbarToggle.getState === 'close',
			[props?.class]: props?.class?.length > 0,
		}"
	>
		<div
			class="flex flex-col grow justify-between gap-2 overflow-y-auto overflow-x-hidden p-4 mt-14"
		>
			<nav class="flex flex-col gap-2">
				<RouterLink
					:to="{ name: 'home' }"
					class="truncate px-2 py-1 rounded transition ease-in-out duration-75 bg-sky-700 hover:bg-sky-700/70 text-gray-50 whitespace-nowrap"
					active-class="bg-sky-700/70"
					title="Home"
				>
					<Icon
						icon="heroicons:home-solid"
						:inline="true"
						class="inline-block"
					/>
					<span
						:class="{
							'hidden group-hover/sidebar:inline-block group-hover/sidebar:ml-1':
								navbarToggle.getState === 'auto',
							'inline-block ml-1':
								navbarToggle.getState === 'open',
							hidden: navbarToggle.getState === 'close',
						}"
						>Home</span
					>
				</RouterLink>
				<template v-if="hasPermission(['superadmin', 'admin'], roles)">
					<RouterLink
						:to="{ name: 'admin_users_review' }"
						class="truncate px-2 py-1 rounded transition ease-in-out duration-75 bg-sky-700 hover:bg-sky-700/70 text-gray-50 whitespace-nowrap"
						active-class="bg-sky-700/70"
						title="Users review"
					>
						<Icon
							icon="heroicons:user-group-solid"
							:inline="true"
							class="inline-block"
						/>
						<span
							:class="{
								'hidden group-hover/sidebar:inline-block group-hover/sidebar:ml-1':
									navbarToggle.getState === 'auto',
								'inline-block ml-1':
									navbarToggle.getState === 'open',
								hidden: navbarToggle.getState === 'close',
							}"
							>Users review</span
						>
					</RouterLink>
				</template>
			</nav>
			<div class="flex items-center justify-center gap-2">
				<div
					class="px-2 py-1 rounded transition ease-in-out duration-75 hover:bg-sky-700/70 text-gray-50 cursor-pointer"
					@click="navbarToggle.toggleState()"
				>
					<Icon
						icon="heroicons:chevron-double-right-solid"
						v-if="navbarToggle.getState === 'auto'"
						title="Expand"
					/>
					<Icon
						icon="heroicons:chevron-double-left-solid"
						v-if="navbarToggle.getState === 'open'"
						title="Collapse"
					/>
					<Icon
						icon="heroicons:viewfinder-circle-solid"
						v-if="navbarToggle.getState === 'close'"
						title="Automatic"
					/>
				</div>
			</div>
		</div>
	</aside>
</template>
