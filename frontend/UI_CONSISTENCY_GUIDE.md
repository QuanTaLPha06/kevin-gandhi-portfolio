# UI Consistency Guide

## Design System

### Color Palette
- **Background (Light)**: `bg-white`
- **Background (Dark)**: `bg-zinc-950`
- **Card Background (Light)**: `bg-white`
- **Card Background (Dark)**: `bg-zinc-900/80 backdrop-blur-sm`
- **Border (Light)**: `border-zinc-200`
- **Border (Dark)**: `border-zinc-800`
- **Text Primary (Light)**: `text-gray-900`
- **Text Primary (Dark)**: `text-white`
- **Text Secondary (Light)**: `text-gray-600`
- **Text Secondary (Dark)**: `text-gray-400`

### Typography
- **Page Title**: `text-4xl md:text-5xl lg:text-6xl font-bold`
- **Section Title**: Use gradient text component
- **Card Title**: `text-xl font-bold`
- **Body Text**: `text-sm md:text-base`

### Spacing
- **Page Padding**: `px-4 md:px-8 py-16`
- **Max Width**: `max-w-7xl mx-auto`
- **Card Gap**: `gap-8`
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Components
- **Back Button**: Consistent style with ArrowLeft icon
- **View All Button**: Rounded-full with ArrowRight icon
- **Cards**: Consistent shadow, hover effects, border

## Pages to Update

### 1. Projects Listing Page (`/projects/page.tsx`)
- Change background to `bg-white dark:bg-zinc-950`
- Add gradient title like homepage
- Match card styling exactly

### 2. Certifications Listing Page (`/certifications/page.tsx`)
- Change background to `bg-white dark:bg-zinc-950`
- Add gradient title like homepage
- Match card styling exactly

### 3. Project Detail Page (`/projects/[slug]/page.tsx`)
- Keep current clean design (it's good!)
- Just ensure background is `bg-white dark:bg-zinc-950`

### 4. Certification Detail Page (`/certifications/[slug]/page.tsx`)
- Redesign to match project detail page layout
- Use sidebar layout like projects
- Change background to `bg-white dark:bg-zinc-950`
