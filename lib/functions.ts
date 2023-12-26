import { QueryParams } from "@/types";

export const getUpdatedUrl = (
	path: string,
	prevQueryParams: QueryParams,
	newQueryParams: QueryParams
) => {
	const updatedQuery = { ...prevQueryParams, ...newQueryParams };
	const queryString = new URLSearchParams(
		updatedQuery as Record<string, string>
	).toString();
	return `${path}?${queryString}`;
};

export const searchParamsToObject = (
	searchParams: URLSearchParams
): Record<string, string | string[]> => {
	const obj: Record<string, string | string[]> = {};
	searchParams.forEach((value, key) => {
		// If the key already exists, transform into an array or push to existing array
		if (obj.hasOwnProperty(key)) {
			if (Array.isArray(obj[key])) {
				(obj[key] as string[]).push(value);
			} else {
				obj[key] = [obj[key] as string, value];
			}
		} else {
			// Add the key-value pair
			obj[key] = value;
		}
	});
	return obj;
};

export const paginationData = (searchParams: QueryParams) => {
	const pageNumber = parseInt((searchParams.page || 1).toString());
	const pageSize = Math.min(
		parseInt((searchParams.limit || 30).toString()) || 100
	);
	const skip = (pageNumber - 1) * pageSize;

	return {
		pageNumber,
		pageSize,
		skip,
	};
};

export const generateHandle = (title: string): string => {
  const latinToEnglishMap: { [key: string]: string } = {
    à: 'a',
    á: 'a',
    â: 'a',
    ã: 'a',
    ä: 'a',
    å: 'a',
    è: 'e',
    é: 'e',
    ê: 'e',
    ë: 'e',
    ì: 'i',
    í: 'i',
    î: 'i',
    ï: 'i',
    ò: 'o',
    ó: 'o',
    ô: 'o',
    õ: 'o',
    ö: 'o',
    ù: 'u',
    ú: 'u',
    û: 'u',
    ü: 'u',
    ñ: 'n',
    ç: 'c',
    ß: 'ss',
    ÿ: 'y',
    œ: 'oe',
    æ: 'ae',
  };

  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const handle = normalizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x00-\x7F]/g, (char) => latinToEnglishMap[char] || '');

  return handle;
};
