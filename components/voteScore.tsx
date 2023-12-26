"use Client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const VoteScore = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={`flex flex-col items-center justify-center w-[45px] ${cn(
			className
		)}`}
		{...props}
	/>
));

VoteScore.displayName = "VoteScore";

const VoteBlock = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={`flex items-center justify-center w-full h-[45px] bg-background border ${cn(
			className
		)}`}
		{...props}
	/>
));

VoteBlock.displayName = "VoteBlock";

export { VoteScore, VoteBlock };
