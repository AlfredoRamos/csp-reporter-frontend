<script setup>
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const homeRoute = router.resolve({ name: 'home' });
</script>

<template>
	<nav class="bg-white text-gray-600 px-4 py-2 shadow border rounded mb-4">
		<ul class="flex flex-wrap items-center gap-2">
			<li>
				<RouterLink
					:to="{ name: homeRoute?.name }"
					class="truncate transition ease-in-out duration-75 whitespace-nowrap"
					active-class="text-gray-900"
				>
					<Icon
						icon="heroicons:home-solid"
						:inline="true"
						class="inline-block"
					/>
					<span class="ml-1">{{ homeRoute?.meta?.title }}</span>
				</RouterLink>
			</li>
			<template v-if="route?.name !== homeRoute?.name">
				<li>
					<Icon
						icon="heroicons:chevron-right-solid"
						class="select-none text-gray-400"
					/>
				</li>
				<li>
					<RouterLink
						:to="{ name: route?.name }"
						class="truncate transition ease-in-out duration-75 whitespace-nowrap"
						active-class="text-gray-900"
					>
						{{ route?.meta?.title }}
					</RouterLink>
				</li>
			</template>
		</ul>
	</nav>
</template>
