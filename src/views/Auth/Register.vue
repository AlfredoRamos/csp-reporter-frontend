<script setup>
import Guest from '@/layouts/Guest.vue';
import Alert from '@/components/Alert.vue';

const canRegister =
	import.meta.env.VITE_ENABLE_USER_REGISTER === 'true' ?? true;
</script>

<template>
	<Guest>
		<Alert
			v-if="!canRegister"
			type="error"
			title="User registration is disabled"
			:narrow="false"
			>New user registration has been disabled.</Alert
		>
	</Guest>
</template>
