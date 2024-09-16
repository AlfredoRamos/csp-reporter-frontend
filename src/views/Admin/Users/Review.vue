<script setup>
import { ref, computed, inject, h, onBeforeMount } from 'vue';
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
import Modal from '@/components/Modal.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import endpoints from '@/modules/endpoints';
import { isValidUuid } from '@/modules/utils';
import { hasPermission } from '@/modules/auth';

const http = inject('http');
const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const sorting = ref([]);
const errors = ref({});
const notifications = ref([]);
const formData = ref({
	user: {
		id: null,
		first_name: null,
		last_name: null,
		email: null,
	},
	approved: false,
	reason: null,
});
const users = ref({});
const userList = computed(() => {
	return users.value?.data ?? [];
});
const modalUser = ref(null);

const resetFormData = () => {
	formData.value = {
		user: {
			id: null,
			first_name: null,
			last_name: null,
			email: null,
		},
		approved: false,
		reason: null,
	};

	if (loading.value === true) {
		loading.value = false;
	}

	errors.value = {};
};

const resetModalData = () => {
	modalUser.value.open = false;
};

const handleUserReview = (user, aprove) => {
	if (!isValidUuid(user?.id)) {
		notifications.value?.push({
			type: 'warning',
			title: 'Invalid selection',
			message: 'The user selection is invalid.',
		});
		return;
	}

	formData.value = { ...formData.value, user };
	formData.value = { ...formData.value, approved: aprove };

	modalUser.value.open = true;
};

const handleModalUserAccept = () => {
	if (!isValidUuid(formData.value?.user?.id)) {
		notifications.value?.push({
			type: 'error',
			title: 'Invalid user information',
			message: 'The user selection is invalid.',
		});
		return;
	}

	if (formData.value?.approved === false && !formData.value?.reason) {
		errors.value = {
			...errors.value,
			reason: ['Please, enter a denial reason.'],
		};
		return;
	}

	if (formData.value?.approved === true) {
		formData.value = { ...formData.value, reason: null };
	}

	loading.value = true;
	http.patch(
		endpoints?.activations?.review?.replace(
			':id',
			formData.value?.user?.id,
		),
		{
			approved: formData.value?.approved,
			reason: formData.value?.reason,
		},
		{
			headers: {
				Authorization: `Bearer ${auth?.accessToken}`,
			},
		},
	)
		.then(() => {
			const status = formData.value?.approved ? 'approved' : 'denied';

			notifications.value?.push({
				type: 'success',
				title: 'User reviewed succesfully',
				message: `The user has been ${status} succesfully.`,
			});

			loadUsers();
		})
		.catch((error) => {
			notifications.value?.push({
				type: 'error',
				title: 'User review failed',
				message: error?.response?.data?.error?.join('\n'),
			});
		})
		.finally(() => {
			loading.value = false;
			resetModalData();
		});
};

const handleModalUserCancel = () => {
	resetModalData();
	resetFormData();
};

const handleReason = (e) => {
	const val = e.target.value?.trim();

	if (!val) {
		errors.value = {
			...errors.value,
			reason: ['Please, enter a denial reason.'],
		};
		return;
	}

	errors.value = { ...errors.value, reason: null };
};

const setSorting = (update) => {
	sorting.value =
		typeof update === 'function' ? update(sorting.value) : update;
};

const columns = [
	{
		accessorKey: 'user.email',
		header: 'Email',
		cell: (info) => {
			const val = info.getValue()?.trim();
			return h(
				'a',
				{ href: `mailto:${val}`, class: 'text-sm font-mono' },
				val,
			);
		},
	},
	{
		accessorKey: 'user.active',
		header: 'Status',
		cell: (info) => {
			const val = info.getValue() && info?.row?.original?.approved;
			const cssClass = val
				? 'bg-green-100 text-green-900'
				: 'bg-yellow-100 text-yellow-900';

			return h(
				'span',
				{
					class:
						'font-semibold text-sm px-2 py-1 rounded-full' +
						(cssClass?.length > 0 ? ' ' + cssClass : ''),
					title: val,
				},
				val ? 'Active' : 'Inactive',
			);
		},
	},
	{
		accessorKey: 'reviewed_by.email',
		header: 'Reviewed by',
		cell: (info) => {
			const val = info.getValue()?.trim();
			return h('span', { class: 'text-sm font-mono' }, val);
		},
	},
	{
		accessorKey: 'actions',
		header: 'Actions',
		enableSorting: false,
		cell: (info) => {
			const isUserActive =
				info?.row?.original?.user?.active &&
				info?.row?.original?.approved;

			if (isUserActive) {
				return h('div', { class: 'text-gray-400' }, '---');
			}

			const buttons = [];
			const roles = auth?.userData?.roles ?? [];
			const canEdit = hasPermission(['admin', 'superadmin'], roles);

			if (canEdit && !isUserActive) {
				buttons.push(
					h(
						'button',
						{
							type: 'button',
							class: 'rounded transition ease-in-out duration-75 bg-green-500/40 hover:bg-green-500 text-gray-100 hover:text-gray-50 px-2 py-1 disabled:cursor-not-allowed',
							title: 'Approve',
							disabled: loading.value,
							onClick: () => {
								handleUserReview(
									info?.row?.original?.user,
									true,
								);
							},
						},
						h(Icon, { icon: 'heroicons:hand-thumb-up-solid' }),
					),
				);

				buttons.push(
					h(
						'button',
						{
							type: 'button',
							class: 'rounded transition ease-in-out duration-75 bg-red-500/40 hover:bg-red-500 text-gray-100 hover:text-gray-50 px-2 py-1 disabled:cursor-not-allowed',
							title: 'Reject',
							disabled: loading.value,
							onClick: () => {
								handleUserReview(
									info?.row?.original?.user,
									false,
								);
							},
						},
						h(Icon, { icon: 'heroicons:hand-thumb-down-solid' }),
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
		return userList.value;
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

	if (direction === 'prev' && users.value?.prev) {
		url = users.value?.prev;
	} else if (direction === 'next' && users.value?.next) {
		url = users.value?.next;
	}

	if (!url) {
		return;
	}

	loading.value = true;
	http.get(url, {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	})
		.then((response) => {
			users.value = response?.data;
		})
		.catch((error) => {
			console.error(error);
		})
		.finally(() => {
			loading.value = false;
		});
};

const loadUsers = () => {
	loading.value = true;
	http.get(endpoints?.activations?.index, {
		headers: {
			Authorization: `Bearer ${auth?.accessToken}`,
		},
	})
		.then((response) => {
			users.value = response?.data ?? {};
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

	loadUsers();
});
</script>

<template>
	<Authenticated>
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
								'w-64': !['user_active', 'actions']?.includes(
									header.id,
								),
								'w-36 text-center': [
									'user_active',
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
							'bg-green-50':
								row?.original?.approved &&
								row?.original?.user.active,
							'bg-yellow-50':
								!row?.original?.approved ||
								!row?.original?.user.active,
						}"
					>
						<div
							v-for="cell in row.getVisibleCells()"
							:key="cell.id"
							class="table-cell align-middle border-t p-2"
							:class="{
								'text-center': [
									'user_active',
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
					'hover:text-gray-600': users?.prev,
				}"
				title="Previous"
				@click.prevent="handlePagination('prev')"
				:disabled="loading || !users?.prev"
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
					'hover:text-gray-600': users?.next,
				}"
				title="Next"
				@click.prevent="handlePagination('next')"
				:disabled="loading || !users?.next"
			>
				<Icon icon="heroicons:chevron-right-solid" class="w-5 h-5" />
			</button>
		</div>
	</Authenticated>

	<Modal
		ref="modalUser"
		@accept="handleModalUserAccept"
		@cancel="handleModalUserCancel"
	>
		<template #title>
			<template v-if="formData?.approved">Approve user?</template>
			<template v-else>Reject usuario?</template>
		</template>

		<template #content>
			<div v-if="formData?.approved" class="text-center">
				Do you really want to approve the account registration of user
				<strong>{{ formData?.user?.email }}</strong
				>?
			</div>
			<template v-else>
				<div class="flex flex-col justify-center gap-4">
					<div class="text-center">
						Do you really want to reject the account registration of
						user
						<strong>{{ formData?.user?.email }}</strong
						>?
					</div>
					<div class="flex flex-wrap items-start gap-4 w-full">
						<div class="flex flex-1 flex-col justify-center gap-2">
							<label
								for="reason"
								class="text-sm font-semibold text-gray-500"
								>Reason</label
							>
							<textarea
								id="reason"
								name="reason"
								class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full max-h-24"
								v-model="formData.reason"
								@input="handleReason"
								:disabled="loading"
							></textarea>
							<Transition
								enter-active-class="duration-100 ease-out"
								enter-from-class="transform opacity-0"
								enter-to-class="opacity-100"
								leave-active-class="duration-100 ease-in"
								leave-from-class="opacity-100"
								leave-to-class="transform opacity-0"
							>
								<div
									v-if="errors?.reason"
									class="text-sm text-red-600"
								>
									{{ (errors?.reason ?? [])?.join(',') }}
								</div>
							</Transition>
						</div>
					</div>
				</div>
			</template>
		</template>
	</Modal>

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
