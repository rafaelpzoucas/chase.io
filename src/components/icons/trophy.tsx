import type React from "react";
import { cn } from "@/lib/utils";

type TrophyProps = React.SVGProps<SVGSVGElement> & {
  variant: "solid" | "outline";
};

export const Trophy = ({ variant, className, ...props }: TrophyProps) => {
  if (variant === "solid") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="img"
        aria-labelledby="trophy"
        className={cn("w-6 h-6 fill-current", className)}
        {...props}
      >
        <title id="trophy">Trophy icon</title>
        <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-labelledby="trophy"
      className={cn("w-6 h-6 fill-current", className)}
    >
      <title id="trophy">Trophy icon</title>
      <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5Zm-10,9h-2v-1h-1v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1Zm0-4v-5h8v5h-1v3h-1v2h-4v-2h-1v-3h-1Zm12,0v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3h-1Z" />
    </svg>
  );
};
