import Image from "next/image";

export function Brand() {
  return <>
    <span className="brand-symbol" aria-hidden="true">
      <Image src="/assets/chemizen-logo.png" alt="" width={1254} height={1254} sizes="120px" />
    </span>
    <span className="brand-wordmark">CHEMIZEN<span className="brand-labs">LABS</span></span>
  </>;
}
