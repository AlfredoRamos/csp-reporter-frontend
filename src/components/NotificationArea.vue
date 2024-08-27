<template>
	<Teleport to="body">
		<div
			class="flex flex-col flex-wrap items-end gap-2 fixed bottom-2 right-2 left-2 md:bottom-4 md:right-4 md:left-auto z-30 empty:hidden"
		>
			<slot />
		</div>
	</Teleport>
</template>
