<script setup>
import { ref, onBeforeMount, inject, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import {
	useVueTable,
	FlexRender,
	getCoreRowModel,
	getSortedRowModel,
} from '@tanstack/vue-table';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import Loader from '@/components/Loader.vue';
import endpoints from '@/modules/endpoints';
import { formatDateTime } from '@/modules/utils';

const router = useRouter();
const http = inject('http');
const auth = useAuthStore();
const loading = ref(true);
const notifications = ref([]);
const sorting = ref([]);
const reports = ref({});
const reportList = computed(() => {
	return reports.value?.data ?? [];
});
const searchFormData = ref({
	domain: '',
	effective_directive: '',
	in_search: false,
});

const resetSearchFormData = () => {
	searchFormData.value = {
		domain: '',
		effective_directive: '',
		in_search: false,
	};

	loadCSPReports();
};

const handleSearch = (e) => {
	e.preventDefault();

	searchFormData.value.in_search = true;
	let searchData = searchFormData.value;

	if (searchData?.domain?.length < 1) {
		searchData = {
			...searchData,
			domain: null,
		};
	}

	if (searchData?.effective_directive?.length < 1) {
		searchData = {
			...searchData,
			effective_directive: null,
		};
	}

	loading.value = true;
	http.post(endpoints?.csp?.reports?.search, searchData, {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	})
		.then((response) => {
			reports.value = response?.data ?? {};
		})
		.catch((error) => {
			const errorList = error?.response?.data?.error ?? [];

			if (errorList?.length > 0) {
				notifications.value?.push({
					type: 'error',
					title: 'Error searching CSP reports',
					message: errorList?.join('\n'),
				});
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const setSorting = (update) => {
	sorting.value =
		typeof update === 'function' ? update(sorting.value) : update;
};

const columns = [
	{
		accessorKey: 'blocked_uri',
		header: 'Blocked URI',
		cell: (info) => {
			return h(
				'div',
				{ class: 'text-sm font-mono truncate', title: info.getValue() },
				info.getValue(),
			);
		},
	},
	{
		accessorKey: 'violated_directive',
		header: 'Violated directive',
		cell: (info) => {
			return h(
				'div',
				{ class: 'text-sm font-mono truncate', title: info.getValue() },
				info.getValue(),
			);
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Reported',
		cell: (info) => {
			return h(
				'div',
				{ class: 'text-sm font-mono truncate', title: info.getValue() },
				formatDateTime(info.getValue(), true),
			);
		},
	},
	{
		accessorKey: 'actions',
		header: 'Actions',
		enableSorting: false,
		cell: () => {
			const buttons = [];
			const canDelete = true;

			if (canDelete) {
				buttons.push(
					h(
						'button',
						{
							type: 'button',
							class: 'rounded transition ease-in-out duration-75 bg-red-500/40 hover:bg-red-500 text-gray-100 hover:text-gray-50 px-2 py-1 disabled:cursor-not-allowed',
							title: 'Delete',
							disabled: loading.value,
							onClick: () => {},
						},
						h(Icon, { icon: 'heroicons:trash-solid' }),
					),
				);
			}

			return h(
				'div',
				{
					class: 'flex items-center justify-center gap-2',
				},
				buttons,
			);
		},
	},
];

const table = useVueTable({
	get data() {
		return reportList.value;
	},
	columns,
	state: {
		get sorting() {
			return sorting.value;
		},
	},
	onSortingChange: setSorting,
	getCoreRowModel: getCoreRowModel(),
	getSortedRowModel: getSortedRowModel(),
	debugTable: import.meta.env.DEV,
	debugHeaders: import.meta.env.DEV,
	debugColumns: import.meta.env.DEV,
});

const handlePagination = (direction) => {
	direction = (direction ?? '')?.trim();

	if (direction?.length < 1) {
		return;
	}

	let url = null;

	if (direction === 'prev' && reports.value?.prev) {
		url = reports.value?.prev;
	} else if (direction === 'next' && reports.value?.next) {
		url = reports.value?.next;
	}

	if (!url) {
		return;
	}

	const config = {
		method: searchFormData.value.in_search === true ? 'post' : 'get',
		url,
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	};

	if (searchFormData.value.in_search === true) {
		config.data = searchFormData.value;
	}

	loading.value = true;
	http(config)
		.then((response) => {
			reports.value = response?.data;
		})
		.catch((error) => {
			console.error(error);
		})
		.finally(() => {
			loading.value = false;
		});
};

const loadCSPReports = () => {
	loading.value = true;
	http.get(endpoints?.csp?.reports?.index, {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	})
		.then((response) => {
			reports.value = response?.data ?? {};
		})
		.catch((error) => {
			console.error(error);
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

	loadCSPReports();
});
</script>

<template>
	<Authenticated>
		<Loader v-if="loading" />
		<form
			@submit.prevent="handleSearch"
			method="post"
			class="flex flex-wrap items-start gap-4 bg-white p-4 shadow border rounded mb-4"
		>
			<div class="flex shrink flex-col justify-center gap-2">
				<label for="domain" class="text-sm font-semibold text-gray-500"
					>Domain</label
				>
				<input
					type="text"
					id="domain"
					name="domain"
					maxlength="5"
					class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
					v-model="searchFormData.domain"
					:disabled="loading"
				/>
			</div>

			<div class="flex shrink flex-col justify-center gap-2">
				<label
					for="effective_directive"
					class="text-sm font-semibold text-gray-500"
					>Effective directive</label
				>
				<input
					type="text"
					id="effective_directive"
					name="effective_directive"
					maxlength="5"
					class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
					v-model="searchFormData.effective_directive"
					:disabled="loading"
				/>
			</div>

			<div class="flex shrink flex-col justify-center gap-2">
				<button
					@click.prevent="handleSearch"
					class="whitespace-nowrap bg-green-600 hover:bg-green-600/70 text-gray-50 hover:text-white text-sm transition ease-in-out duration-75 px-2 py-1 rounded w-full disabled:cursor-not-allowed"
					:disabled="loading"
				>
					<Icon
						icon="heroicons:magnifying-glass-solid"
						:inline="true"
						class="inline-block mr-1"
					/>
					Search
				</button>
				<button
					@click.prevent="resetSearchFormData"
					class="whitespace-nowrap bg-yellow-600 hover:bg-yellow-600/70 text-gray-50 hover:text-white text-sm transition ease-in-out duration-75 px-2 py-1 rounded w-full disabled:cursor-not-allowed"
					:disabled="loading"
				>
					<Icon
						icon="heroicons:x-mark-solid"
						:inline="true"
						class="inline-block mr-1"
					/>
					Clear
				</button>
			</div>
		</form>

		<div class="overflow-auto bg-white border rounded shadow-sm mb-4 mt-4">
			<div class="table table-fixed w-full">
				<div
					v-for="headerGroup in table.getHeaderGroups()"
					:key="headerGroup?.id"
					class="table-header-group"
				>
					<div class="table-row bg-sky-700 text-gray-50">
						<div
							v-for="header in headerGroup?.headers"
							:key="header.id"
							class="table-cell align-middle px-2 py-1 font-semibold"
							:class="{
								'w-64': !['created_at', 'actions']?.includes(
									header.id,
								),
								'w-36 text-center': [
									'created_at',
									'actions',
								]?.includes(header.id),
							}"
							@click="
								header.column.getToggleSortingHandler()?.(
									$event,
								)
							"
						>
							<div
								v-if="!header.isPlaceholder"
								class="select-none"
								:class="{
									'cursor-pointer whitespace-nowrap':
										header.column.getCanSort(),
								}"
							>
								<FlexRender
									:render="header.column.columnDef.header"
									:props="header.getContext()"
								/>
								<Icon
									v-if="header.column.getIsSorted() === 'asc'"
									icon="heroicons:chevron-up-solid"
									:inline="true"
									class="inline-block ml-1"
								/>
								<Icon
									v-if="
										header.column.getIsSorted() === 'desc'
									"
									icon="heroicons:chevron-down-solid"
									:inline="true"
									class="inline-block ml-1"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="table-row-group">
					<div
						v-for="row in table.getRowModel().rows"
						:key="row.id"
						class="table-row hover:bg-gray-200 transition ease-in-out duration-75"
						:class="{
							'bg-gray-50': row?.original?.deleted_at !== null,
						}"
					>
						<div
							v-for="cell in row.getVisibleCells()"
							:key="cell.id"
							class="table-cell align-middle border-t p-2"
							:class="{
								'text-center': [
									'created_at',
									'actions',
								]?.includes(cell.column.id),
							}"
						>
							<FlexRender
								:render="cell.column.columnDef.cell"
								:props="cell.getContext()"
							/>
						</div>
					</div>
				</div>
			</div>
			<div
				v-if="table.getRowModel().rows.length < 1"
				class="text-sm bg-gray-50 text-gray-600 text-center px-4 py-2"
			>
				No records
			</div>
		</div>

		<div
			class="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-sm"
		>
			<button
				type="button"
				class="rounded transition ease-in-out duration-75 disabled:opacity-25 text-gray-400 p-1"
				:class="{
					'hover:text-gray-600': reports?.prev,
				}"
				@click.prevent="handlePagination('prev')"
				:disabled="loading || !reports?.prev"
			>
				<Icon icon="heroicons:chevron-left-solid" class="w-5 h-5" />
			</button>
			<div class="select-none">
				<Icon v-if="loading" icon="svg-spinners:tadpole" />
				<span v-else>{{
					(table.getRowModel().rows.length > 0 ? 1 : 0) +
					'-' +
					table.getRowModel().rows.length
				}}</span>
			</div>
			<button
				type="button"
				class="rounded transition ease-in-out duration-75 disabled:opacity-25 text-gray-400 p-1"
				:class="{
					'hover:text-gray-600': reports?.next,
				}"
				@click.prevent="handlePagination('next')"
				:disabled="loading || !reports?.next"
			>
				<Icon icon="heroicons:chevron-right-solid" class="w-5 h-5" />
			</button>
		</div>
	</Authenticated>

	<NotificationArea>
		<Notification
			v-for="(notification, index) in notifications"
			:key="index"
			:type="notification?.type"
			:title="notification?.title"
			>{{ notification?.message }}</Notification
		>
	</NotificationArea>
</template>
