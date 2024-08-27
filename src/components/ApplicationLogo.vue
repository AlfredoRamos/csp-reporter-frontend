<script setup>
const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';
</script>

<template>
	<span
		class="block bg-logo bg-no-repeat bg-contain bg-center w-80 h-32"
		:title="`${defaultTitle} - ${defaultDescription}`"
	></span>
</template>
