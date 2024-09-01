import { importJWK, compactDecrypt, compactVerify } from 'jose';
import { isValidUuid } from '@/modules/utils';
import encPrivKeyJson from '@/../keys/encryption-private.json';
import signPubKeyJson from '@/../keys/signing-public.json';

const parseAccessToken = async (token) => {
	token = token?.toString()?.trim();

	if (token?.length < 1) {
		console.warn('Empty access token.');
		return null;
	}

	const encPrivKey = await importJWK(encPrivKeyJson);
	const { plaintext, protectedHeader: encProtectedHeader } =
		await compactDecrypt(token, encPrivKey);
	token = null;

	const isJweValid =
		encProtectedHeader?.typ === 'JWE' &&
		encProtectedHeader?.alg === 'ECDH-ES+A256KW' &&
		encProtectedHeader?.enc === 'A256GCM' &&
		encProtectedHeader?.epk?.kty === 'EC' &&
		encProtectedHeader?.epk?.crv === 'P-256';

	if (!isJweValid) {
		return null;
	}

	const jws = new TextDecoder().decode(plaintext);

	const sigPubKey = await importJWK(signPubKeyJson);
	const { payload, protectedHeader: sigProtectedHeader } =
		await compactVerify(jws, sigPubKey);

	const isJwsValid =
		sigProtectedHeader?.typ === 'JWT' &&
		sigProtectedHeader?.alg === 'EdDSA';

	if (!isJwsValid) {
		return null;
	}

	const jwt = JSON.parse(new TextDecoder().decode(payload));

	return jwt;
};

const validateAccessToken = async (token) => {
	const jwt = await parseAccessToken(token);
	token = null;

	const now = new Date();
	const isJwtValid =
		isValidUuid(jwt?.sub) &&
		jwt?.sub === jwt?.user?.id &&
		now.getTime() >= new Date(jwt?.nbf * 1000)?.getTime() &&
		now.getTime() >= new Date(jwt?.iat * 1000)?.getTime() &&
		now.getTime() <= new Date(jwt?.exp * 1000)?.getTime();

	return isJwtValid;
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

export { parseAccessToken, validateAccessToken, hasPermission, hasRouteAccess };
