import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={`rounded-xl border  ${cn(className)}`}
			{...props}
		/>
	)
);

Card.displayName = "Card";

const CardBody = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={`w-[95%] mx-auto py-5 ${cn(className)}`}
		{...props}
	/>
));

CardBody.displayName = "CardBody";
export { Card, CardBody };
