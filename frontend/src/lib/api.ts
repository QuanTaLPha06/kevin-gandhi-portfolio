// API Service for fetching data from backend
const DEFAULT_API_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://portfolio-admin-panel-sigma.vercel.app'
        : 'http://localhost:4000';

const API_URL =
    typeof window === 'undefined'
        ? (process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_API_URL).replace(/\/$/, '')
        : '';

// Project type from backend
export interface BackendProject {
    _id: string;
    title: string;
    slug: string;
    description: string;
    projectMarkdown?: string;
    tags: string[];
    liveUrl?: string;
    githubUrl?: string;
    images?: Array<{ url: string; caption?: string; showOnProject?: boolean }>;
    active?: boolean;
    featured: boolean;
    priority?: number;
    createdAt: string;
    updatedAt: string;
}

// Blog type from backend
export interface BackendBlog {
    _id: string;
    title: string;
    slug: string;
    description: string;
    tags: string[];
    link?: string;
    image?: string;
    active?: boolean;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

// Certification type from backend
export interface BackendCertification {
    _id: string;
    title: string;
    slug: string;
    description: string;
    tags: string[];
    link?: string;
    image?: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    pdf?: string;
    active?: boolean;
    featured: boolean;
    priority?: number;
    createdAt: string;
    updatedAt: string;
}

// API Response type
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Fetch all projects
export async function fetchProjects(): Promise<BackendProject[]> {
    try {
        const res = await fetch(`${API_URL}/api/projects`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to fetch projects:', res.status);
            return [];
        }

        const json: ApiResponse<{ items: BackendProject[]; total: number; page: number; limit: number }> = await res.json();
        return json.success && json.data ? json.data.items : [];
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

// Fetch single project by slug
export async function fetchProjectBySlug(slug: string): Promise<BackendProject | null> {
    try {
        const normalizedSlug = decodeURIComponent(slug).trim();
        const url = `${API_URL}/api/projects/${encodeURIComponent(normalizedSlug)}`;

        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            const json: ApiResponse<BackendProject> = await res.json();
            if (json.success && json.data) return json.data;
        }

        const bySlugRes = await fetch(`${API_URL}/api/projects?slug=${encodeURIComponent(normalizedSlug)}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (bySlugRes.ok) {
            const json: ApiResponse<{ items: BackendProject[] }> = await bySlugRes.json();
            const project = json.success && json.data?.items?.[0] ? json.data.items[0] : null;
            if (project) return project;
        }

        const projects = await fetchProjects();
        return projects.find((project) => {
            const projectSlug = decodeURIComponent(project.slug).trim();
            return projectSlug === normalizedSlug || project._id === normalizedSlug;
        }) ?? null;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}

// Fetch all blogs
export async function fetchBlogs(): Promise<BackendBlog[]> {
    try {
        const res = await fetch(`${API_URL}/api/blogs`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to fetch blogs:', res.status);
            return [];
        }

        const json: ApiResponse<BackendBlog[]> = await res.json();
        return json.data || [];
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return [];
    }
}

// Fetch all certifications
export async function fetchCertifications(): Promise<BackendCertification[]> {
    try {
        const res = await fetch(`${API_URL}/api/certifications`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error('Failed to fetch certifications:', res.status);
            return [];
        }

        const json: ApiResponse<{ items: BackendCertification[]; total: number; page: number; limit: number }> = await res.json();
        return json.success && json.data ? json.data.items : [];
    } catch (error) {
        console.error('Error fetching certifications:', error);
        return [];
    }
}

// Fetch single certification by slug
export async function fetchCertificationBySlug(slug: string): Promise<BackendCertification | null> {
    try {
        const url = `${API_URL}/api/certifications/${slug}`;
        console.log('[API] Fetching certification from:', url);

        const res = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('[API] Certification response status:', res.status);

        if (!res.ok) {
            console.error('[API] Failed to fetch certification:', res.status);
            return null;
        }

        const json: ApiResponse<BackendCertification> = await res.json();
        console.log('[API] Certification response:', JSON.stringify(json).substring(0, 200));
        return json.success && json.data ? json.data : null;
    } catch (error) {
        console.error('Error fetching certification:', error);
        return null;
    }
}
