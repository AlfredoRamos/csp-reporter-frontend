<script setup>
import { ref, onBeforeMount, inject, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Alert from '@/components/Alert.vue';
import endpoints from '@/modules/endpoints';
import { formatDateTime, isValidUuidv4 } from '@/modules/utils';

const http = inject('http');
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(false);
const isValid = computed(() => {
	return isValidUuidv4(route?.params?.id);
});
const report = ref({});

const loadReport = () => {
	if (!isValidUuidv4(route?.params?.id)) {
		return;
	}

	loading.value = true;
	http.get(endpoints?.csp?.reports?.get?.replace(':id', route?.params?.id), {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	})
		.then((response) => {
			report.value = response?.data?.data ?? {};
		})
		.catch((error) => {
			const errs = error?.response?.data?.error;

			if (Array.isArray(errs)) {
				console.error(errs?.join('\n'));
				return;
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onBeforeMount(() => {
	auth?.guard()
		.then(() => {
			if (!isValid.value) {
				return;
			}

			loadReport();
		})
		.catch(() => {
			router.push({ name: 'auth_login' });
			return;
		});
});
</script>

<template>
	<Authenticated>
		<Alert v-if="!isValid" type="error">
			The Content Security Policy violation report is invalid.
			<RouterLink
				:to="{ name: 'reports_index' }"
				class="font-semibold ml-1 whitespace-nowrap"
				><Icon
					icon="heroicons:arrow-uturn-left-solid"
					:inline="true"
					class="inline-block mr-1"
				/>Return to index
			</RouterLink>
		</Alert>

		<template v-else>
			<div class="flex flex-wrap items-start justify-center gap-4 mb-4">
				<div
					class="flex flex-col justify-center gap-8 bg-white border rounded shadow-md px-4 py-2 flex-1"
				>
					<div class="flex flex-col items-start justify-start gap-4">
						<div
							class="font-semibold border-b w-full text-left pb-1"
						>
							<div
								class="flex flex-wrap items-center justify-between"
							>
								<div class="whitespace-nowrap">
									<Icon
										icon="heroicons:building-office-2-solid"
										:inline="true"
										class="inline-block"
									/>
									Site
								</div>
								<div>
									{{
										formatDateTime(report?.created_at, true)
									}}
								</div>
							</div>
						</div>
						<div
							class="grid grid-cols-12 items-start content-start gap-4 w-full"
						>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-3"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Site
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{ report?.site?.domain
									}}<template v-if="report?.site?.title"
										>·
										{{
											report?.site?.title ?? '---'
										}}</template
									>
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-4"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Document URI
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{ report?.document_uri }}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-4"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Blocked URI
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{ report?.blocked_uri }}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-1"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Status code
								</div>
								<div class="font-mono">
									{{ report?.status_code }}
								</div>
							</div>
						</div>
						<div
							class="grid grid-cols-12 items-start content-start gap-4 w-full"
						>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Effective directive
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{
										report?.effective_directive
											? report?.effective_directive
											: '---'
									}}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-5"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Violated directive
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{ report?.violated_directive }}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-4"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Referrer
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{
										report?.referrer
											? report?.referrer
											: '---'
									}}
								</div>
							</div>
						</div>
						<div
							class="grid grid-cols-12 items-start content-start gap-4 w-full"
						>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-4"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Source file
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{
										report?.source_file
											? report?.source_file
											: '---'
									}}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-3 xl:col-span-1"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Line number
								</div>
								<div class="font-mono">
									{{
										report?.line_number
											? report?.line_number
											: '---'
									}}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-3 xl:col-span-1"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Column number
								</div>
								<div class="font-mono">
									{{
										report?.column_number
											? report?.column_number
											: '---'
									}}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-4"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Script sample
								</div>
								<code
									v-if="report?.script_sample"
									class="break-all line-clamp-2 text-sm font-mono bg-gray-100 border p-1 rounded w-full"
								>
									{{ report?.script_sample }}
								</code>
								<div v-else class="font-mono">---</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-6 xl:col-span-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Disposition
								</div>
								<div class="break-all line-clamp-2 font-mono">
									{{
										report?.disposition
											? report?.disposition
											: '---'
									}}
								</div>
							</div>
						</div>
						<div
							class="grid grid-cols-12 items-start content-start gap-4 w-full"
						>
							<div
								class="flex flex-col items-start justify-center gap-2 col-span-12"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Original policy
								</div>
								<code
									v-if="report?.original_policy"
									class="break-all text-sm font-mono bg-gray-100 border p-1 rounded w-full"
								>
									{{ report?.original_policy }}
								</code>
								<div v-else class="font-mono">---</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</Authenticated>
</template>
