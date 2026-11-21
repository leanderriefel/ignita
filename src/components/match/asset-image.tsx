import * as React from "react";

import { cn } from "../ui/cn";

/**
 * Known Data Dragon broken icon fallback (design-spec.md):
 * profile icon 6128 fails to load; substitute 4568.
 */
export function safeProfileIconId(iconId: number | undefined): number {
  if (!iconId || iconId === 6128) {
    return 4568;
  }
  return iconId;
}

export interface AssetImageProps {
  src: string | null;
  alt: string;
  className?: string;
  emptyClassName?: string;
  priority?: boolean;
}

/**
 * Renders Data Dragon / Community Dragon imagery with a quiet empty-slot fallback
 * whenever `src` is null or the CDN returns 404.
 */
export function AssetImage({
  src,
  alt,
  className,
  emptyClassName,
  priority = false,
}: AssetImageProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "bg-empty-slot border-[0.5px] border-empty-slot-border/80",
          className,
          emptyClassName,
        )}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
