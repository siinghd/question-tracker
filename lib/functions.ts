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
		parseInt((searchParams.limit || 10).toString()) || 100
	);
	const skip = (pageNumber - 1) * pageSize;

	return {
		pageNumber,
		pageSize,
		skip,
	};
};
