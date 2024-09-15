<script setup>
import { ref, inject, computed, onBeforeMount } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import HCaptcha from '@hcaptcha/vue3-hcaptcha';
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonLang from '@zxcvbn-ts/language-common';
import * as zxcvbnEnLang from '@zxcvbn-ts/language-en';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';
import Guest from '@/layouts/Guest.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import Alert from '@/components/Alert.vue';
import HCaptchaBadge from '@/components/HCaptchaBadge.vue';
import { useAuthStore } from '@/stores/auth';
import endpoints from '@/modules/endpoints';

const minPasswordLength = import.meta.env.VITE_MIN_PASSWORD_LENGTH ?? 10;

const hCaptchaConfig = {
	siteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY ?? '',
	size: import.meta.env.VITE_HCAPTCHA_SIZE ?? 'normal',
};

const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions);
zxcvbnOptions.addMatcher('pwned', matcherPwned);

const passwordValidatorOptions = {
	translations: zxcvbnEnLang.translations,
	graphs: zxcvbnCommonLang.adjacencyGraphs,
	dictionary: {
		...zxcvbnCommonLang.dictionary,
		...zxcvbnEnLang.dictionary,
	},
	useLevenshteinDistance: true,
};
zxcvbnOptions.setOptions(passwordValidatorOptions);

const http = inject('http');
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const loading = ref(false);
const formData = ref({
	email: null,
	password: null,
	confirm_password: null,
});
const errors = ref({});
const notifications = ref([]);
const hCaptchaWidget = ref(null);
const notified = ref(false);
const isChangingPassword = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordFieldType = computed(() => {
	return showPassword.value === true ? 'text' : 'password';
});
const confirmPasswordFieldType = computed(() => {
	return showConfirmPassword.value === true ? 'text' : 'password';
});
const passwordStrength = ref(null);

let timer = null;

const resetFormData = () => {
	formData.value = {
		email: null,
		password: null,
		confirm_password: null,
	};
	passwordStrength.value = null;

	if (loading.value === true) {
		loading.value = false;
	}

	errors.value = {};
};

const handleSubmit = async () => {
	errors.value = {};

	// Validate email
	if (!isChangingPassword.value && !formData.value?.email) {
		errors.value = {
			...errors.value,
			email: ['Por favor, ingrese su email.'],
		};
	}

	if (
		isChangingPassword.value &&
		formData.value?.password?.length < minPasswordLength
	) {
		errors.value = {
			...errors.value,
			password: [
				`The password is ${formData.value?.password?.length} out of ${minPasswordLength} characters long.`,
			],
		};
	}

	if (isChangingPassword.value && passwordStrength.value?.score <= 3) {
		errors.value = {
			...errors.value,
			password: ['Please, enter a stronger password.'],
		};
	}

	if (
		isChangingPassword.value &&
		formData.value?.confirm_password !== formData.value?.password
	) {
		errors.value = {
			...errors.value,
			confirm_password: ['The confirmation password does not match.'],
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

	const method = isChangingPassword.value ? 'PATCH' : 'POST';
	const url = isChangingPassword.value
		? endpoints?.auth?.recover?.update
		: endpoints?.auth?.recover?.index;
	let data = {};

	if (isChangingPassword.value) {
		data = {
			hash: (route?.query?.hash ?? '')?.trim(),
			password: formData.value?.password,
			confirm_password: formData.value?.confirm_password,
		};
	} else {
		data = { email: formData.value?.email };
	}

	data = { ...data, captcha: formData.value?.captcha };

	// Recover
	loading.value = true;
	http({ method, url, data })
		.then(() => {
			notified.value = true;
			resetFormData();
		})
		.catch((error) => {
			const errs = error?.response?.data?.error;

			if (Array.isArray(errs)) {
				notifications.value?.push({
					type: 'error',
					title: 'Error reseting password',
					message: errs?.join('\n'),
				});
			}

			errors.value = errs ?? {};
		})
		.finally(() => {
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

		clearTimeout(timer);
		timer = setTimeout(() => {
			zxcvbnAsync(pass).then((result) => {
				passwordStrength.value = result;
			});
		}, 500);

		const confirmPass = formData.value?.confirm_password;

		// Reset
		if (
			errors.value?.confirm_password &&
			confirmPass?.length > 0 &&
			pass === confirmPass
		) {
			errors.value = {
				...errors.value,
				confirm_password: null,
			};
		}

		// Reset
		if (errors.value?.password) {
			errors.value = { ...errors.value, password: null };
		}

		return;
	}

	passwordStrength.value = null;

	errors.value = {
		...errors.value,
		password: ['Please, enter your password.'],
	};
};

const handleConfirmPasswordChange = (e) => {
	const confirmPass = e.target.value;

	if (confirmPass) {
		const pass = formData.value?.password;

		if (pass?.length < 1 || confirmPass !== pass) {
			errors.value = {
				...errors.value,
				confirm_password: ['The passwords do not match.'],
			};

			return;
		}

		// Reset
		if (errors.value?.confirm_password) {
			errors.value = {
				...errors.value,
				confirm_password: null,
			};
		}

		return;
	}

	errors.value = {
		...errors.value,
		confirm_password: ['Please, confirm your password.'],
	};
};

const handleTogglePassword = (e) => {
	e?.preventDefault();

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

const handleToggleConfirmPassword = (e) => {
	e?.preventDefault();

	if (!formData.value?.confirm_password) {
		return;
	}

	showConfirmPassword.value = !showConfirmPassword.value;

	// Auto-hide password
	setTimeout(() => {
		if (showConfirmPassword.value === true) {
			showConfirmPassword.value = !showConfirmPassword.value;
		}
	}, 10000);
};

const validateHash = () => {
	errors.value = {};
	isChangingPassword.value = false;

	const hash = (route?.query?.hash ?? '')?.trim();

	if (hash?.length !== 35) {
		return;
	}

	loading.value = true;
	http.post(endpoints?.auth?.recover?.validate, {
		hash: (route?.query?.hash ?? '')?.trim(),
	})
		.then(() => {
			isChangingPassword.value = true;
		})
		.catch((error) => {
			const errs = error?.response?.data?.error;

			if (Array.isArray(errs)) {
				errors.value = { ...errors.value, hash: errs };
				return;
			}

			errors.value = errs ?? {};
		})
		.finally(() => {
			loading.value = false;
		});

	return;
};

onBeforeMount(() => {
	if (auth?.accessToken) {
		loading.value = true;
		http.post(endpoints?.auth?.logout, null, {
			headers: {
				Authorization: `Bearer ${auth?.accessToken}`,
			},
		})
			.catch((error) => {
				console.error(error);
			})
			.finally(() => {
				loading.value = false;
				auth?.clean();
				router.go();
			});
	}

	validateHash();
});
</script>

<template>
	<Guest>
		<div
			v-if="!notified && !errors?.hash"
			class="flex flex-col flex-wrap gap-4 text-gray-600 leading-normal"
		>
			<div class="text-center">
				<h1 class="font-bold text-lg">User account recovery</h1>
				<p>
					To recover your password, please enter the information
					requested.
				</p>
			</div>
			<form
				@submit.prevent="handleSubmit"
				class="flex flex-col justify-center gap-4 w-full"
			>
				<template v-if="isChangingPassword">
					<div class="flex flex-col items-start justify-center gap-2">
						<label
							for="password"
							class="text-sm font-semibold text-gray-500"
							>New password</label
						>
						<div class="flex items-center gap-2 w-full">
							<input
								:type="passwordFieldType"
								v-model="formData.password"
								@input="handlePasswordChange"
								id="password"
								name="password"
								:minlength="minPasswordLength"
								maxlength="255"
								placeholder="Enter your new password"
								class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-green-ema focus:ring focus:ring-green-ema focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
								:class="{
									'border-red-500 focus:border-red-500 focus:ring-red-500':
										errors?.password,
									'font-mono':
										showPassword &&
										(formData.password ?? '')?.length > 0,
								}"
								:title="
									(
										passwordStrength?.feedback
											?.suggestions ?? []
									)?.length > 0
										? passwordStrength?.feedback?.suggestions?.join(
												'\n',
											)
										: undefined
								"
								:disabled="loading"
							/>
							<button
								type="button"
								class="bg-gray-ema/20 hover:bg-gray-ema/30 text-gray-500 transition ease-in-out duration-75 p-2 border rounded shrink disabled:cursor-not-allowed"
								@click.prevent="handleTogglePassword"
								:title="
									showPassword
										? 'Hide password'
										: 'Show password'
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
						<div
							class="flex items-center justify-between gap-2 w-full"
						>
							<div
								v-for="value in [...Array(5).keys()]"
								:key="value"
								class="w-full h-2 flex-1 transition ease-in-out duration-75 rounded"
								:class="{
									'bg-gray-200':
										value > passwordStrength?.score ||
										!passwordStrength?.score,
									'bg-red-500':
										passwordStrength?.score < 2 &&
										value <= passwordStrength?.score,
									'bg-orange-500':
										passwordStrength?.score == 2 &&
										value <= passwordStrength?.score,
									'bg-amber-500':
										passwordStrength?.score == 3 &&
										value <= passwordStrength?.score,
									'bg-green-500':
										passwordStrength?.score > 3 &&
										value <= passwordStrength?.score,
								}"
							></div>
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
								v-if="
									passwordStrength?.score >= 0 &&
									passwordStrength?.score <= 4
								"
								class="font-semibold text-sm text-center w-full whitespace-nowrap"
								:class="{
									'text-red-600': passwordStrength?.score < 2,
									'text-orange-600':
										passwordStrength?.score == 2,
									'text-amber-600':
										passwordStrength?.score == 3,
									'text-green-600':
										passwordStrength?.score > 3,
								}"
							>
								<template v-if="passwordStrength?.score < 2">
									<Icon
										icon="heroicons:exclamation-circle-solid"
										:inline="true"
										class="inline-block mr-1"
									/>Very weak
								</template>
								<template
									v-else-if="passwordStrength?.score == 2"
								>
									<Icon
										icon="heroicons:exclamation-triangle-solid"
										:inline="true"
										class="inline-block mr-1"
									/>Weak
								</template>
								<template
									v-else-if="passwordStrength?.score == 3"
								>
									<Icon
										icon="heroicons:exclamation-triangle-solid"
										:inline="true"
										class="inline-block mr-1"
									/>Insufficient
								</template>
								<template
									v-else-if="passwordStrength?.score > 3"
								>
									<Icon
										icon="heroicons:shield-check-solid"
										:inline="true"
										class="inline-block mr-1"
									/>Strong
								</template>
							</div>
						</Transition>
						<Transition
							enter-active-class="duration-100 ease-out"
							enter-from-class="transform opacity-0"
							enter-to-class="opacity-100"
							leave-active-class="duration-100 ease-in"
							leave-from-class="opacity-100"
							leave-to-class="transform opacity-0"
						>
							<div
								v-if="passwordStrength?.feedback?.warning"
								class="text-sm text-center w-full text-red-600 whitespace-nowrap"
							>
								{{ passwordStrength?.feedback?.warning }}
							</div>
						</Transition>
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
					<div class="flex flex-col items-start justify-center gap-2">
						<label
							for="confirm-password"
							class="text-sm font-semibold text-gray-500"
							>Confirm your new password</label
						>
						<div class="flex items-center gap-2 w-full">
							<input
								:type="confirmPasswordFieldType"
								v-model="formData.confirm_password"
								@input="handleConfirmPasswordChange"
								id="confirm-password"
								name="confirm_password"
								:minlength="minPasswordLength"
								maxlength="255"
								placeholder="Confirm your new password"
								class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-green-ema focus:ring focus:ring-green-ema focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
								:class="{
									'border-red-500 focus:border-red-500 focus:ring-red-500':
										errors?.confirm_password,
									'font-mono':
										showConfirmPassword &&
										(formData.confirm_password ?? '')
											?.length > 0,
								}"
								:disabled="loading"
							/>
							<button
								type="button"
								class="bg-gray-ema/20 hover:bg-gray-ema/30 text-gray-500 transition ease-in-out duration-75 p-2 border rounded shrink disabled:cursor-not-allowed"
								@click.prevent="handleToggleConfirmPassword"
								:title="
									showConfirmPassword
										? 'Hide password'
										: 'Show password'
								"
								:disabled="loading"
							>
								<Icon
									v-if="showConfirmPassword"
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
								v-if="errors?.confirm_password"
								class="text-sm text-red-600"
							>
								{{
									(errors?.confirm_password ?? [])?.join(',')
								}}
							</div>
						</Transition>
					</div>
				</template>

				<template v-else>
					<div class="flex flex-col items-start justify-center gap-2">
						<label
							for="email"
							class="text-sm font-semibold text-gray-500"
							>Email</label
						>
						<input
							type="email"
							v-model="formData.email"
							@input="handleEmailChange"
							id="email"
							name="email"
							placeholder="Enter your email"
							class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-green-ema focus:ring focus:ring-green-ema focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
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
							<div
								v-if="errors?.email"
								class="text-sm text-red-600"
							>
								{{ (errors?.email ?? [])?.join(',') }}
							</div>
						</Transition>
					</div>
				</template>

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
							icon="heroicons:arrow-path-rounded-square-solid"
							:inline="true"
							class="inline-block mr-1"
						/>
						Reset password
					</button>
				</div>
				<div class="flex items-center justify-between">
					<RouterLink
						:to="{ name: 'auth_login' }"
						class="transition ease-in-out duration-75 text-gray-600 hover:text-gray-900"
						>Log in
					</RouterLink>
					<RouterLink
						:to="{ name: 'auth_register' }"
						class="transition ease-in-out duration-75 text-gray-600 hover:text-gray-900"
						>Register
					</RouterLink>
				</div>
			</form>
		</div>

		<Alert
			v-if="notified"
			type="success"
			title="Password recovery was successful"
			:narrow="false"
		>
			<template v-if="isChangingPassword">
				<p class="mb-4">You have successfully changed your password.</p>
				<div class="text-center">
					<RouterLink
						:to="{ name: 'auth_login' }"
						class="whitespace-nowrap bg-green-600 hover:bg-green-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded w-fit mx-auto"
					>
						<Icon
							icon="heroicons:arrow-left-on-rectangle-solid"
							:inline="true"
							class="inline-block mr-1"
						/>
						Log in
					</RouterLink>
				</div>
			</template>
			<template v-else>
				<p class="mb-4">
					If the email address provided exists, you will receive a
					link to recover your password.
				</p>
				<p>Please check your inbox and follow the instructions.</p>
			</template>
		</Alert>

		<Alert
			v-if="errors?.hash?.length > 0"
			type="error"
			title="Invalid recovery URL"
			:narrow="false"
			><p>{{ errors?.hash?.join('\n') }}</p>
		</Alert>

		<HCaptchaBadge />
	</Guest>

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
