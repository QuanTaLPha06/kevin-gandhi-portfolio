"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProjectBySlug, BackendProject } from "@/lib/api";
import { ArrowLeft, ExternalLink, Github, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

function ProjectDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [project, setProject] = useState<BackendProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        async function loadProject() {
            if (!slug) return;
            try {
                const data = await fetchProjectBySlug(slug);
                if (data) {
                    setProject(data);
                } else {
                    setError("Project not found");
                }
            } catch (err) {
                console.error("Error loading project:", err);
                setError("Failed to load project");
            } finally {
                setLoading(false);
            }
        }
        loadProject();
    }, [slug]);

    useEffect(() => {
        setCurrentImage(0);
    }, [project?._id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-xl text-zinc-600 dark:text-zinc-400">Loading project...</div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl text-zinc-900 dark:text-white">Project Not Found</h1>
                <p className="text-zinc-500">The project you&apos;re looking for doesn&apos;t exist.</p>
                <Link
                    href="/projects"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mt-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>
            </div>
        );
    }

    const images = project.images?.filter((img) => !!img.url) || [];
    const selectedImage = images[currentImage];
    const projectDate = new Date(project.createdAt);
    const formattedDate = projectDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const goToPreviousImage = () => setCurrentImage((index) => (index === 0 ? images.length - 1 : index - 1));
    const goToNextImage = () => setCurrentImage((index) => (index + 1) % images.length);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Back Link */}
                        <Link
                            href="/#projects"
                            className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Works
                        </Link>

                        {/* Technologies */}
                        {project.tags && project.tags.length > 0 && (
                            <div>
                                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-semibold">
                                    Technologies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-semibold">
                                Date
                            </h3>
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                                <Calendar className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm">{formattedDate}</span>
                            </div>
                        </div>

                        {/* Links */}
                        {(project.liveUrl || project.githubUrl) && (
                            <div>
                                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-semibold">
                                    Links
                                </h3>
                                <div className="space-y-2">
                                    {project.liveUrl && (
                                        <Link
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Live Demo
                                        </Link>
                                    )}
                                    {project.githubUrl && (
                                        <Link
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm"
                                        >
                                            <Github className="w-4 h-4" />
                                            Source Code
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-8">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                            {project.title}
                        </h1>

                        {/* Image Gallery */}
                        {selectedImage && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                    <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-900">
                                        <Image
                                            src={selectedImage.url}
                                            alt={selectedImage.caption || `Screenshot ${currentImage + 1} of ${project.title}`}
                                            fill
                                            className="object-contain"
                                            unoptimized={selectedImage.url.startsWith("http")}
                                        />
                                    </div>
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={goToPreviousImage}
                                                aria-label="Previous project image"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goToNextImage}
                                                aria-label="Next project image"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                                {currentImage + 1} / {images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setCurrentImage(index)}
                                                className={`relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden border transition-colors cursor-pointer ${index === currentImage ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                                                    }`}
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={image.url.startsWith("http")}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                            {project.description}
                        </p>

                        {/* Markdown Content */}
                        {project.projectMarkdown && (
                            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:border-b prose-headings:border-zinc-200 dark:prose-headings:border-zinc-800 prose-headings:pb-2 prose-h2:text-2xl prose-h3:text-xl">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                            <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-3">{children}</h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-2xl font-bold mb-3 mt-8 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">{children}</h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-xl font-bold mb-2 mt-6 text-zinc-800 dark:text-zinc-200">{children}</h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="mb-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside mb-4 space-y-2 text-zinc-600 dark:text-zinc-400">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-inside mb-4 space-y-2 text-zinc-600 dark:text-zinc-400">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="leading-relaxed">{children}</li>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="text-zinc-900 dark:text-white font-semibold">{children}</strong>
                                        ),
                                        code: ({ children }) => (
                                            <code className="bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-sm font-mono">
                                                {children}
                                            </code>
                                        ),
                                        pre: ({ children }) => (
                                            <pre className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg overflow-x-auto mb-4">
                                                {children}
                                            </pre>
                                        ),
                                        hr: () => (
                                            <hr className="border-zinc-200 dark:border-zinc-800 my-8" />
                                        ),
                                    }}
                                >
                                    {project.projectMarkdown}
                                </ReactMarkdown>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetailPage;
