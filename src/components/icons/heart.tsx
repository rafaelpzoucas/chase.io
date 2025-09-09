import type React from "react";
import { cn } from "@/lib/utils";

type HeartSolidProps = React.SVGProps<SVGSVGElement> & {
  variant: "solid" | "outline";
};

export const HeartSolid = ({
  variant,
  className,
  ...props
}: HeartSolidProps) => {
  if (variant === "solid") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="img"
        aria-labelledby="heartTitle"
        className={cn("w-6 h-6 fill-current", className)}
        {...props}
      >
        <title id="heartTitle">Heart icon</title>
        <polygon points="23 6 23 11 22 11 22 12 21 12 21 13 20 13 20 14 19 14 19 15 18 15 18 16 17 16 17 17 16 17 16 18 15 18 15 19 14 19 14 20 13 20 13 21 11 21 11 20 10 20 10 19 9 19 9 18 8 18 8 17 7 17 7 16 6 16 6 15 5 15 5 14 4 14 4 13 3 13 3 12 2 12 2 11 1 11 1 6 2 6 2 5 3 5 3 4 4 4 4 3 10 3 10 4 11 4 11 5 13 5 13 4 14 4 14 3 20 3 20 4 21 4 21 5 22 5 22 6 23 6" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-labelledby="heartTitle"
      className={cn("w-6 h-6 fill-current", className)}
    >
      <title id="heartTitle">Heart icon</title>
      <path d="m22,6v-1h-1v-1h-1v-1h-6v1h-1v1h-2v-1h-1v-1h-6v1h-1v1h-1v1h-1v5h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-5h-1Zm-2,4v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-3h1v-1h1v-1h4v1h1v1h1v1h2v-1h1v-1h1v-1h4v1h1v1h1v3h-1Z" />
    </svg>
  );
};
