import React from "react";

export interface BrandLogoProps {
    variant?: "full" | "mark" | "wordmark";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    withBackground?: boolean;
    className?: string;
    textClassName?: string;
    showDot?: boolean;
}

const sizeConfig = {
    xs: {
        markSize: 20,
        strokeWidth: 3.6,
        textSize: "text-sm",
        gap: "gap-1.5",
        rx: 6,
    },
    sm: {
        markSize: 24,
        strokeWidth: 3.4,
        textSize: "text-base",
        gap: "gap-2",
        rx: 7,
    },
    md: {
        markSize: 32,
        strokeWidth: 3.2,
        textSize: "text-lg",
        gap: "gap-2.5",
        rx: 9,
    },
    lg: {
        markSize: 40,
        strokeWidth: 3.0,
        textSize: "text-2xl",
        gap: "gap-3",
        rx: 11,
    },
    xl: {
        markSize: 56,
        strokeWidth: 2.8,
        textSize: "text-3xl",
        gap: "gap-3.5",
        rx: 16,
    },
};

export function BrandLogo({
    variant = "full",
    size = "md",
    withBackground = true,
    className = "",
    textClassName = "",
    showDot = true,
}: BrandLogoProps) {
    const config = sizeConfig[size] || sizeConfig.md;
    const markDimension = config.markSize;

    // SVG Mark
    const renderMark = () => {
        if (withBackground) {
            return (
                <svg
                    width={markDimension}
                    height={markDimension}
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id={`taut-bg-${size}`} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#E2896C" />
                            <stop offset="60%" stopColor="#CC785C" />
                            <stop offset="100%" stopColor="#A55238" />
                        </linearGradient>
                    </defs>
                    <rect width="48" height="48" rx="14" fill={`url(#taut-bg-${size})`} />
                    <g transform="rotate(-45 24 24)">
                        {/* Link 2 (Base) */}
                        <rect x="20" y="17.5" width="20" height="13" rx="6.5" stroke="#FAF9F5" strokeWidth={config.strokeWidth} fill="none" />
                        {/* Link 1 (Base) */}
                        <rect x="8" y="17.5" width="20" height="13" rx="6.5" stroke="#FAF9F5" strokeWidth={config.strokeWidth} fill="none" />
                        {/* Overlap weave: top of Link 1 crosses over Link 2 */}
                        <path
                            d="M19 17.5H21.5C25.0899 17.5 28 20.4101 28 24C28 24.5 27.9 25 27.7 25.5"
                            stroke="#FAF9F5"
                            strokeWidth={config.strokeWidth}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </g>
                </svg>
            );
        }

        // Bare vector stroke mark without background squircle
        return (
            <svg
                width={markDimension}
                height={markDimension}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                aria-hidden="true"
            >
                <g transform="rotate(-45 24 24)">
                    <rect x="20" y="17.5" width="20" height="13" rx="6.5" stroke="currentColor" strokeWidth={config.strokeWidth + 0.4} fill="none" />
                    <rect x="8" y="17.5" width="20" height="13" rx="6.5" stroke="currentColor" strokeWidth={config.strokeWidth + 0.4} fill="none" />
                    <path
                        d="M19 17.5H21.5C25.0899 17.5 28 20.4101 28 24C28 24.5 27.9 25 27.7 25.5"
                        stroke="currentColor"
                        strokeWidth={config.strokeWidth + 0.4}
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>
            </svg>
        );
    };

    if (variant === "mark") {
        return (
            <span className={`inline-flex items-center justify-center ${className}`}>
                {renderMark()}
            </span>
        );
    }

    if (variant === "wordmark") {
        return (
            <span className={`font-serif font-bold tracking-tight text-foreground ${config.textSize} ${textClassName}`}>
                Taut{showDot && <span className="text-primary">.</span>}
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center ${config.gap} ${className}`}>
            {renderMark()}
            <span className={`font-serif font-bold tracking-tight text-foreground leading-none ${config.textSize} ${textClassName}`}>
                Taut{showDot && <span className="text-primary">.</span>}
            </span>
        </span>
    );
}
