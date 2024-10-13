<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Line } from 'vue-chartjs';
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Colors,
} from 'chart.js';
import { useAuthStore } from '@/stores/auth';
import Authenticated from '@/layouts/Authenticated.vue';
import Loader from '@/components/Loader.vue';

ChartJS.register(
	Title,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Filler,
	Colors,
);

const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);

const chartStyle = {
	position: 'relative',
	width: '100%',
	height: '100%',
};

const reportType = ref([
	{
		type: 'style-src',
		data: [
			{ period: 1, value: 57 },
			{ period: 2, value: 67213 },
			{ period: 3, value: 491 },
			{ period: 4, value: 234 },
			{ period: 5, value: 95461 },
			{ period: 6, value: 27481 },
			{ period: 7, value: 51234 },
			{ period: 8, value: 69802 },
			{ period: 9, value: 2305 },
			{ period: 10, value: 934 },
			{ period: 11, value: 10492 },
			{ period: 12, value: 87564 },
		],
	},
	{
		type: 'script-src',
		data: [
			{ period: 1, value: 10 },
			{ period: 2, value: 72984 },
			{ period: 3, value: 19452 },
			{ period: 4, value: 86321 },
			{ period: 5, value: 5463 },
			{ period: 6, value: 23587 },
			{ period: 7, value: 78264 },
			{ period: 8, value: 6148 },
			{ period: 9, value: 34219 },
			{ period: 10, value: 7302 },
			{ period: 11, value: 12847 },
			{ period: 12, value: 6532 },
		],
	},
	{
		type: 'media-src',
		data: [
			{ period: 1, value: 49283 },
			{ period: 2, value: 87354 },
			{ period: 3, value: 12345 },
			{ period: 4, value: 56789 },
			{ period: 5, value: 34567 },
			{ period: 6, value: 90876 },
			{ period: 7, value: 45678 },
			{ period: 8, value: 23456 },
			{ period: 9, value: 78901 },
			{ period: 10, value: 32109 },
			{ period: 11, value: 65432 },
			{ period: 12, value: 87654 },
		],
	},
]);

const reportTypeOptions = {
	responsive: true,
	scales: {
		y: {
			beginAtZero: true,
		},
	},
	plugins: {
		legend: {
			position: 'top',
		},
		title: {
			display: true,
			text: 'CSP violation reports by type',
		},
		filler: {
			propagate: false,
		},
		colors: {
			forceOverride: true,
		},
	},
};

const reports = computed(() => {
	return {
		labels: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		],
		datasets: (reportType.value ?? [])?.map((item) => {
			return {
				label: item?.type,
				data: (item?.data ?? [])?.map((i) => {
					return i?.value ?? 0;
				}),
				fill: 'start',
				tension: 0.5,
			};
		}),
	};
});

onBeforeMount(async () => {
	auth?.guard()
		.then(() => {
			// TODO: Make real API call
			setTimeout(() => {
				loading.value = false;
			}, 500);
		})
		.catch(() => {
			loading.value = false;
			router.push({ name: 'auth_login' });
			return;
		});
});
</script>

<template>
	<Authenticated>
		<Loader v-if="loading" />

		<div class="flex flex-wrap items-center justify-between gap-4 mb-4">
			<div
				class="flex-auto w-full h-72 p-4 bg-white shadow-md overflow-hidden rounded-md"
			>
				<Line
					:data="reports"
					:options="reportTypeOptions"
					:style="chartStyle"
				/>
			</div>
		</div>
	</Authenticated>
</template>
