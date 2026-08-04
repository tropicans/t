"use client";

import React, { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface ModernQrCodeProps {
    value: string;
    size?: number;
    className?: string;
    id?: string;
    darkColor?: string;
    lightColor?: string;
    dotType?: "rounded" | "square";
    eyeType?: "rounded" | "square";
}

export function ModernQrCode({
    value,
    size = 200,
    className = "",
    id,
    darkColor = "#09090b", // zinc-950 for premium dark print
    lightColor = "#ffffff",
    dotType = "rounded",
    eyeType = "rounded",
}: ModernQrCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        try {
            // Generate QR Code matrix
            const qr = QRCodeLib.create(value, { errorCorrectionLevel: "M" });
            const { modules } = qr;
            const gridCount = modules.size;
            
            // Set canvas resolution higher for crisp rendering on high-DPI screens
            const resolution = size * 2;
            canvas.width = resolution;
            canvas.height = resolution;
            
            const cellSize = resolution / gridCount;
            
            // Draw background
            ctx.fillStyle = lightColor;
            ctx.fillRect(0, 0, resolution, resolution);
            
            // Helper to check if a cell is inside one of the three finder patterns (eyes)
            const isFinderPattern = (row: number, col: number) => {
                if (row < 7 && col < 7) return true; // Top-Left
                if (row < 7 && col >= gridCount - 7) return true; // Top-Right
                if (row >= gridCount - 7 && col < 7) return true; // Bottom-Left
                return false;
            };

            // Draw Finder Patterns (Eyes)
            const drawFinderPattern = (x: number, y: number) => {
                const eyeSize = 7 * cellSize;
                ctx.save();
                ctx.fillStyle = darkColor;
                
                if (eyeType === "rounded") {
                    // Outer rounded square frame
                    const outerRadius = 1.8 * cellSize;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, y, eyeSize, eyeSize, outerRadius);
                    } else {
                        ctx.rect(x, y, eyeSize, eyeSize);
                    }
                    ctx.fill();
                    
                    // White cutout
                    ctx.fillStyle = lightColor;
                    const maskOffset = 1 * cellSize;
                    const maskSize = 5 * cellSize;
                    const maskRadius = 1.0 * cellSize;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x + maskOffset, y + maskOffset, maskSize, maskSize, maskRadius);
                    } else {
                        ctx.rect(x + maskOffset, y + maskOffset, maskSize, maskSize);
                    }
                    ctx.fill();
                    
                    // Inner rounded square center dot
                    ctx.fillStyle = darkColor;
                    const centerOffset = 2 * cellSize;
                    const centerSize = 3 * cellSize;
                    const centerRadius = 0.6 * cellSize;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x + centerOffset, y + centerOffset, centerSize, centerSize, centerRadius);
                    } else {
                        ctx.rect(x + centerOffset, y + centerOffset, centerSize, centerSize);
                    }
                    ctx.fill();
                } else {
                    // Classic square eye
                    ctx.fillRect(x, y, eyeSize, eyeSize);
                    ctx.fillStyle = lightColor;
                    ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
                    ctx.fillStyle = darkColor;
                    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
                }
                ctx.restore();
            };

            // Draw the three finder patterns
            drawFinderPattern(0, 0); // Top-Left
            drawFinderPattern((gridCount - 7) * cellSize, 0); // Top-Right
            drawFinderPattern(0, (gridCount - 7) * cellSize); // Bottom-Left

            // Draw data modules
            ctx.fillStyle = darkColor;
            for (let row = 0; row < gridCount; row++) {
                for (let col = 0; col < gridCount; col++) {
                    if (isFinderPattern(row, col)) continue;
                    
                    const isDark = modules.data[row * gridCount + col] === 1;
                    if (isDark) {
                        const cx = col * cellSize + cellSize / 2;
                        const cy = row * cellSize + cellSize / 2;
                        
                        if (dotType === "rounded") {
                            // Circular data dot
                            ctx.beginPath();
                            ctx.arc(cx, cy, (cellSize / 2) * 0.85, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            // Standard square data dot
                            const x = col * cellSize;
                            const y = row * cellSize;
                            ctx.fillRect(x + 0.3, y + 0.3, cellSize - 0.6, cellSize - 0.6);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Gagal menggambar QR Code", err);
        }
    }, [value, size, darkColor, lightColor, dotType, eyeType]);

    return (
        <canvas
            ref={canvasRef}
            id={id}
            style={{ width: `${size}px`, height: `${size}px` }}
            className={`block max-w-full h-auto ${className}`}
        />
    );
}
