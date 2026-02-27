"use client";

import { useState } from "react";

interface ShareBarProps {
    title: string;
    pageUrl: string;
    shareClass: string;
    labelClass: string;
    dividerClass: string;
}

export function ShareBar({ title, pageUrl, shareClass, labelClass, dividerClass }: ShareBarProps) {
    const [copied, setCopied] = useState(false);

    const shareText = `${title} — ${pageUrl}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement("textarea");
            textarea.value = pageUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
        },
        {
            name: "X",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            name: "Threads",
            url: `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`,
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.021.88-.727 2.11-1.126 3.553-1.165.3-.008.593-.008.88-.001.124-1.035.021-1.887-.312-2.543-.421-.832-1.17-1.253-2.225-1.253h-.064c-.738.01-1.359.265-1.796.739l-1.484-1.346c.714-.786 1.69-1.206 2.816-1.217l.09-.002h.118c1.67 0 2.938.588 3.77 1.746.646.9.973 2.09.964 3.499l.003.137c.895.166 1.703.465 2.392.891 1.095.676 1.905 1.637 2.34 2.776.77 2.016.72 4.855-1.45 6.983-1.86 1.822-4.115 2.632-7.3 2.657z M14.729 14.09c-.018-1.543-.74-2.427-2.216-2.71-.47-.09-.982-.13-1.524-.119-1.014.027-1.823.303-2.34.798-.482.462-.686 1.044-.66 1.512.04.682.372 1.2.936 1.565.607.395 1.424.575 2.296.535 1.12-.062 1.985-.44 2.573-1.12.381-.44.666-1.08.823-1.89l.002-.012.006-.026.016-.07.056-.258.03-.143.002-.063z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            {/* Divider */}
            <div className={`w-12 h-px mx-auto mb-4 ${dividerClass}`} />

            {/* Label */}
            <p className={`text-center text-[11px] uppercase tracking-widest mb-4 ${labelClass}`}>
                Bagikan
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
                {shareLinks.map((item) => (
                    <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Bagikan ke ${item.name}`}
                        className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 ${shareClass}`}
                    >
                        {item.icon}
                    </a>
                ))}

                {/* Copy Link Button */}
                <button
                    onClick={handleCopy}
                    title="Salin Link"
                    className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 ${shareClass}`}
                >
                    {copied ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-green-400">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
