"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/components/settings-provider';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    pulseSpeed: number;
    pulseOffset: number;
}

interface GrassBlade {
    x: number;
    baseY: number;
    height: number;
    width: number;
    color: string;
    speed: number;
    offset: number;
    bend: number;
}

interface Flower {
    x: number;
    y: number;
    size: number;
    petalColor: string;
    sway: number;
}

interface Apple {
    x: number;
    y: number;
    size: number;
    color: string;
}

type ZenThemeType = 'dawn' | 'day' | 'sunset' | 'night';

export const ZenBackground = () => {
    const { theme: currentTheme } = useTheme();
    const { settings } = useSettings();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zenTheme, setZenTheme] = useState<ZenThemeType>('day');
    const particles = useRef<Particle[]>([]);
    const grass = useRef<GrassBlade[]>([]);
    const flowers = useRef<Flower[]>([]);
    const apples = useRef<Apple[]>([]);
    const mouse = useRef({ x: 0, y: 0, active: false });
    const isDesktop = useRef(true);

    // Initial check for desktop and responsiveness
    useEffect(() => {
        const checkDesktop = () => {
            isDesktop.current = window.innerWidth >= 1024;
        };
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (currentTheme === 'light' && settings.bgStyle === 'idk-wtf' && isDesktop.current) {
            root.classList.add('zen-active');
            // Add specific theme class for contrast
            root.classList.remove('zen-dawn', 'zen-day', 'zen-sunset', 'zen-night');
            root.classList.add(`zen-${zenTheme}`);
        } else {
            root.classList.remove('zen-active', 'zen-dawn', 'zen-day', 'zen-sunset', 'zen-night');
        }
        return () => root.classList.remove('zen-active', 'zen-dawn', 'zen-day', 'zen-sunset', 'zen-night');
    }, [currentTheme, settings.bgStyle, zenTheme]);

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 8) setZenTheme('dawn');
            else if (hour >= 8 && hour < 17) setZenTheme('day');
            else if (hour >= 17 && hour < 20) setZenTheme('sunset');
            else setZenTheme('night');
        };
        updateTheme();
        const interval = setInterval(updateTheme, 60000);
        return () => clearInterval(interval);
    }, []);

    const themeColors: Record<ZenThemeType, {
        sky: [string, string],
        stars: string[],
        celestial: string,
        celestialGlow: string,
        hills: string[],
        grass: string[],
        flowers: string[],
        trunk: string,
        foliage: string
    }> = {
        dawn: {
            sky: ['#ff9a9e', '#fad0c4'],
            stars: ['#ffffff'],
            celestial: '#fff9c4',
            celestialGlow: 'rgba(255, 200, 150, 0.4)',
            hills: ['#8d6e63', '#6d4c41', '#4e342e'],
            grass: ['#4e342e', '#6d4c41', '#8d6e63'],
            flowers: ['#f48fb1', '#ce93d8', '#ffcc80', '#f8bbd0', '#e1bee7', '#ffe0b2'],
            trunk: '#5d4037',
            foliage: '#6d4c41'
        },
        day: {
            sky: ['#89f7fe', '#66a6ff'],
            stars: ['#ffffff'],
            celestial: '#fffde7',
            celestialGlow: 'rgba(255, 255, 0, 0.3)',
            hills: ['#43a047', '#2e7d32', '#1b5e20'],
            grass: ['#1b5e20', '#2e7d32', '#43a047'],
            flowers: ['#e91e63', '#9c27b0', '#ffeb3b', '#ffffff', '#ff4081', '#7b1fa2', '#ffd600', '#f5f5f5', '#ff80ab'],
            trunk: '#5d4037',
            foliage: '#2e7d32'
        },
        sunset: {
            sky: ['#2c3e50', '#ff6e7f'],
            stars: ['#ffffff'],
            celestial: '#ffcc80',
            celestialGlow: 'rgba(255, 110, 0, 0.5)',
            hills: ['#bf360c', '#3e2723', '#212121'],
            grass: ['#3e2723', '#212121', '#4e342e'],
            flowers: ['#ff5722', '#ff9800', '#f44336', '#ff7043', '#ffab40', '#ef5350', '#ff3d00'],
            trunk: '#3e2723',
            foliage: '#5d4037'
        },
        night: {
            sky: ['#0f0c29', '#000000'],
            stars: ['#ffffff', '#bbdefb'],
            celestial: '#f5f5f5',
            celestialGlow: 'rgba(200, 200, 255, 0.4)',
            hills: ['#1a237e', '#0d47a1', '#01579b'],
            grass: ['#01579b', '#000a2e', '#1a237e'],
            flowers: ['#5c6bc0', '#3f51b5', '#283593', '#7986cb', '#3949ab', '#1a237e', '#b3e5fc'],
            trunk: '#1a237e',
            foliage: '#0d47a1'
        }
    };

    const getHillY = (x: number, altitude: number, amplitude: number, frequency: number, timeShift: number) => {
        const o1 = Math.sin(x * frequency + timeShift);
        const o2 = Math.sin(x * frequency * 2.5 + timeShift * 1.5) * 0.4;
        const o3 = Math.sin(x * frequency * 5.2 + timeShift * 2) * 0.15;
        return (o1 + o2 + o3) * amplitude + altitude;
    };

    useEffect(() => {
        // Only run canvas logic on desktop and if "idk-wtf" is active
        if (currentTheme !== 'light' || settings.bgStyle !== 'idk-wtf' || !isDesktop.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initScene();
        };

        const initScene = () => {
            // Stars
            particles.current = [];
            const pCount = Math.floor((canvas.width * canvas.height) / 12000);
            for (let i = 0; i < pCount; i++) {
                particles.current.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.03, vy: (Math.random() - 0.5) * 0.03,
                    size: Math.random() * 1.2 + 0.4, color: 'rgba(255, 255, 255, 1)',
                    opacity: 0.1 + Math.random() * 0.6, pulseSpeed: 0.01 + Math.random() * 0.03, pulseOffset: Math.random() * Math.PI * 2
                });
            }

            // High Density Realistic Grass
            grass.current = [];
            const gCount = Math.floor(canvas.width / 0.8);
            const gColors = themeColors[zenTheme].grass;
            for (let i = 0; i < gCount; i++) {
                grass.current.push({
                    x: i * 0.8 + (Math.random() - 0.5) * 3,
                    baseY: canvas.height,
                    height: 35 + Math.random() * 55,
                    width: 0.8 + Math.random() * 1.5,
                    color: gColors[Math.floor(Math.random() * gColors.length)],
                    speed: 0.01 + Math.random() * 0.02,
                    offset: Math.random() * Math.PI * 2,
                    bend: (Math.random() - 0.5) * 8
                });
            }

            // Flowers - Triple density for a lush meadow
            flowers.current = [];
            const fCount = 45 + Math.floor(canvas.width / 40);
            const fPalette = themeColors[zenTheme].flowers;
            for (let i = 0; i < fCount; i++) {
                flowers.current.push({
                    x: Math.random() * canvas.width,
                    y: canvas.height - 5 - Math.random() * 60, // Increased vertical spread
                    size: 2.2 + Math.random() * 3.5,
                    petalColor: fPalette[Math.floor(Math.random() * fPalette.length)],
                    sway: Math.random() * Math.PI * 2
                });
            }

            // Apples (Relative to the tree position we will draw)
            apples.current = [];
            const appleCount = 12;
            for (let i = 0; i < appleCount; i++) {
                apples.current.push({
                    x: (Math.random() - 0.5) * 120, // Relative to tree center
                    y: (Math.random() - 0.5) * 100 - 150, // Relative to tree base
                    size: 3 + Math.random() * 3,
                    color: Math.random() > 0.3 ? '#e53935' : '#7cb342' // Red or Green apples
                });
            }
        };

        const drawTree = (ctx: CanvasRenderingContext2D, time: number) => {
            const treeBaseX = canvas.width * 0.2; // Position tree on left
            const treeBaseY = canvas.height;
            const wind = Math.sin(time * 0.5) * 5;

            ctx.save();
            ctx.translate(treeBaseX, treeBaseY);

            // Trunk (Swaying slightly)
            ctx.fillStyle = themeColors[zenTheme].trunk;
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.quadraticCurveTo(-10, -100, -8 + wind * 0.2, -220);
            ctx.lineTo(8 + wind * 0.2, -220);
            ctx.quadraticCurveTo(10, -100, 15, 0);
            ctx.fill();

            // Foliage (Big fluffy blobs)
            ctx.fillStyle = themeColors[zenTheme].foliage;
            const drawLeafCloud = (ox: number, oy: number, r: number) => {
                const sx = ox + wind * 1.5;
                ctx.beginPath();
                ctx.arc(sx, oy, r, 0, Math.PI * 2);
                ctx.fill();
            };

            drawLeafCloud(0, -250, 80);
            drawLeafCloud(-60, -220, 60);
            drawLeafCloud(60, -220, 60);
            drawLeafCloud(-40, -300, 50);
            drawLeafCloud(40, -300, 50);

            // Apples attached to the foliage sway
            apples.current.forEach(a => {
                const ax = a.x + wind * 1.8;
                const ay = a.y - 120; // Re-align to foliage height
                ctx.fillStyle = a.color;
                ctx.beginPath();
                ctx.arc(ax, ay, a.size, 0, Math.PI * 2);
                ctx.fill();
                // Little bit of shine
                ctx.fillStyle = 'white';
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(ax - a.size * 0.3, ay - a.size * 0.3, a.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            ctx.restore();
        };

        const drawMeadow = (time: number) => {
            const globalWind = Math.sin(time * 0.6) * 15;

            // Draw Grass
            grass.current.forEach(g => {
                const localWind = Math.sin(time * g.speed * 50 + g.offset) * 8;
                const mDx = mouse.current.x - g.x;
                const mouseForce = mouse.current.active && Math.abs(mDx) < 120 ? (1 - Math.abs(mDx) / 120) * (mDx > 0 ? -35 : 35) : 0;

                const tipX = g.x + g.bend + globalWind + localWind + mouseForce;
                const tipY = g.baseY - g.height;

                const grad = ctx.createLinearGradient(g.x, g.baseY, tipX, tipY);
                grad.addColorStop(0, 'rgba(0,0,0,0.1)'); // Ground depth shadow
                grad.addColorStop(0.5, g.color);
                ctx.strokeStyle = grad;

                ctx.lineWidth = g.width;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(g.x, g.baseY);
                ctx.quadraticCurveTo(g.x, g.baseY - g.height / 2, tipX, tipY);
                ctx.stroke();
            });

            // Draw Flowers
            flowers.current.forEach(f => {
                const swayMultiplier = 1.0 + (f.size / 5);
                const sway = Math.sin(time * 0.8 + f.sway) * 10 * swayMultiplier + globalWind * 0.4;
                const fx = f.x + sway;
                const fy = f.y;

                // Stem
                ctx.strokeStyle = zenTheme === 'night' ? '#1a237e' : '#2e7d32';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(f.x, canvas.height);
                ctx.quadraticCurveTo(f.x, canvas.height - (canvas.height - fy) / 2, fx, fy);
                ctx.stroke();

                // Night glow for flowers
                if (zenTheme === 'night') {
                    ctx.save();
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = f.petalColor;
                    ctx.globalAlpha = 0.6;
                }

                ctx.fillStyle = f.petalColor;
                // Petals
                const petalCount = 5 + (Math.floor(f.x) % 3); // Varying petal counts
                for (let i = 0; i < petalCount; i++) {
                    const angle = (i * (Math.PI * 2)) / petalCount + time * 0.5;
                    ctx.beginPath();
                    // More elongated petals
                    const petalX = fx + Math.cos(angle) * f.size;
                    const petalY = fy + Math.sin(angle) * f.size;
                    ctx.ellipse(petalX, petalY, f.size * 0.9, f.size * 0.5, angle, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (zenTheme === 'night') ctx.restore();

                // Center
                ctx.fillStyle = zenTheme === 'night' ? '#fff9c4' : '#fdd835';
                ctx.beginPath();
                ctx.arc(fx, fy, f.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const drawHills = (time: number) => {
            const hills = themeColors[zenTheme].hills;
            const mouseXShift = (mouse.current.x / window.innerWidth - 0.5) * 60;

            hills.forEach((color, index) => {
                const layer = index + 1;
                ctx.save();
                const parallaxX = mouseXShift * (layer * 0.2);
                const altitude = canvas.height * (0.65 + index * 0.1);
                const amp = 30 + index * 20;
                const freq = 0.0012;

                ctx.beginPath();
                ctx.moveTo(0, canvas.height);
                for (let x = 0; x <= canvas.width; x += 10) {
                    const hillY = getHillY(x + parallaxX, altitude, amp, freq, time * 0.05 * layer);
                    ctx.lineTo(x, hillY);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, altitude - amp, 0, canvas.height);
                grad.addColorStop(0, color);
                grad.addColorStop(1, 'rgba(0,0,0,0.6)');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
        };

        const drawCelestial = () => {
            const x = canvas.width - 200;
            const y = 150;
            const r = 60;
            ctx.save();
            const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
            glow.addColorStop(0, themeColors[zenTheme].celestialGlow);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(x, y, r * 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = themeColors[zenTheme].celestial;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const time = Date.now() * 0.001;

            // Sky
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, themeColors[zenTheme].sky[0]);
            skyGrad.addColorStop(1, themeColors[zenTheme].sky[1]);
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            particles.current.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                const alpha = Math.max(0.1, p.opacity * (0.5 + Math.sin(time * p.pulseSpeed * 100 + p.pulseOffset) * 0.5));
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            });

            drawCelestial();
            drawHills(time);
            drawTree(ctx, time);
            drawMeadow(time);

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { ...mouse.current, x: e.clientX, y: e.clientY, active: true };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();
        draw();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [zenTheme, currentTheme, settings.bgStyle]);

    if (currentTheme !== 'light' || !isDesktop.current || settings.bgStyle !== 'idk-wtf') return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000"
        />
    );
};
