import type { LucideIcon } from "lucide-react";
import type { SVGProps } from "react";

/**
 * Wrapper around a lucide icon enforcing the site's icon standard:
 *   - three discrete sizes: 16 / 20 / 24 (matching common touch + density targets)
 *   - stroke-width 1.5 (slightly lighter than lucide's 2 default, harmonizes
 *     with the hairline borders + thin display-font weight used elsewhere)
 *   - currentColor by default so you control color from text-* utilities
 *
 * Usage:
 *   import { Icon } from "@/components/icons/Icon";
 *   import { ArrowRight } from "lucide-react";
 *   <Icon as={ArrowRight} size="sm" />
 */

export type IconSize = "sm" | "md" | "lg";

const SIZE_PX: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "size"> & {
  as: LucideIcon;
  size?: IconSize | number;
  strokeWidth?: number;
};

export function Icon({ as: IconComponent, size = "sm", strokeWidth = 1.5, ...rest }: IconProps) {
  const pixelSize = typeof size === "number" ? size : SIZE_PX[size];
  return <IconComponent size={pixelSize} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
