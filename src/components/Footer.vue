<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
	class: {
		type: String,
		default: '',
	},
});

const supportPhone = import.meta.env.VITE_WHATSAPP_PHONE ?? '';
const company = {
	name: import.meta.env.VITE_COMPANY_NAME ?? '',
	url: import.meta.env.VITE_COMPANY_URL ?? '',
};
</script>

<template>
	<footer
		class="flex flex-col justify-center gap-2 text-sm text-gray-700 px-8 py-4"
		:class="{ [props?.class]: props?.class?.length > 0 }"
	>
		<hr class="border mb-4" />
		<div class="text-center">
			&copy; {{ new Date().getFullYear() }}
			<a
				:href="company?.url"
				class="transition ease-in-out duration-75 hover:text-gray-900 font-bold"
				>{{ company?.name }}</a
			>
		</div>
		<div class="flex flex-wrap items-center justify-center gap-4">
			<a
				href="https://x.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-black"
				title="X"
			>
				<Icon icon="fa6-brands:x-twitter" class="w-5 h-5" />
			</a>
			<a
				href="https://www.facebook.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-sky-600"
				title="Facebook"
			>
				<Icon icon="fa6-brands:facebook-f" class="w-5 h-5" />
			</a>
			<a
				href="https://www.instagram.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-rose-500"
				title="Instagram"
			>
				<Icon icon="fa6-brands:instagram" class="w-5 h-5" />
			</a>
			<a
				href="https://www.youtube.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-red-600"
				title="YouTube"
			>
				<Icon icon="fa6-brands:youtube" class="w-5 h-5" />
			</a>
			<a
				href="https://www.tiktok.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-black"
				title="TikTok"
			>
				<Icon icon="fa6-brands:tiktok" class="w-5 h-5" />
			</a>
			<a
				href="https://www.linkedin.com"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-sky-700"
				title="LinkedIn"
			>
				<Icon icon="fa6-brands:linkedin-in" class="w-5 h-5" />
			</a>
			<a
				href="https://www.threads.net"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-black"
				title="Threads"
			>
				<Icon icon="fa6-brands:threads" class="w-5 h-5" />
			</a>
			<a
				:href="`https://wa.me/${supportPhone}?text=Hi`"
				target="_blank"
				rel="external noopener noreferrer"
				class="transition ease-in-out duration-75 text-gray-500 hover:text-green-500"
				title="WhatsApp"
			>
				<Icon icon="fa6-brands:whatsapp" class="w-5 h-5" />
			</a>
		</div>
		<div class="flex flex-wrap items-center justify-center gap-4">
			<a
				:href="`${company?.url}/privacy-policy`"
				class="transition ease-in-out duration-75 hover:text-gray-900"
				>Privacy Policy</a
			>
		</div>
	</footer>
</template>
