import Image from "next/image";

interface BrandProps {
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function Brand({ theme = "auto", className = "" }: BrandProps) {
  return (
    <span className={`brand-lockup ${className}`} data-theme={theme}>
      <span className="brand-symbol" aria-hidden="true">
        <Image
          src="/assets/chemizen-logo-gold.png"
          alt="Chemizen Labs logo"
          width={40}
          height={40}
          priority
          className="brand-logo-img"
        />
      </span>
      <span className="brand-text-wrapper" aria-hidden="true">
        <Image
          src="/assets/logo-text-white.png"
          alt="CHEMIZEN LABS"
          width={130}
          height={42}
          priority
          className="brand-text-img brand-text-white"
        />
        <Image
          src="/assets/logo-text-black.png"
          alt="CHEMIZEN LABS"
          width={130}
          height={42}
          priority
          className="brand-text-img brand-text-black"
        />
      </span>
      <span className="sr-only">Chemizen Labs</span>
    </span>
  );
}
