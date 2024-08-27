<script setup>
import { Icon } from '@iconify/vue';

const hCaptchaConfig = {
	size: import.meta.env.VITE_HCAPTCHA_SIZE ?? 'normal',
};
</script>

<template>
	<Teleport to="body" v-if="hCaptchaConfig?.size === 'invisible'">
		<div
			class="group flex flex-wrap items-center justify-center gap-2 select-none bg-gray-50 fixed right-3 bottom-3 p-2 border rounded shadow-sm"
		>
			<div
				class="hidden group-hover:flex group-hover:border-r flex-col justify-center gap-1 text-sm text-gray-500 px-2"
			>
				<div class="font-bold">Protected by hCaptcha</div>
				<div class="flex flex-wrap items-center gap-2">
					<a
						href="https://www.hcaptcha.com/privacy"
						target="_blank"
						rel="external noopener noreferrer nofollow"
						class="transition ease-in-out duration-75 hover:text-gray-600 whitespace-nowrap"
						>Privacy
						<Icon
							icon="heroicons:arrow-top-right-on-square-solid"
							:inline="true"
							class="inline-block ml-1"
						/>
					</a>
					<a
						href="https://www.hcaptcha.com/terms"
						target="_blank"
						rel="external noopener noreferrer nofollow"
						class="transition ease-in-out duration-75 hover:text-gray-600 whitespace-nowrap"
						>Tems
						<Icon
							icon="heroicons:arrow-top-right-on-square-solid"
							:inline="true"
							class="inline-block ml-1"
						/>
					</a>
				</div>
			</div>
			<div class="flex items-center justify-center">
				<div class="w-12 h-12 bg-hcaptcha bg-no-repeat"></div>
			</div>
		</div>
	</Teleport>
</template>
