<script setup>
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import Guest from '@/layouts/Guest.vue';
</script>

<template>
	<Guest>
		<div
			class="flex flex-col flex-wrap gap-4 text-gray-600 leading-normal text-center"
		>
			<h1 class="font-bold text-lg">Not Found - HTTP 404</h1>
			<div>
				The resource you are looking for does not exist or has been
				deleted.
			</div>
			<RouterLink
				:to="{ name: 'home' }"
				class="whitespace-nowrap bg-green-600 hover:bg-green-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded w-fit mx-auto"
			>
				<Icon
					icon="heroicons:arrow-uturn-left-solid"
					:inline="true"
					class="inline-block mr-1"
				/>
				Home
			</RouterLink>
		</div>
	</Guest>
</template>
