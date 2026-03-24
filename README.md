<h1 align="center"> SkillBridge </h1>
<p align="center"> Architecting the Future of Professional Documentation and Career Readiness through Generative Intelligence. </p>

<p align="center">
  <img alt="Build" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge">
  <img alt="Issues" src="https://img.shields.io/badge/Issues-0%20Open-blue?style=for-the-badge">
  <img alt="Contributions" src="https://img.shields.io/badge/Contributions-Welcome-orange?style=for-the-badge">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
</p>
<!-- 
  **Note:** These are static placeholder badges. Replace them with your project's actual badges.
  You can generate your own at https://shields.io
-->

## 📑 Table of Contents
- [🔭 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack & Architecture](#-tech-stack--architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Usage](#-usage)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 🔭 Overview

**SkillBridge** is a comprehensive professional documentation and career optimization platform designed to bridge the gap between complex codebases and high-impact repository presentation. By leveraging advanced generative AI, SkillBridge transforms the often-tedious task of repository analysis and README generation into a seamless, automated experience that empowers developers to showcase their work with the professional polish it deserves.

### The Problem
> Modern software development moves at a lightning pace, yet documentation remains a persistent bottleneck. Developers frequently struggle to articulate the value of their technical achievements, leading to repositories that are technically brilliant but poorly communicated. This "documentation debt" results in lower project adoption, confusion for contributors, and missed opportunities for developers to truly demonstrate their expertise to potential employers or collaborators.

### The Solution
SkillBridge provides a centralized suite for technical professionalization. It eliminates the friction of manual documentation by providing an intelligent interface that analyzes repository structures and generates comprehensive README files. Beyond mere documentation, it extends its utility into career readiness through integrated resume analysis and mock interview preparation, ensuring that the "bridge" between a developer's code and their career goals is sturdier than ever.

### Architecture Overview
Built on a modern **Component-based Architecture**, SkillBridge utilizes **Next.js 16** and **React 19** to deliver a high-performance, single-page application experience. The system is engineered for responsiveness and interactivity, utilizing **Tailwind CSS 4** for styling and **Framer Motion** for sophisticated UI transitions. The backend logic is encapsulated within Next.js Server Actions, providing a secure and efficient bridge to external AI models and database services.

---

## ✨ Key Features

SkillBridge is designed with a user-centric philosophy, focusing on delivering tangible outcomes for developers at every stage of their project lifecycle.

### 🚀 Automated Repository Documentation
Transform your GitHub repositories into professional showcases. By analyzing the structure and content of your code, SkillBridge generates structured README files that highlight technical specifications, installation steps, and core value propositions.
- **Benefit:** Save hours of manual writing while ensuring your project meets industry standards for documentation.
- **User Action:** Simply connect your repository and let the AI extract the essential technical context.

### 📄 Intelligent Resume Optimization
The `resume-improve` module provides users with the tools to refine their professional narrative. By utilizing the `ResumeUploader` and `pdf-parse` capabilities, the platform identifies gaps in technical descriptions and suggests high-impact enhancements.
- **Benefit:** Increases the visibility of your technical skills to both automated screening systems and human recruiters.
- **User Action:** Upload a PDF resume and receive immediate, actionable feedback based on industry trends.

### 🎙️ Interactive Mock Interviews
Prepare for high-stakes technical evaluations using the `mock-interview` environment. The platform simulates real-world interview scenarios, providing a safe space for developers to practice their communication and problem-solving skills.
- **Benefit:** Reduces interview anxiety and improves technical articulation through repeated, low-stakes exposure.

### 📊 Progress Tracking & Dashboarding
The centralized `dashboard` provides a holistic view of your career readiness and project documentation status. Utilizing components like `ScoreRing` and `Progress` actions, users can visualize their improvement over time.
- **Benefit:** Provides a gamified yet professional approach to career growth, ensuring you stay on track with your professional development goals.

### 🎨 Stunning Visual Interface
Leveraging high-end UI components such as `AnimatedBeam`, `Marquee`, and the `Sora` typography configuration, SkillBridge offers a premium aesthetic that mirrors the quality of the work it helps document.
- **Benefit:** A professional interface that inspires confidence and provides an intuitive user journey from onboarding to completion.

---

## 🛠️ Tech Stack & Architecture

SkillBridge is built using a curated selection of cutting-edge technologies chosen for their performance, scalability, and developer experience.

| Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- |
| **Next.js 16** | Full-stack Framework | Provides the App Router architecture, server-side rendering, and seamless API routes. |
| **React 19** | UI Library | Leverages the latest concurrent rendering features and hook improvements for a fluid UI. |
| **TypeScript** | Type Safety | Ensures codebase maintainability and reduces runtime errors through strict typing. |
| **Tailwind CSS 4** | Styling | Offers a utility-first approach with the latest performance optimizations in CSS processing. |
| **Supabase (SSR)** | Auth & Database | Provides a robust, scalable backend-as-a-service with native support for server-side rendering. |
| **Framer Motion** | Animation | Enables sophisticated, declarative animations that enhance the user experience. |
| **Groq/Grok SDK** | AI Integration | Facilitates high-speed inference for real-time analysis and feedback loops. |
| **PDF-Parse / Unpdf** | Document Processing | Extracts raw data from uploaded resumes for subsequent AI analysis. |

---

## 📁 Project Structure

The repository follows a modern Next.js App Router structure, strictly separating UI components, business logic, and configuration.

```
gauravag18-SkillBridge-175dff6/
├── 📁 app/                         # Core application logic and routing
│   ├── 📁 actions/                 # Next.js Server Actions for business logic
│   │   ├── 📄 analyze.ts           # AI analysis logic for repositories/resumes
│   │   ├── 📄 github.ts            # Integration logic for GitHub data
│   │   ├── 📄 interview.ts         # Mock interview state management
│   │   ├── 📄 onboard.ts           # User onboarding flow logic
│   │   └── 📄 progress.ts          # User progress and metrics tracking
│   ├── 📁 api/                     # Backend API route definitions
│   │   ├── 📁 analyze-resume/      # Endpoint for resume parsing and analysis
│   │   └── 📁 upload-resume/       # Secure file upload handling
│   ├── 📁 dashboard/               # Main user overview interface
│   ├── 📁 mock-interview/          # Interview simulation environment
│   ├── 📁 onboard/                 # New user welcome and setup flow
│   ├── 📁 plan/                    # Subscription and tier management
│   ├── 📁 resume-improve/          # Resume enhancement workspace
│   ├── 📄 globals.css              # Global styles and Tailwind directives
│   ├── 📄 layout.tsx               # Root layout and provider configuration
│   └── 📄 page.tsx                 # Application landing page
├── 📁 components/                  # Reusable UI building blocks
│   └── 📁 ui/                      # Primitive and custom UI components
│       ├── 📄 animated-beam.tsx    # Visual data flow animation
│       ├── 📄 file-upload.tsx      # Interactive dropzone component
│       ├── 📄 ResumeUploader.tsx   # Domain-specific upload logic
│       ├── 📄 marquee.tsx          # Scrolling content display
│       ├── 📄 badge.tsx            # Status and tag indicators
│       └── 📄 card.tsx             # Structured content containers
├── 📁 lib/                         # Shared utilities and service clients
│   ├── 📁 supabase/                # Database client and server configurations
│   │   ├── 📄 client.ts            # Browser-side Supabase instance
│   │   └── 📄 server.ts            # Server-side/SSR Supabase instance
│   └── 📄 utils.ts                 # Helper functions and Tailwind merging
├── 📄 components.json              # UI component library configuration
├── 📄 next.config.ts               # Next.js framework configuration
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 postcss.config.mjs           # CSS processing configuration
└── 📄 tsconfig.json                # TypeScript compiler settings
```

---

## 🚀 Getting Started

To get a local development instance of SkillBridge up and running, follow these steps.

### Prerequisites
* **Node.js**: Ensure you have the latest LTS version installed.
* **Package Manager**: SkillBridge uses `npm`.
* **TypeScript Knowledge**: The project is strictly typed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gauravag18/SkillBridge.git
   cd SkillBridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the development environment:**
   The project relies on Next.js 16 and Tailwind 4 features.
   ```bash
   npm run dev
   ```

4. **Build for production:**
   To generate a production-ready build:
   ```bash
   npm run build
   ```

---

## 🔧 Usage

SkillBridge is designed for intuitive navigation. Once the development server is running, navigate to `http://localhost:3000`.

### Documenting a Repository
1. Navigate to the **GitHub Integration** section via the dashboard.
2. Provide your repository details.
3. The system executes `actions/github.ts` and `actions/analyze.ts` to scan your structure.
4. Review the generated documentation and export it directly to your project.

### Improving Your Resume
1. Head to the `/resume-improve` page.
2. Use the `FileUpload` component to submit your PDF.
3. The platform processes the file through `pdf-parse` and provides a score using the `ScoreRing` component.
4. Review the AI-generated suggestions to enhance your professional impact.

### Mock Interview Practice
1. Enter the `/mock-interview` module.
2. Select your target role.
3. Interact with the AI-driven prompt system to simulate a real-world interview experience.

---

## 🤝 Contributing

We welcome contributions to improve SkillBridge! Your input helps make this project better for everyone.

### How to Contribute

1. **Fork the repository** - Click the 'Fork' button at the top right of this page.
2. **Create a feature branch** 
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** - Improve code, documentation, or features.
4. **Test thoroughly** - Ensure all functionality works as expected.
   ```bash
   npm run lint
   ```
5. **Commit your changes** - Write clear, descriptive commit messages.
   ```bash
   git commit -m 'Add: Amazing new feature that does X'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** - Submit your changes for review.

### Development Guidelines

- ✅ Follow the existing code style and conventions (TypeScript/Tailwind).
- 📝 Add comments for complex logic and algorithms.
- 📚 Update documentation for any changed functionality.
- 🎯 Keep commits focused and atomic.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.
