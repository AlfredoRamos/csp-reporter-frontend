const defaultLocale = import.meta.env.VITE_LOCALE ?? 'en-US';

const isValidUuid = (uuid) => {
	if (uuid?.length != 36) {
		return false;
	}

	const uuidRegexp =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	return uuidRegexp.test(uuid);
};

const formatNumber = (number, options) => {
	const defaultOptions = {
		style: 'decimal',
		signDisplay: 'negative',
		notation: 'compact',
		roundingPriority: 'morePrecision',
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 5,
	};

	return new Intl.NumberFormat(
		defaultLocale,
		Object.assign(defaultOptions, options),
	).format(number);
};

const formatCurrency = (number, options) => {
	const defaultOptions = {
		style: 'currency',
		currency: 'MXN',
		currencyDisplay: 'symbol',
		signDisplay: 'negative',
		notation: 'compact',
		compactDisplay: 'long',
		roundingPriority: 'morePrecision',
		minimumSignificantDigits: 2,
		maximumSignificantDigits: 2,
	};

	return new Intl.NumberFormat(
		defaultLocale,
		Object.assign(defaultOptions, options),
	).format(number);
};

const formatDateTime = (dateTime, withTime, options) => {
	if (typeof dateTime === 'string') {
		dateTime = new Date(dateTime);
	}

	let defaultOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: 'America/Mexico_City',
	};

	if (withTime === true) {
		defaultOptions = Object.assign(defaultOptions, {
			hour12: true,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}

	const opts = Object.assign(defaultOptions, options);

	return new Intl.DateTimeFormat(defaultLocale, opts).format(dateTime);
};

const findIdIndex = (list, id) => {
	if (!Array.isArray(list) || !isValidUuid(id)) {
		return -1;
	}

	return list.indexOf(id);
};

const findIdObjectIndex = (list, id) => {
	if (!Array.isArray(list) || !isValidUuid(id)) {
		return -1;
	}

	return list.findIndex((item) => {
		return item?.id === id;
	});
};

const findIdItem = (list, id) => {
	if (!Array.isArray(list) || !isValidUuid(id)) {
		return null;
	}

	return list.find((item) => {
		if (item?.id === id) {
			return { ...item };
		}
	});
};

const sortCompare = (a, b) => {
	return a - b;
};

const rangeToList = (str) => {
	str = (str ?? '')?.trim();

	if (
		!str ||
		str?.length < 3 ||
		str?.indexOf('-') < 0 ||
		str.indexOf('-') !== str.lastIndexOf('-')
	) {
		return [];
	}

	if (Array.isArray(str)) {
		return str;
	}

	let list = [];
	list = str.split('-');
	list = [...new Set(list)];

	let first = Number(list[0]?.trim());
	let last = Number(list[1]?.trim());

	let newList = [];

	if (!Number.isNaN(first) && !Number.isNaN(last) && first < last) {
		first = Math.abs(first);
		last = Math.abs(last);

		if (Math.abs(last - first) >= 1000) {
			console.warn('Trying to generate a large list of numbers.');
		}

		for (let i = first; i <= last; i++) {
			newList.push(i);
		}
	}

	newList = [...new Set(newList)];
	newList.sort(sortCompare);

	return newList;
};

const isValidFileSize = (size) => {
	if (typeof size !== 'number') {
		return false;
	}

	const maxFileSize = 3 * 1024 * 1024;

	return size > 0 && size <= maxFileSize;
};

const isValidMimeType = (type, allowedMimeTypes) => {
	if (
		typeof type !== 'string' ||
		type?.length < 1 ||
		!Array.isArray(allowedMimeTypes) ||
		allowedMimeTypes?.length < 1
	) {
		return false;
	}

	return allowedMimeTypes?.includes(type);
};

const isValidFile = (file, allowedMimeTypes) => {
	if (!(file instanceof File)) {
		return false;
	}

	return (
		isValidMimeType(file?.type, allowedMimeTypes) &&
		isValidFileSize(file?.size)
	);
};

const formatFileSize = (bytes, si = false, dp = 1) => {
	let size = bytes;
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		size /= thresh;
		++u;
	} while (
		Math.round(Math.abs(size) * r) / r >= thresh &&
		u < units.length - 1
	);

	return formatNumber(size) + ' ' + units[u];
};

const basename = (path) => {
	if ((path ?? '')?.length < 1) {
		return '';
	}

	return path?.split('/')?.reverse()?.[0];
};

const extname = (path) => {
	if ((path ?? '')?.length < 1) {
		return '';
	}

	return basename(path)?.split('.').reverse()?.[0];
};

function isValidDate(d) {
	return d instanceof Date && !isNaN(d);
}

export {
	isValidUuid,
	formatNumber,
	formatCurrency,
	formatDateTime,
	findIdIndex,
	findIdObjectIndex,
	findIdItem,
	rangeToList,
	isValidFileSize,
	isValidMimeType,
	isValidFile,
	formatFileSize,
	basename,
	extname,
	isValidDate,
};
