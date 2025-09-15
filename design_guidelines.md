# NollyCrew Platform Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from **LinkedIn** (professional networking), **Notion** (project management), and **Netflix** (content discovery) to create a sophisticated platform that balances professional networking with creative industry needs.

## Core Design Principles
- **Industry Authority**: Sophisticated, professional aesthetic that commands respect in the film industry
- **Creative Expression**: Allow personality and creativity to shine through while maintaining professionalism
- **Collaborative Focus**: Design facilitates connection and communication between roles
- **Content-First**: Portfolios, scripts, and project materials are the stars

## Color Palette
**Primary Brand Colors:**
- Deep Film Blue: 220 85% 15% (main brand, headers, primary buttons)
- Nollywood Gold: 45 90% 60% (accent, highlights, success states)
- Professional Gray: 220 10% 20% (text, secondary elements)

**Supporting Colors:**
- Light backgrounds: 220 15% 97%
- Dark mode backgrounds: 220 15% 8%
- Error states: 0 70% 50%
- Success states: 120 60% 40%

**Gradients:** Subtle blue-to-indigo gradients for hero sections and call-to-action areas (220 85% 15% to 240 80% 25%)

## Typography
- **Primary**: Inter (clean, professional, excellent readability)
- **Display**: Poppins (headings, hero text, brand elements)
- **Monospace**: JetBrains Mono (code, technical specs)

## Layout System
**Tailwind Spacing Primitives:** 2, 4, 6, 8, 12, 16, 24
- Tight spacing (p-2, m-2) for form elements and small components
- Medium spacing (p-4, p-6) for card padding and section margins
- Large spacing (p-8, p-12, p-16) for section separation and hero areas

## Component Library

### Navigation
- Fixed header with role-based navigation
- Clean breadcrumb system for project hierarchy
- Tabbed interfaces for multi-section content

### Core Components
- **Profile Cards**: Photo, role badges, key skills, rating system
- **Project Cards**: Poster/thumbnail, status indicators, key details
- **Job/Casting Cards**: Clear hierarchy of requirements, budget, timeline
- **Message Interface**: Chat-like interface with file sharing capabilities

### Forms & Inputs
- Clean, spacious form layouts with clear validation
- File upload zones with drag-and-drop for scripts/media
- Multi-step forms for complex workflows (project creation, casting calls)

### Data Displays
- Dashboard widgets with key metrics
- Timeline views for project phases
- Grid/list toggle for content browsing
- Advanced filtering interfaces

## Key Sections & Layout

### Landing Page
**Hero Section**: Large background with subtle film industry imagery, clear value proposition, role-based CTAs
**Features Grid**: Three-column layout showcasing core platform benefits
**Testimonials**: Industry professional quotes with photos
**CTA Section**: Clear next steps for different user types

### Dashboard Design
- **Role-Specific Layouts**: Customized dashboards for Actors, Crew, Producers
- **Quick Actions**: Prominent buttons for common tasks (apply, post, message)
- **Activity Feed**: Recent updates, opportunities, project progress
- **Metrics Cards**: Key performance indicators relevant to each role

### Project Management
- **Kanban-Style Boards**: Visual project phase tracking
- **Cast & Crew Grids**: Photo-based team overview
- **Document Library**: Organized file sharing with version control
- **Communication Hub**: Integrated messaging with project context

## Images
- **Hero Image**: Cinematic wide shot of Nollywood film set or crew in action
- **Section Backgrounds**: Subtle film equipment textures or industry scenes
- **Profile Placeholders**: Professional headshot frames with film camera icons
- **Project Thumbnails**: Movie poster style layouts for project cards

## Accessibility & Performance
- High contrast ratios maintained in both light and dark modes
- Keyboard navigation support throughout
- Screen reader optimized content structure
- Progressive image loading for portfolio content
- Consistent dark mode implementation across all components

This design system creates a platform that feels both professional and creative, positioning NollyCrew as the authoritative platform for Nollywood industry professionals.