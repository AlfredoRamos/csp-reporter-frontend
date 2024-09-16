<script setup>
import { ref, inject, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import HCaptcha from '@hcaptcha/vue3-hcaptcha';
import { zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonLang from '@zxcvbn-ts/language-common';
import * as zxcvbnEnLang from '@zxcvbn-ts/language-en';
import * as zxcvbnEsEsLang from '@zxcvbn-ts/language-es-es';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';
import Guest from '@/layouts/Guest.vue';
import NotificationArea from '@/components/NotificationArea.vue';
import Notification from '@/components/Notification.vue';
import Alert from '@/components/Alert.vue';
import HCaptchaBadge from '@/components/HCaptchaBadge.vue';
import endpoints from '@/modules/endpoints';

const defaultTitle = import.meta.env.VITE_APP_TITLE ?? '';
const defaultDescription = import.meta.env.VITE_APP_DESC ?? '';
const canRegister =
	import.meta.env.VITE_ENABLE_USER_REGISTER === 'true' ?? false;
const companyUrl = import.meta.env.VITE_COMPANY_URL ?? '';
const minPasswordLength = import.meta.env.VITE_MIN_PASSWORD_LENGTH ?? 10;

const hCaptchaConfig = {
	siteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY ?? '',
	size: import.meta.env.VITE_HCAPTCHA_SIZE ?? 'normal',
};

const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions);
zxcvbnOptions.addMatcher('pwned', matcherPwned);

const passwordValidatorOptions = {
	translations: zxcvbnEsEsLang.translations,
	graphs: zxcvbnCommonLang.adjacencyGraphs,
	dictionary: {
		...zxcvbnCommonLang.dictionary,
		...zxcvbnEnLang.dictionary,
		...zxcvbnEsEsLang.dictionary,
	},
	useLevenshteinDistance: true,
};
zxcvbnOptions.setOptions(passwordValidatorOptions);

const http = inject('http');
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordFieldType = computed(() => {
	return showPassword.value === true ? 'text' : 'password';
});
const confirmPasswordFieldType = computed(() => {
	return showConfirmPassword.value === true ? 'text' : 'password';
});
const passwordStrength = ref(null);
const userAccountCreated = ref(false);
const formData = ref({
	first_name: null,
	last_name: null,
	email: null,
	password: null,
	confirm_password: null,
	accept_privacy_policy: false,
});
const notifications = ref([]);
const errors = ref({});
const hCaptchaWidget = ref(null);

const canRegisterAccount = computed(() => {
	return (
		formData.value?.accept_privacy_policy === true &&
		passwordStrength.value?.score > 3
	);
});

let timer = null;

const resetFormData = () => {
	formData.value = {
		first_name: null,
		last_name: null,
		email: null,
		password: null,
		confirm_password: null,
		accept_privacy_policy: false,
	};

	passwordStrength.value = null;

	if (loading.value === true) {
		loading.value = false;
	}

	errors.value = {};
};

const handleUserAccount = async () => {
	errors.value = {};

	if (!errors.value) {
		errors.value = { ...errors.value, user: {} };
	}

	if (!formData.value?.email) {
		errors.value = {
			...errors.value,
			email: ['Please, enter a valid email address.'],
		};
	}

	if (formData.value?.password?.length < minPasswordLength) {
		errors.value = {
			...errors.value,
			password: [
				`The password is ${formData.value?.password?.length} out of ${minPasswordLength} characters long.`,
			],
		};
	}

	if (passwordStrength.value?.score <= 3) {
		errors.value = {
			...errors.value,
			password: ['Please, enter a stronger password.'],
		};
	}

	if (formData.value?.confirm_password !== formData.value?.password) {
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

	// Register account
	loading.value = true;
	http.post(endpoints?.auth?.register, {
		numero_acreditacion: formData.value?.numero_acreditacion,
		first_name: formData.value?.first_name,
		last_name: formData.value?.last_name,
		email: formData.value?.email,
		password: formData.value?.password,
		confirm_password: formData.value?.confirm_password,
		captcha: formData.value?.captcha,
	})
		.then((response) => {
			if (response?.status === 204) {
				userAccountCreated.value = true;
				resetFormData();
			}
		})
		.catch((error) => {
			const errs = error?.response?.data?.error;

			if (Array.isArray(errs)) {
				notifications.value?.push({
					type: 'error',
					title: 'Error creating user account',
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

const handleEmailChange = (e) => {
	if (!errors.value) {
		errors.value = { ...errors.value, user: {} };
	}

	if (e.target.value) {
		if (errors.value?.email) {
			errors.value = { ...errors.value, email: null };
		}

		return;
	}

	errors.value = {
		...errors.value,
		email: ['Please, enter a valid email address.'],
	};
};

const handlePasswordChange = (e) => {
	const pass = e.target.value;

	if (!errors.value) {
		errors.value = { ...errors.value, user: {} };
	}

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

	if (!errors.value) {
		errors.value = { ...errors.value, user: {} };
	}

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
</script>

<template>
	<Guest>
		<Alert
			v-if="!canRegister"
			type="error"
			title="User registration is disabled"
			:narrow="false"
			>New user accounts are not allowed.</Alert
		>

		<div
			v-else
			class="flex flex-col flex-wrap gap-4 text-gray-600 leading-normal"
		>
			<div class="text-center">
				<h1 class="font-bold text-lg">
					User registration for
					<abbr :title="defaultDescription">{{ defaultTitle }}</abbr>
				</h1>
				<p>Please enter the information requested below.</p>
			</div>

			<Transition
				enter-active-class="duration-100 ease-out"
				enter-from-class="transform opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="duration-100 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="transform opacity-0"
			>
				<Alert
					v-if="userAccountCreated"
					type="success"
					title="Account created successfully"
					:narrow="false"
				>
					<div class="text-left">
						<p class="mb-4">
							Your user account was created successfully, however,
							it is in the process of validation.
						</p>
						<p>
							Please wait for the confirmation that we will send
							you via email.
						</p>
					</div>
				</Alert>
				<form
					v-else
					@submit.prevent="handleUserAccount"
					class="flex flex-col justify-center gap-4 w-full"
				>
					<div class="flex flex-col items-start justify-center gap-2">
						<label
							for="first-name"
							class="text-sm font-semibold text-gray-500"
							>First name</label
						>
						<input
							type="text"
							v-model="formData.first_name"
							id="first-name"
							name="first_name"
							placeholder="Enter your first name"
							class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
							:class="{
								'border-red-500 focus:border-red-500 focus:ring-red-500':
									errors?.first_name,
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
								v-if="errors?.first_name"
								class="text-sm text-red-600"
							>
								{{ (errors?.first_name ?? [])?.join(',') }}
							</div>
						</Transition>
					</div>
					<div class="flex flex-col items-start justify-center gap-2">
						<label
							for="last-name"
							class="text-sm font-semibold text-gray-500"
							>Last name</label
						>
						<input
							type="text"
							v-model="formData.last_name"
							id="last-name"
							name="last_name"
							placeholder="Enter your last name"
							class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full"
							:class="{
								'border-red-500 focus:border-red-500 focus:ring-red-500':
									errors?.last_name,
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
								v-if="errors?.last_name"
								class="text-sm text-red-600"
							>
								{{ (errors?.last_name ?? [])?.join(',') }}
							</div>
						</Transition>
					</div>
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
							<div
								v-if="errors?.email"
								class="text-sm text-red-600"
							>
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
								v-model="formData.password"
								@input="handlePasswordChange"
								id="password"
								name="password"
								:minlength="minPasswordLength"
								maxlength="255"
								placeholder="Enter your password"
								class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full grow"
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
								class="bg-gray-400/20 hover:bg-gray-400/30 text-gray-500 transition ease-in-out duration-75 p-2 border rounded shrink disabled:cursor-not-allowed"
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
							>Confirm your password</label
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
								placeholder="Enter your password again"
								class="border border-gray-300 rounded px-2 py-1 shadow-sm outline-none focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-25 invalid:border-red-500 invalid:focus:border-red-500 invalid:focus:ring-red-500 invalid:focus:ring-opacity-25 bg-white w-full grow"
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
								class="bg-gray-400/20 hover:bg-gray-400/30 text-gray-500 transition ease-in-out duration-75 p-2 border rounded shrink disabled:cursor-not-allowed"
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

					<div class="font-semibold">
						<label
							><input
								type="checkbox"
								v-model="formData.accept_privacy_policy"
								:checked="formData.accept_privacy_policy"
								:disabled="loading"
							/>
							I accept the
							<a
								:href="`${companyUrl}/privacy-policy`"
								target="_blank"
								class="transition ease-in-out duration-75 text-sky-500 hover:text-sky-900 font-semibold"
								>Privacy Policy</a
							>
							for the use and processing of my personal
							data.</label
						>
					</div>

					<div class="flex items-center justify-center gap-2">
						<button
							type="button"
							class="whitespace-nowrap bg-sky-600 hover:bg-sky-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded disabled:cursor-not-allowed disabled:bg-gray-300"
							@click.prevent="handleUserAccount"
							:disabled="loading || !canRegisterAccount"
						>
							<Icon
								v-if="loading"
								icon="svg-spinners:tadpole"
								:inline="true"
								class="inline-block mr-1"
							/>
							<Icon
								v-else
								icon="heroicons:user-plus-solid"
								:inline="true"
								class="inline-block mr-1"
							/>
							Create account
						</button>
					</div>
				</form>
			</Transition>

			<div
				class="flex flex-col items-center justify-between gap-4 w-full"
			>
				<div class="relative w-full">
					<div
						class="flex items-center justify-center inset-0 absolute"
					>
						<div class="border-t w-full"></div>
					</div>
					<div
						class="leading-6 flex items-center justify-center relative"
					>
						<div
							class="bg-white px-4 text-sm text-gray-700 font-semibold"
						>
							Already have an account?
						</div>
					</div>
				</div>
				<RouterLink
					:to="{ name: 'auth_login' }"
					class="whitespace-nowrap bg-sky-600 hover:bg-sky-600/70 text-gray-50 hover:text-white transition ease-in-out duration-75 px-2 py-1 rounded"
				>
					<Icon
						icon="heroicons:arrow-left-on-rectangle-solid"
						:inline="true"
						class="inline-block mr-1"
					/>Log in
				</RouterLink>
			</div>
		</div>
		<HCaptchaBadge />
	</Guest>

	<NotificationArea>
		<Notification
			v-for="(notification, index) in notifications ?? []"
			:key="index"
			:type="notification?.type"
			:title="notification?.title"
			>{{ notification?.message }}</Notification
		>
	</NotificationArea>
</template>
