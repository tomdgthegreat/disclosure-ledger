import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function BrandMark({ size = 36, className, ...props }: BrandMarkProps) {
  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="11"
        fill="#FFFBFF"
        stroke="#FF5A5F"
        strokeWidth="3.5"
      />
      <path
        d="M8 13 11 10m29 3-3-3M8 35l3 3m29-3-3 3"
        stroke="#FF5A5F"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M10 14h7.25c5.65 0 9.25 3.9 9.25 10s-3.6 10-9.25 10H10V14Zm5.5 5v10h1.55c2.55 0 3.95-1.55 3.95-5s-1.4-5-3.95-5H15.5Z"
        fill="#E11D8A"
        fillRule="evenodd"
      />
      <path d="M29 14h5.5v14.5H42l-3.2 5.5H29V14Z" fill="#00B7E6" />
    </svg>
  );
}
