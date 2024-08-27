<script setup>
import { ref, computed, inject } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import HCaptcha from '@hcaptcha/vue3-hcaptcha';
import Guest from '@/layouts/Guest.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import HCaptchaBadge from '@/components/HCaptchaBadge.vue';
import endpoints from '@/modules/endpoints';
import { useAuthStore } from '@/stores/auth';
import { validateAccessToken } from '@/modules/auth';

const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';
const minPasswordLength = import.meta.env.VITE_MIN_PASSWORD_LENGTH ?? 10;

const hCaptchaConfig = {
	siteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY ?? '',
	size: import.meta.env.VITE_HCAPTCHA_SIZE ?? 'normal',
};

const http = inject('http');
const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const showPassword = ref(false);
const passwordFieldType = computed(() => {
	return showPassword.value === true ? 'text' : 'password';
});
const formData = ref({
	email: null,
	password: null,
});
const errors = ref({});
const hCaptchaWidget = ref(null);

const handleTogglePassword = (e) => {
	e.preventDefault();

	if (!formData.value?.password) {
		return;
	}

	showPassword.value = !showPassword.value;

	// Auto-hide password
	setTimeout(() => {
		if (showPassword.value === true) {
			showPassword.value = !showPassword.value;
		}
	}, 10000);
};

const handleSubmit = async (e) => {
	e.preventDefault();

	errors.value = {};

	// Validate email
	if (!formData.value?.email) {
		errors.value = {
			...errors.value,
			email: ['Please, enter your email.'],
		};
	}

	// Validate password
	if (!formData.value?.password) {
		errors.value = {
			...errors.value,
			password: ['Please, enter your password.'],
		};
	}

	// Show errors
	if (Object.entries(errors.value)?.length > 0) {
		return;
	}

	// Show captcha
	if (hCaptchaConfig?.size === 'invisible') {
		const captchaData = await hCaptchaWidget.value.executeAsync();
		formData.value = { ...formData.value, captcha: captchaData?.response };
	}

	// Login
	loading.value = true;
	http.post(endpoints?.auth?.login, formData.value)
		.then((response) => {
			if (!errors.value?.global) {
				errors.value = { ...errors.value, global: [] };
			}

			const token = response?.data?.access_token ?? null;

			if (!validateAccessToken(token)) {
				errors.value.global.push({
					type: 'error',
					title: 'Error loggin in',
					message: 'The access credentials are invalid.',
				});

				return;
			}

			auth?.setAccessToken(token);
			router.push({ name: 'auth_check' });
		})
		.catch((error) => {
			const msg =
				error?.response?.data?.error?.join('\n') ??
				'The access credentials are invalid.';

			if (!errors.value?.global) {
				errors.value = { ...errors.value, global: [] };
			}

			errors.value.global.push({
				type: 'error',
				title: 'Error loggin in',
				message: msg,
			});
		})
		.finally(() => {
			formData.value = { ...formData.value, password: null };
			loading.value = false;
			hCaptchaWidget.value.reset();
		});
};

// Validate email
const handleEmailChange = (e) => {
	if (e.target.value) {
		// Reset
		if (errors.value?.email) {
			errors.value = { ...errors.value, email: null };
		}

		return;
	}

	errors.value = {
		...errors.value,
		email: ['Please, enter your email.'],
	};
};

// Validate password
const handlePasswordChange = (e) => {
	const pass = e.target.value;

	if (pass) {
		if (pass?.length < minPasswordLength) {
			errors.value = {
				...errors.value,
				password: [
					`The password is ${pass?.length} out of ${minPasswordLength} characters long.`,
				],
			};
			return;
		}

		// Reset
		if (errors.value?.password) {
			errors.value = { ...errors.value, password: null };
		}

		return;
	}

	errors.value = {
		...errors.value,
		password: ['Please, enter your password.'],
	};
};
</script>

<template>
	<Guest>
		<div class="flex flex-col flex-wrap gap-4 text-gray-600 leading-normal">
			<div class="text-center">
				<h1 class="font-bold text-lg">
					Welcome to
					<abbr :title="defaultDescription">{{ defaultTitle }}</abbr>
				</h1>
				<p>To continue, please log in.</p>
			</div>
			<form
				@submit.prevent="handleSubmit"
				class="flex flex-col justify-center gap-4 w-full"
			>
				<div class="flex flex-col items-start justify-center gap-2">
					<label
						for="email"
						class="text-sm font-semibold text-gray-500"
						>Email</label
					>
					<input
						type="email"
						maxlength="100"
						v-model="formData.email"
						@input="handleEmailChange"
						id="email"
						name="email"
						placeholder="Enter your email"
						class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
						:class="{
							'border-red-500 focus:border-red-500 focus:ring-red-500':
								errors?.email,
						}"
						:disabled="loading"
					/>
					<Transition
						enter-active-class="duration-100 ease-out"
						enter-from-class="transform opacity-0"
						enter-to-class="opacity-100"
						leave-active-class="duration-100 ease-in"
						leave-from-class="opacity-100"
						leave-to-class="transform opacity-0"
					>
						<div v-if="errors?.email" class="text-sm text-red-600">
							{{ (errors?.email ?? [])?.join(',') }}
						</div>
					</Transition>
				</div>
				<div class="flex flex-col items-start justify-center gap-2">
					<label
						for="password"
						class="text-sm font-semibold text-gray-500"
						>Password</label
					>
					<div class="flex items-center gap-2 w-full">
						<input
							:type="passwordFieldType"
							:minlength="minPasswordLength"
							maxlength="255"
							v-model="formData.password"
							@input="handlePasswordChange"
							id="password"
							name="password"
							placeholder="Enter your password"
							class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full grow"
							:class="{
								'border-red-500 focus:border-red-500 focus:ring-red-500':
									errors?.password,
								'font-mono':
									showPassword &&
									(formData.password ?? '')?.length > 0,
							}"
							:disabled="loading"
						/>
						<button
							type="button"
							class="bg-gray-400/20 hover:bg-gray-400/30 text-gray-500 transition ease-in-out duration-75 p-2 border rounded shrink disabled:cursor-not-allowed"
							@click.prevent="handleTogglePassword"
							:title="
								showPassword ? 'Show password' : 'Hide password'
							"
							:disabled="loading"
						>
							<Icon
								v-if="showPassword"
								icon="heroicons:eye-slash-solid"
							/>
							<Icon v-else icon="heroicons:eye-solid" />
						</button>
					</div>
					<Transition
						enter-active-class="duration-100 ease-out"
						enter-from-class="transform opacity-0"
						enter-to-class="opacity-100"
						leave-active-class="duration-100 ease-in"
						leave-from-class="opacity-100"
						leave-to-class="transform opacity-0"
					>
						<div
							v-if="errors?.password"
							class="text-sm text-red-600"
						>
							{{ (errors?.password ?? [])?.join(',') }}
						</div>
					</Transition>
				</div>
				<div class="flex items-center justify-center gap-2">
					<HCaptcha
						ref="hCaptchaWidget"
						:sitekey="hCaptchaConfig?.siteKey"
						:size="hCaptchaConfig?.size"
						:reCaptchaCompat="false"
						:class="{
							hidden: hCaptchaConfig?.size === 'invisible',
						}"
					/>
					<Transition
						enter-active-class="duration-100 ease-out"
						enter-from-class="transform opacity-0"
						enter-to-class="opacity-100"
						leave-active-class="duration-100 ease-in"
						leave-from-class="opacity-100"
						leave-to-class="transform opacity-0"
					>
						<div
							v-if="errors?.captcha"
							class="text-sm text-red-600"
						>
							{{ (errors?.captcha ?? [])?.join(',') }}
						</div>
					</Transition>
				</div>
				<div class="flex items-center justify-center gap-2">
					<button
						type="submit"
						@click.prevent="handleSubmit"
						class="whitespace-nowrap bg-sky-600 hover:bg-sky-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded w-full disabled:cursor-not-allowed"
						:disabled="loading"
					>
						<Icon
							v-if="loading"
							icon="svg-spinners:tadpole"
							:inline="true"
							class="inline-block mr-1"
						/>
						<Icon
							v-else
							icon="heroicons:arrow-left-on-rectangle-solid"
							:inline="true"
							class="inline-block mr-1"
						/>
						Log in
					</button>
				</div>
				<div class="flex items-center justify-between">
					<RouterLink
						:to="{ name: 'auth_register' }"
						class="transition ease-in-out duration-75 text-gray-600 hover:text-gray-900"
						>Register
					</RouterLink>
					<RouterLink
						:to="{ name: 'auth_recover' }"
						class="transition ease-in-out duration-75 text-gray-600 hover:text-gray-900"
						>Password recovery
					</RouterLink>
				</div>
			</form>
		</div>
		<HCaptchaBadge />
	</Guest>

	<NotificationArea v-if="(errors?.global ?? [])?.length > 0">
		<Notification
			v-for="(notification, index) in errors?.global ?? []"
			:key="index"
			:type="notification?.type"
			:title="notification?.title"
			>{{ notification?.message }}</Notification
		>
	</NotificationArea>
</template>
