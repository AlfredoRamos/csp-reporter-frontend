import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

export const useNavbarStore = defineStore('navbar', () => {
	const state = useStorage('navbarState', 'auto');

	const getState = computed(() => {
		return state.value;
	});

	const toggleState = () => {
		if (state.value === 'auto') {
			state.value = 'open';
		} else if (state.value === 'open') {
			state.value = 'close';
		} else {
			state.value = 'auto';
		}
	};

	return { state, getState, toggleState };
});
