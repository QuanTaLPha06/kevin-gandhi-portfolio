"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchCertificationBySlug, BackendCertification } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import { Calendar, Award, ExternalLink, Download } from "lucide-react";

function CertificationDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [certification, setCertification] = useState<BackendCertification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCertification() {
            if (!slug) return;

            try {
                const data = await fetchCertificationBySlug(slug);
                if (data) {
                    setCertification(data);
                } else {
                    setError("Certification not found");
                }
            } catch (err) {
                console.error("Error loading certification:", err);
                setError("Failed to load certification");
            } finally {
                setLoading(false);
            }
        }
        loadCertification();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-xl text-zinc-600 dark:text-zinc-400">Loading certification...</div>
            </div>
        );
    }

    if (error || !certification) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
                <h1 className="text-3xl text-zinc-900 dark:text-white">Certification Not Found</h1>
                <p className="text-zinc-600 dark:text-zinc-400">The certification you&apos;re looking for doesn&apos;t exist.</p>
                <Link
                    href="/#certifications"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4"
                >
                    ← Back to Certifications
                </Link>
            </div>
        );
    }

    const mainImage = certification.image || "/assets/certifications/default-cert.png";

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Back button */}
                <Link
                    href="/#certifications"
                    className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors"
                >
                    ← Back to Certifications
                </Link>

                {/* Certification Header - Dark text above */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                        {certification.title}
                    </h1>

                    {/* Left side above tags and issuer info */}
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Tags on left */}
                        {certification.tags && certification.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {certification.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Issuer and date info */}
                        <div className="text-zinc-600 dark:text-zinc-400">
                            <p className="font-medium">Issued by {certification.issuer}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date(certification.issueDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}
                                    {certification.expiryDate && (
                                        <span className="ml-2">
                                            - Expires {new Date(certification.expiryDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    )}
                                </span>
                            </div>
                            {certification.credentialId && (
                                <p className="text-sm mt-1">Credential ID: {certification.credentialId}</p>
                            )}
                        </div>

                        {/* Links */}
                        <div className="flex gap-4">
                            {certification.link && (
                                <Link
                                    href={certification.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Certificate →
                                </Link>
                            )}
                            {certification.pdf && (
                                <Link
                                    href={certification.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Download PDF →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Image below */}
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                    <Image
                        src={mainImage}
                        alt={certification.title}
                        fill
                        className="object-cover"
                        unoptimized={mainImage.startsWith('http')}
                    />
                    <div className="absolute top-4 right-4">
                        <Award className="w-12 h-12 text-yellow-500 bg-white/90 rounded-full p-2" />
                    </div>
                </div>

                {/* Description below */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
                            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            code: ({ children }) => (
                                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                    {children}
                                </code>
                            ),
                            pre: ({ children }) => (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                                    {children}
                                </pre>
                            ),
                        }}
                    >
                        {certification.description}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default CertificationDetailPage;