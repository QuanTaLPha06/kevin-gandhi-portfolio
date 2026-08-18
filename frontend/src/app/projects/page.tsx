"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProjects, BackendProject } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function ProjectsPage() {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        const activeProjects = data.filter(p => p.active !== false); // Simple active filter
        // Sort by priority
        activeProjects.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        setProjects(activeProjects);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
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
        )}>All Projects</h1>

        {loading ? (
          <div className="text-center text-xl animate-pulse">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug}`}
                className="group block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-zinc-800"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={project.images && project.images.length > 0 ? project.images[0].url : "/assets/placeholder.jpg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={project.images?.[0]?.url.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags && project.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {project.tags && project.tags.length > 3 && (
                      <span className="text-xs text-gray-400 self-center">+{project.tags.length - 3} more</span>
                    )}
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

export default ProjectsPage;
