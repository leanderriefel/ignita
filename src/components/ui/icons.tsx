import type * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function baseProps(props: IconProps): IconProps {
  return {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

/** Geometric Ignita flame mark — neutral by default to obey the gold allowance. */
export function BrandMark({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        d="M10.4 2.2C10.9 5.3 14.8 7.3 14.8 11.4C14.8 14.6 12.7 17.2 9.8 17.8C11.1 16.5 11.6 14.9 11.1 13.3C10.7 12.1 9.6 11.4 9.5 10.1C8.3 11.2 7.8 12.6 8.1 14.1C8.3 15.2 8.9 16 9.5 16.7C6.8 16.4 5.2 14.2 5.2 11.5C5.2 8.1 8.5 5.8 10.4 2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <circle cx="7.25" cy="7.25" r="4.75" />
      <path d="M10.8 10.8L14 14" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-3.5 w-3.5", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M4 6.25L8 10.25L12 6.25" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-3.5 w-3.5", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M6.25 4L10.25 8L6.25 12" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M3.25 8H12.75" />
      <path d="M8.75 4L12.75 8L8.75 12" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M12.75 8H3.25" />
      <path d="M7.25 4L3.25 8L7.25 12" />
    </svg>
  );
}

export function CheckIcon({ className = "h-3.5 w-3.5", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M3.5 8.5L6.5 11.5L12.5 4.75" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M4.25 4.25L11.75 11.75" />
      <path d="M11.75 4.25L4.25 11.75" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M2.5 8H13.5" />
      <path d="M8 2.25C9.6 4 10.35 5.95 10.35 8C10.35 10.05 9.6 12 8 13.75C6.4 12 5.65 10.05 5.65 8C5.65 5.95 6.4 4 8 2.25Z" />
    </svg>
  );
}

export function ClockIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 4.75V8L10.25 9.5" />
    </svg>
  );
}

export function HomeIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <path d="M2.75 7.25L8 2.75L13.25 7.25" />
      <path d="M4.25 6.5V13H11.75V6.5" />
    </svg>
  );
}

export function CompassIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M10.4 5.6L9.1 9.1L5.6 10.4L6.9 6.9L10.4 5.6Z" />
    </svg>
  );
}

export function AlertCircleIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg {...baseProps(props)} className={className}>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 5V8.25" />
      <circle cx="8" cy="10.75" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpinnerIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`animate-spin ${className}`}
      {...props}
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.75" />
      <path
        d="M13.5 8A5.5 5.5 0 0 0 8 2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({ className = "h-3 w-3", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M8 1.5L9.9 5.65L14.5 6.15L11.05 9.2L12.05 13.75L8 11.4L3.95 13.75L4.95 9.2L1.5 6.15L6.1 5.65L8 1.5Z" />
    </svg>
  );
}
