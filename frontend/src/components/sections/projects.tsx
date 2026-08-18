"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchProjects, BackendProject } from "@/lib/api";

const ProjectsSection = () => {
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        console.log('Fetching projects from:', process.env.NEXT_PUBLIC_BACKEND_URL);
        const backendData = await fetchProjects();
        console.log('Fetched projects:', backendData);
        if (backendData && backendData.length > 0) {
          // Filter active projects, sort by priority, take max 9
          const filtered = backendData
            .filter(p => p.active !== false)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
            .slice(0, 9);
          console.log('Filtered projects:', filtered);
          setProjects(filtered);
        } else {
          console.log('No projects found');
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="max-w-7xl mx-auto py-16">
        <h2 className={cn(
          "bg-clip-text text-4xl text-center text-transparent md:text-7xl mb-16",
          "bg-gradient-to-b from-black/80 to-black/50",
          "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20"
        )}>
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="mt-4 h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="max-w-7xl mx-auto py-16 px-4 md:px-8 relative z-10">
      <Link href={"#projects"}>
        <h2 className={cn(
          "bg-clip-text text-4xl text-center text-transparent md:text-7xl mb-16",
          "bg-gradient-to-b from-black/80 to-black/50",
          "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20"
        )}>
          Projects
        </h2>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <Button
          variant="outline"
          size="lg"
          className="group text-lg px-8 py-6 rounded-full border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
          onClick={() => window.location.href = '/projects'}
        >
          View All Projects
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

const ProjectCard = ({ project }: { project: BackendProject }) => {
  const router = useRouter();
  const mainImage = project.images?.[0]?.url || "/assets/projects-screenshots/logo-dark.webp";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/projects/${project.slug}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") router.push(`/projects/${project.slug}`);
      }}
      className="group cursor-pointer h-full"
    >
      <div className="h-full flex flex-col bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full h-48 overflow-hidden shrink-0">
          <Image
            src={mainImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={mainImage.startsWith('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-5 flex flex-col grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
            {project.description}
          </p>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
