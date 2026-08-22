type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <radialGradient id="instagramGradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#instagramGradient)" />
      <rect x="7" y="7" width="10" height="10" rx="3" fill="none" stroke="#fff" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" strokeWidth="1.4" />
      <circle cx="15.3" cy="8.7" r="0.8" fill="#fff" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.7 20v-6.5h2.2l.3-2.6h-2.5v-1.6c0-.75.2-1.27 1.29-1.27h1.38V5.68c-.24-.03-1.05-.1-2-.1-1.98 0-3.34 1.2-3.34 3.42v1.9H8.75v2.6h2.31V20h2.64Z"
      />
    </svg>
  );
}

export function TwitterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M20 5.8c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.6-2.1-.7.4-1.6.8-2.4 1a3.8 3.8 0 0 0-6.5 3.5A10.8 10.8 0 0 1 3 4.9a3.9 3.9 0 0 0 1.2 5.2c-.6 0-1.2-.2-1.7-.4v.1c0 1.9 1.3 3.4 3.1 3.8-.6.1-1.1.2-1.7.1.5 1.5 1.9 2.6 3.6 2.7A7.7 7.7 0 0 1 2 18.4a10.8 10.8 0 0 0 5.9 1.7c7 0 10.9-6 10.9-11.1v-.5c.8-.5 1.4-1.2 1.9-2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#FF0000" />
      <rect x="6.3" y="7.4" width="11.4" height="9.2" rx="2.3" fill="#fff" />
      <path fill="#FF0000" d="M10.3 9.6 L10.3 14.4 L14.8 12 Z" />
    </svg>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.84 14.16c-.25.7-1.45 1.34-2 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.98-.31-1.69-.62-2.98-1.29-4.93-4.28-5.08-4.48-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37h.57c.18 0 .43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.02.97.3.15.5.22.57.35.08.13.08.75-.17 1.45Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#0A66C2" />
      <circle cx="8.4" cy="8.4" r="1.35" fill="#fff" />
      <rect x="7.25" y="10.6" width="2.3" height="7" fill="#fff" />
      <path
        fill="#fff"
        d="M11.8 10.6h2.2v1.15c.45-.8 1.4-1.35 2.4-1.35 2 0 2.9 1.3 2.9 3.55V17.6h-2.3v-3.3c0-.85-.35-1.5-1.2-1.5-.75 0-1.3.5-1.3 1.5v3.3h-2.3V10.6Z"
      />
    </svg>
  );
}
