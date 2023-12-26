import prisma from "@/PrismaClientSingleton";
import { auth } from "@/auth";
import PostCard from "@/components/PostCard";
import { QueryParams, TabType } from "@/types";
import React from "react";
import { Answer } from "@/prisma/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUpdatedUrl, paginationData } from "@/lib/functions";
import Link from "next/link";
import Paging from "@/components/paging";

const organizeAnswers = (
	answers: Answer[],
	parentId: string | null = null
): Answer[] => {
	return answers
		.filter((answer) => {
			return answer.parentId === parentId;
		})
		.map((answer) => {
			const organizedResponses = organizeAnswers(answers, answer.id);

			return {
				...answer,
				responses: organizedResponses,
			};
		});
};

const fetchAnswersForQuestion = async (
	slug: string,
	searchParams: QueryParams
) => {
	// Determine the ordering criteria based on tabType
	let orderCriteria = {};
	if (searchParams.tabType === TabType.mu) {
		// Assuming 'totalVotes' is a field that can be used for ordering
		orderCriteria = { totalVotes: "desc" };
	} else if (searchParams.tabType === TabType.mr) {
		// Order by 'createdAt' or 'updatedAt' as per your requirement
		orderCriteria = { createdAt: "desc" };
	}
	const paginationQ = paginationData(searchParams); // pageNumber: number;  pageSize: number;   skip: number;
	const pagination = {
		skip: paginationQ.skip,
		take: paginationQ.pageSize,
	};

	const questionWithAnswers = await prisma.question.findUnique({
		where: {
			slug: slug,
		},
		include: {
			answers: {
				orderBy: orderCriteria,
				skip: pagination.skip,
				take: pagination.take,
				include: {
					author: true, // Include author details for each answer
					votes: true, // Include votes for each answer
					responses: true, // Include sub-answers (responses) for each answer
					// You can include other fields as needed
				},
			},
		},
	});

	return questionWithAnswers
		? organizeAnswers(questionWithAnswers.answers, null)
		: [];
};
const SingleAnswerPage = async ({
	params,
	searchParams,
}: {
	params: { slug: string };
	searchParams: QueryParams;
}) => {
	const session = await auth();
	const tabType = searchParams.tabType || TabType.mu; //can be most upvoted or most recent

	const answers = await fetchAnswersForQuestion(params.slug, searchParams);

	return (
		<div className='pt-14 pb-14 md:mx-[15%]'>
			<div className='px-3'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className='shrink-0' variant='outline'>
							<ArrowUpDownIcon className='w-4 h-4 mr-2' />
							Sort by
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-[200px]'>
						<DropdownMenuRadioGroup value={tabType}>
							<Link
								href={getUpdatedUrl(`/questions/${params.slug}`, searchParams, {
									tabType: TabType.mu,
								})}>
								<DropdownMenuRadioItem value={TabType.mu}>
									Most Voted
								</DropdownMenuRadioItem>
							</Link>
							<Link
								href={getUpdatedUrl(`/questions/${params.slug}`, searchParams, {
									tabType: TabType.mr,
								})}>
								<DropdownMenuRadioItem value={TabType.mr}>
									Most Recent
								</DropdownMenuRadioItem>
							</Link>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className=' flex items-center justify-center  px-3 flex-col gap-2 my-3'>
				{answers.map((post) => (
					<PostCard
						key={post.id}
						questionId={post.questionId}
						post={post}
						userId={session?.user.id}
						reply={true}
					/>
				))}
			</div>
			<Paging dataLength={answers.length} />
		</div>
	);
};

export default SingleAnswerPage;
