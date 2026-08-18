import React from "react";
import { cn } from "@/lib/utils";
import { BoxReveal } from "../reveal-animations";

const AboutSection = () => {
    return (
        <section id="about" className="container mx-auto px-4 md:px-[50px] xl:px-[150px] py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl">

                {/* Left Image */}
                <div className="md:w-1/3 flex justify-center shrink-0">
                    <BoxReveal width="100%">
                        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-800 shadow-xl">
                            <img
                                src="/assets/me2.jpg"
                                alt="Ansh Gajera"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </BoxReveal>
                </div>

                {/* Right Text */}
                <div className="md:w-2/3">
                    <BoxReveal width="100%">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            About Me
                        </h2>
                    </BoxReveal>

                    <BoxReveal width="100%" delay={0.2}>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                            I&apos;m Ansh, a B.Tech Artificial Intelligence &amp; Machine Learning student interested in building practical, real-world intelligent systems. I work across the AIML stack, from data understanding and machine learning to automation and system-level design.
                        </p>
                    </BoxReveal>

                    <BoxReveal width="100%" delay={0.4}>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            I&apos;ve built fully functional websites and applications using modern development practices and AI-assisted workflows, with a focus on clean architecture, logical reasoning, and scalable solutions.
                        </p>
                    </BoxReveal>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
