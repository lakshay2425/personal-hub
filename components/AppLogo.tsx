import Image from "next/image";

import { SITE_LOGO_IMAGE, SITE_NAME } from "@/lib/site";

interface AppLogoProps {
  className?: string;
  priority?: boolean;
}

export function AppLogo({ className = "h-8 w-8", priority }: AppLogoProps) {
  return (
    <Image
      src={SITE_LOGO_IMAGE}
      alt={`${SITE_NAME} logo`}
      width={64}
      height={64}
      className={`shrink-0 rounded-xl ${className}`}
      priority={priority}
    />
  );
}
