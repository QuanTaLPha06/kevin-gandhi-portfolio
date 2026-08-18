"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchBlogs, BackendBlog } from "@/lib/api";
import { ArrowUpRight } from "lucide-react";

function Page() {
  const [blogs, setBlogs] = useState<BackendBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await fetchBlogs();
        setBlogs(data || []);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto text-zinc-300 flex justify-center items-center h-full min-h-[60vh]">
        <div className="animate-pulse text-xl">Loading thoughts...</div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="container mx-auto text-zinc-300 flex justify-center items-center h-full min-h-[60vh]">
        <h1 className="text-3xl">Oops no blog posts!</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-[50px] xl:px-[150px] text-zinc-300 h-full pt-[100px] pb-20">
      <h1 className="text-4xl mb-[50px]">Blogs</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            href={blog.link || "#"}
            target={blog.link ? "_blank" : undefined}
            rel={blog.link ? "noopener noreferrer" : undefined}
            className="group block border-[.5px] border-zinc-600 rounded-md overflow-hidden bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
          >
            {blog.image && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors line-clamp-2">
                  {blog.title}
                </h2>
                <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
              </div>
              <p className="text-zinc-500 text-sm mb-4 line-clamp-3">
                {blog.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {blog.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
