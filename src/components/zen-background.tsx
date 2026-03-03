"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
}

export const ZenBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [theme, setTheme] = useState<'dawn' | 'day' | 'sunset' | 'night'>('day');
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0, active: false });

    // Determine theme based on local time
    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 8) setTheme('dawn');
            else if (hour >= 8 && hour < 17) setTheme('day');
            else if (hour >= 17 && hour < 20) setTheme('sunset');
            else setTheme('night');
        };

        updateTheme();
        const interval = setInterval(updateTheme, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const themeColors = {
        dawn: { bg: ['#ff9a9e', '#fad0c4'], particle: 'rgba(255, 255, 255, 0.4)' },
        day: { bg: ['#89f7fe', '#66a6ff'], particle: 'rgba(255, 255, 255, 0.3)' },
        sunset: { bg: ['#fa709a', '#fee140'], particle: 'rgba(255, 255, 255, 0.5)' },
        night: { bg: ['#0f0c29', '#24243e'], particle: 'rgba(255, 255, 255, 0.2)' }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles.current = [];
            const count = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < count; i++) {
                particles.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: themeColors[theme].particle
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, themeColors[theme].bg[0]);
            gradient.addColorStop(1, themeColors[theme].bg[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Mouse interaction
                if (mouse.current.active) {
                    const dx = mouse.current.x - p.x;
                    const dy = mouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const force = (150 - dist) / 150;
                        p.vx -= dx * force * 0.02;
                        p.vy -= dy * force * 0.02;
                    }
                }

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Friction
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Constant drift
                p.vx += (Math.random() - 0.5) * 0.01;
                p.vy += (Math.random() - 0.5) * 0.01;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouse.current.active = false;
        };

        const handleHitImpact = (e: any) => {
            const { amplitude } = e.detail;
            // Create a "pulse" effect by pushing particles away from center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.current.forEach(p => {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = (amplitude * 20) / (dist / 100 + 1);
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            });
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('hit-impact', handleHitImpact);

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('hit-impact', handleHitImpact);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none opacity-40 transition-opacity duration-1000"
            style={{ filter: 'blur(40px)' }}
        />
    );
};
