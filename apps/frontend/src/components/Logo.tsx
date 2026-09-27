interface LogoProps {
  iconClassName?: string;
  textClassName?: string;
}

/** Exness-style brand mark: yellow "ex" tile + wordmark. */
export default function Logo({ iconClassName = "w-8 h-8", textClassName = "text-lg" }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <img src="/exness-logo.png" alt="Exness" className={`${iconClassName} rounded-lg shrink-0`} />
      <span className={`${textClassName} font-extrabold tracking-tight text-fg leading-none`}>
        Exness
      </span>
    </span>
  );
}
