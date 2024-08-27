import { decodeProtectedHeader } from 'jose';

const validateAccessToken = (token) => {
	token = token?.toString()?.trim();

	if (token?.length < 1) {
		console.warn('Empty access token.');
		return false;
	}

	const protectedHeader = decodeProtectedHeader(token);
	const isValid =
		protectedHeader?.typ === 'JWE' &&
		protectedHeader?.alg === 'ECDH-ES+A256KW' &&
		protectedHeader?.enc === 'A256GCM' &&
		protectedHeader?.epk?.kty === 'EC' &&
		protectedHeader?.epk?.crv === 'P-256';

	token = null;

	return isValid;
};

const hasPermission = (allowed, roles) => {
	if (
		!Array.isArray(allowed) ||
		allowed?.length < 1 ||
		!Array.isArray(roles) ||
		roles?.length < 1
	) {
		return false;
	}

	return allowed?.some((r) => {
		return roles?.includes(r);
	});
};

const hasRouteAccess = (allowed, roles) => {
	if (!Array.isArray(allowed) || !Array.isArray(roles)) {
		return false;
	}

	// Ruta no restringida
	if (allowed?.length < 1 && roles?.length > 0) {
		return true;
	}

	if (allowed?.length > 0 && roles?.length > 0) {
		return allowed?.some((r) => {
			return roles?.includes(r);
		});
	}

	return false;
};

export { validateAccessToken, hasPermission, hasRouteAccess };
