"use client";

import { cn } from "@/lib/utils";
import { Zap, Layout, Palette, Code2, MousePointerClick, Layers, ShieldCheck, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Zap,
        title: "Absolutely Efficient",
        description: "Lightning fast performance tailored for productivity.",
    },
    {
        icon: Palette,
        title: "Effortless Design",
        description: "Beautiful interfaces that are easy on the eyes.",
    },
    {
        icon: Cpu,
        title: "Smart Components",
        description: "Intelligent tools that adapt to your needs.",
    },
    {
        icon: Layers,
        title: "Streamlined Process",
        description: "Optimized workflows to save you time.",
    },
];

export function BentoGrid() {
    return (
        <section className="hidden md:block container px-4 md:px-6 py-12 md:py-24 space-y-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    Our Main Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    Our Breakthrough Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Discover a suite of tools built to enhance your productivity and streamline your daily tasks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
                {/* Large Feature Card 1 - Left Column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="col-span-1 md:col-span-1 row-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-2xl font-bold mb-2">Why Tool Daddy?</h3>
                        <p className="text-muted-foreground mb-8">
                            Experience the difference with our meticulously crafted tools.
                        </p>

                        <div className="grid grid-cols-1 gap-6 mt-auto">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{feature.title}</h4>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Feature Card 2 - Top Center/Right */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="col-span-1 md:col-span-2 relative group overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="bg-primary/10 p-3 rounded-full mb-4 text-primary">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Secure & Private</h3>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Your data stays yours. We prioritize privacy with local processing whenever possible and secure cloud storage when you need it.
                        </p>

                        {/* Security Badge UI */}
                        <div className="relative w-full max-w-xs p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden group-hover:bg-background/60 transition-colors duration-500">
                            {/* Decorative background glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-500/20 rounded-full blur-2xl" />

                            <div className="relative z-10 flex items-center justify-center gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-xs font-medium text-green-500">SSL Encrypted</span>
                                </div>
                                <div className="w-px h-12 bg-white/10" />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Cpu className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="text-xs font-medium text-blue-500">Local Process</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Card 3 - Bottom Center */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="col-span-1 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <Code2 className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Developer Friendly</h3>
                        <p className="text-muted-foreground">
                            Built with modern tech like Next.js and Tailwind for performance.
                        </p>
                    </div>
                </motion.div>

                {/* Feature Card 4 - Bottom Right */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="col-span-1 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <MousePointerClick className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
                        <p className="text-muted-foreground">
                            Intuitive interfaces that don't require a manual to understand.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
