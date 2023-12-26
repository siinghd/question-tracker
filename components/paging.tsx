"use client";

import {
	getUpdatedUrl,
	paginationData,
	searchParamsToObject,
} from "@/lib/functions";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface IPagination {
	dataLength: number;
}
const Paging: React.FC<IPagination> = ({ dataLength = 1 }) => {
	console.log(dataLength);
	const searchParams = useSearchParams();
	const path = usePathname();
	const paramsObj = searchParamsToObject(searchParams);
	const paginationQ = paginationData(paramsObj);

	return (
		<div className='flex items-center justify-center space-x-4 '>
			{paginationQ.pageNumber > 1 && (
				<Link
					className='p-2 border hover: rounded-full flex items-center justify-center space-x-2 dark:border-gray-600 dark:text-gray-300'
					href={getUpdatedUrl(path + "/", paramsObj, {
						page: paginationQ.pageNumber - 1,
						limit: paginationQ.pageSize,
					})}>
					<ArrowLeft />

					<span className='sr-only'> {paginationQ.pageNumber - 1}</span>
				</Link>
			)}

			<span className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md dark:bg-gray-700 dark:text-gray-300'>
				{paginationQ.pageNumber}
			</span>
			{dataLength >= paginationQ.pageSize && (
				<Link
					className='p-2 border hover: rounded-full flex items-center justify-center space-x-2 dark:border-gray-600 dark:text-gray-300'
					href={getUpdatedUrl(path + "/", paramsObj, {
						page: paginationQ.pageNumber + 1,
						limit: paginationQ.pageSize,
					})}>
					<ArrowRight />
					<span className='sr-only'>{paginationQ.pageNumber + 1}</span>
				</Link>
			)}
		</div>
	);
};

export default Paging;
