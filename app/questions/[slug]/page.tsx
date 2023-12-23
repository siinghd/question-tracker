"use client";
import { Card, CardBody } from "@/components/card";
import Tag from "@/components/tag";
import TextSnippet from "@/components/textSnippet";
import { VoteBlock, VoteScore } from "@/components/voteScore";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import {
	Heart,
	MessageSquareReply,
	Minus,
	MoreHorizontal,
	Plus,
} from "lucide-react";

const Page = () => {
	return (
		<div className='w-[90%] mx-auto'>
			<Card className='w-[70%] bg-background mx-auto'>
				<CardBody className='flex gap-5 items-start justify-between'>
					<VoteScore className='w-[100px]'>
						<VoteBlock className=' rounded-t-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-200 duration-300 ease-in-out dark:bg-gray-900 dark:hover:bg-gray-950'>
							<Plus size={20} />
						</VoteBlock>
						<VoteBlock className=' border-t-0 border-b-0 text-sm  font-medium dark:bg-gray-900'>
							10
						</VoteBlock>
						<VoteBlock className='rounded-b-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-100 duration-300 dark:bg-gray-900 ease-in-out dark:hover:bg-gray-950'>
							<Minus size={20} />
						</VoteBlock>
					</VoteScore>
					<div className='flex flex-1 flex-row items-start justify-between'>
						<div>
							<div className='flex items-center justify-start gap-3 my-2'>
								<Avatar className='cursor-pointer'>
									<AvatarImage
										className='h-10 w-10 rounded-full'
										src='https://github.com/shadcn.png'
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<TextSnippet className='font-medium'>M1000</TextSnippet>
								<TextSnippet className='text-sm text-gray-500'>
									Nov 18/22
								</TextSnippet>
								<TextSnippet className='w-[10px] h-[10px] bg-blue-500 rounded-full'></TextSnippet>
								<TextSnippet className='text-sm text-gray-500 -ml-2'>
									Edited on Dec 20/22
								</TextSnippet>
							</div>
							<Tag />
							<Tag />
							<Tag />
							<TextSnippet className='text-sm  py-2'>
								Lorem Ipsum is simply dummy text of the printing and typesetting
								industry. Lorem Ipsum has been the industrys standard dummy text
								ever since the 1500s, when an unknown printer took a galley of
								type and scrambled it to make a type specimen book. It has
								survived not only five centuries, but also the leap into
								electronic typesetting, remaining essentially unchanged. It was
								popularised in the 1960s with the release of Letraset sheets
								containing Lorem Ipsum passages, and more recently with desktop
								publishing software like Aldus PageMaker including versions of
								Lorem Ipsum.
							</TextSnippet>
							<div className='flex gap-3'>
								<TextSnippet className='flex items-center gap-2	 cursor-pointer'>
									<Heart
										size={18}
										color='red'
										fill='red'
										className='hover:scale-125 duration-300 ease-in-out'
									/>
									<p className='text-sm'>11 Likes</p>
								</TextSnippet>
								<TextSnippet className='flex items-center gap-2 cursor-pointer'>
									<MessageSquareReply
										size={18}
										color='#3B81F6'
										fill='#3B81F6'
										className='hover:scale-125 duration-300 ease-in-out'
									/>
									<p className='text-sm'>Reply</p>
								</TextSnippet>
							</div>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<MoreHorizontal
									size={35}
									className='active:outline-none  rounded-full border p-1.5 '
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='rounded-xl backdrop-blur bg-gray-200/30  dark:bg-gray-700/30 px-2 cursor-pointer py-2'>
								<DropdownMenuItem className='text-sm px-1 py-2 rounded-xl hover:border-none hover:outline-none'>
									Delete{" "}
								</DropdownMenuItem>
								<hr />
								<DropdownMenuItem className='text-sm px-1 py-2 hover:border-none hover:outline-none'>
									Report spam
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardBody>
			</Card>
			<br />
			<Card className='w-[70%] bg-background mx-auto'>
				<CardBody className='flex gap-5 items-start justify-between'>
					<VoteScore className='w-[100px]'>
						<VoteBlock className=' rounded-t-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-200 duration-300 ease-in-out dark:bg-gray-900 dark:hover:bg-gray-950'>
							<Plus size={20} />
						</VoteBlock>
						<VoteBlock className=' border-t-0 border-b-0 text-sm  font-medium dark:bg-gray-900'>
							10
						</VoteBlock>
						<VoteBlock className='rounded-b-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-100 duration-300 dark:bg-gray-900 ease-in-out dark:hover:bg-gray-950'>
							<Minus size={20} />
						</VoteBlock>
					</VoteScore>
					<div className='flex flex-1 flex-row items-start justify-between'>
						<div>
							<div className='flex items-center justify-start gap-3 my-2'>
								<Avatar className='cursor-pointer'>
									<AvatarImage
										className='h-10 w-10 rounded-full'
										src='https://github.com/shadcn.png'
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
								<TextSnippet className='font-medium'>M1000</TextSnippet>
								<TextSnippet className='text-sm text-gray-500'>
									Nov 18/22
								</TextSnippet>
								<TextSnippet className='w-[10px] h-[10px] bg-blue-500 rounded-full'></TextSnippet>
								<TextSnippet className='text-sm text-gray-500 -ml-2'>
									Edited on Dec 20/22
								</TextSnippet>
							</div>
							<Tag name='H singh' />
							<Tag />
							<Tag />
							<TextSnippet className='text-sm  py-2'>
								Lorem Ipsum is simply dummy text of the printing and typesetting
								industry. Lorem Ipsum has been the industrys standard dummy text
								ever since the 1500s, when an unknown printer took a galley of
								type and scrambled it to make a type specimen book. It has
								survived not only five centuries, but also the leap into
								electronic typesetting, remaining essentially unchanged. It was
								popularised in the 1960s with the release of Letraset sheets
								containing Lorem Ipsum passages, and more recently with desktop
								publishing software like Aldus PageMaker including versions of
								Lorem Ipsum.
							</TextSnippet>
							<div className='flex gap-3'>
								<TextSnippet className='flex items-center gap-2	 cursor-pointer'>
									<Heart
										size={18}
										color='red'
										fill='red'
										className='hover:scale-125 duration-300 ease-in-out'
									/>
									<p className='text-sm'>11 Likes</p>
								</TextSnippet>
								<TextSnippet className='flex items-center gap-2 cursor-pointer'>
									<MessageSquareReply
										size={18}
										color='#3B81F6'
										fill='#3B81F6'
										className='hover:scale-125 duration-300 ease-in-out'
									/>
									<p className='text-sm'>Reply</p>
								</TextSnippet>
							</div>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<MoreHorizontal
									size={35}
									className='active:outline-none  rounded-full border p-1.5 '
								/>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='rounded-xl backdrop-blur bg-gray-200/30  dark:bg-gray-700/30 px-2 cursor-pointer py-2'>
								<DropdownMenuItem className='text-sm px-1 py-2 rounded-xl hover:border-none hover:outline-none'>
									Delete{" "}
								</DropdownMenuItem>
								<hr />
								<DropdownMenuItem className='text-sm px-1 py-2 hover:border-none hover:outline-none'>
									Report spam
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default Page;
