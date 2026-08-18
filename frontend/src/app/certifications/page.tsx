"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchCertifications, BackendCertification } from "@/lib/api";
import { ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

function CertificationsPage() {
    const [certifications, setCertifications] = useState<BackendCertification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCertifications() {
            try {
                const data = await fetchCertifications();
                const activeCerts = data.filter(c => c.active !== false);
                activeCerts.sort((a, b) =>
                    (a.priority || 999) - (b.priority || 999) ||
                    new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
                );
                setCertifications(activeCerts);
            } catch (error) {
                console.error("Failed to load certifications", error);
            } finally {
                setLoading(false);
            }
        }
        loadCertifications();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
                <h1 className={cn(
                    "bg-clip-text text-4xl text-center text-transparent md:text-6xl mb-12",
                    "bg-gradient-to-b from-black/80 to-black/50",
                    "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20"
                )}>All Certifications</h1>

                {loading ? (
                    <div className="text-center text-xl animate-pulse">Loading certifications...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {certifications.map((cert) => (
                            <Link
                                key={cert._id}
                                href={`/certifications/${cert.slug}`}
                                className="group block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-zinc-800"
                            >
                                <div className="relative w-full h-48 bg-gray-200 dark:bg-zinc-800">
                                    {cert.image ? (
                                        <Image
                                            src={cert.image}
                                            alt={cert.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            unoptimized={cert.image.startsWith("http")}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {cert.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{cert.issuer}</p>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(cert.issueDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {cert.tags && cert.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CertificationsPage;
