import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    ...rest,
  };
}

/** Upload / outbound arrow into tray */
export function IconUpload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

/** Lock / seal */
export function IconSeal(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Receipt / audit document */
export function IconReceipt(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h10a1 1 0 0 1 1 1v16l-2.5-1.5L13 21l-2.5-1.5L8 21l-2.5-1.5L3 21V4a1 1 0 0 1 1-1h3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

/** Chain link */
export function IconLink(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 14.5l5-5" />
      <path d="M10 8.5l.8-.8a3.5 3.5 0 0 1 5 5l-.8.8" />
      <path d="M14 15.5l-.8.8a3.5 3.5 0 0 1-5-5l.8-.8" />
    </svg>
  );
}

/** Fragment / modular pieces */
export function IconModules(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

/** Clock / latency */
export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

/** Shield */
export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
    </svg>
  );
}

/** Lightning bolt */
export function IconBolt(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: props.strokeWidth ?? 1.75 })}>
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** EU mark — 12-point geometric star ring (simplified 8 for clarity at small size) */
export function IconEu(props: IconProps) {
  const size = props.size ?? 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={props.className}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 12 + Math.cos(rad) * 5.2;
        const y = 12 + Math.sin(rad) * 5.2;
        return <circle key={deg} cx={x} cy={y} r="1.15" />;
      })}
    </svg>
  );
}

/** Brand shape / mark */
export function IconMark(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 18V6l8-3 8 3v12l-8 3-8-3z" />
      <path d="M12 3v18M4 6l8 3 8-3" />
    </svg>
  );
}

/** Idea / insight — geometric diamond */
export function IconInsight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 9-7 9-7-9 7-9z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Library / definitions */
export function IconBook(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5z" />
      <path d="M6 3v16" />
    </svg>
  );
}

/** Free tier — simple tag */
export function IconTag(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" />
      <circle cx="8.5" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Team / growth — upward chevron stack */
export function IconGrow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 16l7-7 7 7" />
      <path d="M5 11l7-7 7 7" />
    </svg>
  );
}

/** Stop / never — octagon ban */
export function IconBan(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 3.5h9L21 8v8l-4.5 4.5h-9L3 16V8L7.5 3.5z" />
      <path d="M7 12h10" />
    </svg>
  );
}

/** FAQ / chat bubble */
export function IconChat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

/** Compass / how-it-works */
export function IconCompass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5l-1.2 4.3-4.3 1.2 1.2-4.3 4.3-1.2z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" />
    </svg>
  );
}

/** Euro / pricing */
export function IconEuro(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 7.5a7 7 0 1 0 0 9" />
      <path d="M5 10h9M5 14h9" />
    </svg>
  );
}

/** Inline icon inside a pill/badge span */
export function IconSlot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center ${className ?? ""}`} aria-hidden>
      {children}
    </span>
  );
}
