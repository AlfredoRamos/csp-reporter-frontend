<script setup>
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from '@iconify/vue';

const props = defineProps({
	tabList: {
		type: Array,
		required: true,
	},
	variant: {
		type: String,
		required: false,
		default: () => {
			return 'vertical';
		},
		validator: (value) => {
			return ['vertical', 'horizontal'].includes(value);
		},
	},
});

const emit = defineEmits(['change']);

const activeTab = ref(0);
const uid = uuidv4();
</script>

<template>
	<div
		class="flex overflow-auto mb-4"
		:class="{
			'flex-col border rounded shadow-sm': props?.variant === 'vertical',
			'gap-2 items-start': props?.variant === 'horizontal',
		}"
	>
		<div
			class="flex flex-wrap gap-2 bg-slate-400/60 text-gray-50 p-1"
			:class="{
				'items-center': props?.variant === 'vertical',
				'flex-col w-2/12 rounded shadow-sm':
					props?.variant === 'horizontal',
			}"
		>
			<div
				v-for="(tab, index) in props?.tabList ?? []"
				:key="index"
				class="px-2 py-1 font-semibold transition ease-in-out duration-75 rounded cursor-pointer"
				:class="{
					'': props?.variant === 'vertical',
					grow: props?.variant === 'horizontal',
					'bg-green-700': index === activeTab,
					'hover:bg-slate-400': index !== activeTab,
					'whitespace-nowrap': tab?.icon?.length > 0,
				}"
			>
				<label :for="`${uid}-${index}`" class="cursor-pointer block">
					<Icon
						v-if="tab?.icon?.length > 0"
						:icon="tab?.icon"
						class="inline-block align-middle mr-1"
					/>
					{{ tab?.text || tab?.title || '' }}
					<input
						:id="`${uid}-${index}`"
						type="radio"
						:name="`${uid}-tab`"
						:value="index"
						v-model.number="activeTab"
						class="hidden"
						@change="emit('change')"
					/>
				</label>
			</div>
		</div>
		<template v-for="(tab, index) in props?.tabList ?? []">
			<div
				:key="index"
				v-if="index === activeTab"
				class="bg-white p-2"
				:class="{
					'grow border rounded shadow-sm':
						props?.variant === 'horizontal',
				}"
			>
				<slot :name="`tab-panel-${index}`" />
			</div>
		</template>
	</div>
</template>
