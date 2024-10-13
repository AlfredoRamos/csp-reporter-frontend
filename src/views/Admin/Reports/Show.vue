<script setup>
import { ref, onBeforeMount, inject, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Alert from '@/components/Alert.vue';
import endpoints from '@/modules/endpoints';
import { formatDateTime, isValidUuid } from '@/modules/utils';

const http = inject('http');
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(false);
const isValid = computed(() => {
	return isValidUuid(route?.params?.id);
});
const report = ref({});

const loadReport = () => {
	if (!isValidUuid(route?.params?.id)) {
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
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

onBeforeMount(() => {
	if (!auth?.accessToken) {
		auth?.clean();
		router.push({ name: 'auth_login' });
		return;
	}

	if (!isValid.value) {
		return;
	}

	loadReport();
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
							class="font-semibold border-b w-full text-left pb-1 whitespace-nowrap"
						>
							<Icon
								icon="heroicons:building-office-2-solid"
								:inline="true"
								class="inline-block"
							/>
							Site
						</div>
						<div
							class="flex flex-wrap items-center justify-between gap-4 w-full"
						>
							<div
								class="flex flex-col items-start justify-center gap-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Report date
								</div>
								<div>
									{{
										formatDateTime(report?.created_at, true)
									}}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Site
								</div>
								<div>
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
								class="flex flex-col items-start justify-center gap-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Document URI
								</div>
								<div>
									{{ report?.document_uri }}
								</div>
							</div>
							<div
								class="flex flex-col items-start justify-center gap-2"
							>
								<div
									class="text-sm font-semibold text-gray-500"
								>
									Blocked URI
								</div>
								<div>
									{{ report?.blocked_uri }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</Authenticated>
</template>
