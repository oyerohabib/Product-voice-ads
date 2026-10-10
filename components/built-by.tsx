const GITHUB_URL = "https://github.com/oyerohabib";
const REPO_URL = "https://github.com/oyerohabib/Product-voice-ads";
const WEBSITE_URL = "https://oyerohabib.com/";

const iconLink =
  "inline-flex size-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900";

export function BuiltBy() {
  return (
    <div className="flex shrink-0 items-center gap-0.5 self-end rounded-full border border-zinc-200 bg-white py-0.5 pr-0.5 pl-3 text-xs text-zinc-600 shadow-sm sm:self-auto">
      <span className="mr-1">
        Built by{" "}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-900 hover:underline"
        >
          @oyerohabib
        </a>
      </span>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="View the source code on GitHub"
        className="inline-flex h-7 items-center gap-1 rounded-full px-2 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="size-3.5">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Source
      </a>
      <a
        href={WEBSITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Personal website"
        title="oyerohabib.com"
        className={iconLink}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="size-4"
        >
          <circle cx="10" cy="10" r="7.25" />
          <path d="M2.75 10h14.5M10 2.75c1.9 2 2.85 4.42 2.85 7.25S11.9 15.25 10 17.25C8.1 15.25 7.15 12.83 7.15 10S8.1 4.75 10 2.75Z" />
        </svg>
      </a>
    </div>
  );
}
