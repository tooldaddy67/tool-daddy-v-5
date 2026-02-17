import Link from 'next/link';
import dynamic from 'next/dynamic';

const FeedbackModal = dynamic(() => import('@/components/feedback-modal').then(mod => mod.FeedbackModal));

const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 420 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path d="M128 341.333C128 304.6 154.6 278 181.333 278H234.667C261.4 278 288 304.6 288 341.333V341.333C288 378.067 261.4 404.667 234.667 404.667H181.333C154.6 404.667 128 378.067 128 341.333V341.333Z" fill="#F87171" />
    <path d="M288 170.667C288 133.933 314.6 107.333 341.333 107.333H384V404.667H341.333C314.6 404.667 288 378.067 288 341.333V170.667Z" fill="#F87171" />
    <path d="M150 256C183.5 204 250 204 282 256C314 308 380.5 308 414 256" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiscordIcon = () => (
  <svg
    role="img"
    width="20"
    height="20"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-current"
  >
    <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.073 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1 .015.019.05.05 0 0 1-.02.066c-.433.295-.874.52-1.248.595a.05.05 0 0 0-.01.059c.236.466.51.899.818 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.126a.04.04 0 0 0-.021-.018Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
  </svg>
);


export default function AppFooter() {
  return (
    <footer className="w-full border-t border-border/20 bg-background/50 backdrop-blur-lg mt-auto pb-24 xl:pb-0">
      <div className="mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <Logo />
          <p className="text-[10px] md:text-sm text-muted-foreground text-center sm:text-left">&copy; {new Date().getFullYear()} Tool Daddy. All Rights Reserved.</p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2 text-xs text-muted-foreground/60 text-center sm:text-right w-full sm:w-auto">
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 md:gap-4 text-xs md:text-sm text-foreground/80">
            <Link href="https://discord.gg/TgErTdrGrG" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2" aria-label="Join our Discord community">
              <DiscordIcon />
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              About Us
            </Link>
            <Link href="/buy-me-a-coffee" className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Support Us
            </Link>
            <Link href="/feedback" prefetch={false} className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Feedback
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs px-4 sm:px-0">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" className="underline hover:text-foreground">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms" className="underline hover:text-foreground">Terms of Service</a> apply.
          </p>
        </div>
      </div>
    </footer>
  );
}

