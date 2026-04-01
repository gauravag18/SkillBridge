<h1 align="center"> SkillBridge </h1>
<p align="center"> Architecting the Future of Professional Documentation and Career Readiness through Generative Intelligence. </p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js">
  <img alt="React" src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
</p>

## 📑 Table of Contents
- [🔭 Overview](#-overview)
- [🧩 Architecture & Flow](#-architecture--flow)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
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
Transform your GitHub repositories into professional showcases. By analyzing the structure and content of your code, SkillBridge generates structured README files.
- **Benefit:** Save hours of manual writing while ensuring your project meets industry standards.
- **User Action:** Simply connect your repository and let the AI extract the essential technical context.

### 📄 Intelligent Resume Optimization
The `resume-improve` module provides users with the tools to refine their professional narrative. By utilizing the `ResumeUploader` and `pdf-parse` capabilities, the platform identifies gaps in technical descriptions and suggests high-impact enhancements.
- **Benefit:** Increases the visibility of your technical skills to both automated screening systems and human recruiters.
- **User Action:** Upload a PDF resume and receive immediate, actionable feedback based on industry trends.

### 🎙️ Interactive Mock Interviews
Prepare for high-stakes technical evaluations using the `mock-interview` environment. The platform simulates real-world interview scenarios, providing a safe space for developers to practice their communication and problem-solving skills.
- **Benefit:** Reduces interview anxiety and improves technical articulation through repeated, low-stakes exposure.

### 📊 Progress Tracking & Dashboarding
The centralized dashboard provides a holistic view of your career readiness and project documentation status.
- **Benefit:** Gamified yet professional approach to career growth.

### 🎨 Stunning Visual Interface
Leveraging high-end UI components such as `AnimatedBeam`, `Marquee`, and the `Sora` typography configuration, SkillBridge offers a premium aesthetic.

---

## 🛠️ Tech Stack

SkillBridge is built using a curated selection of cutting-edge technologies.

| Technology | Purpose | Why it was Chosen |
| :--- | :--- | :--- |
| **Next.js 16** | Full-stack Framework | App Router architecture, SSR, and Server Actions. |
| **React 19** | UI Library | Concurrent rendering and modern hook improvements. |
| **TypeScript** | Type Safety | Codebase maintainability and strict typing. |
| **Tailwind CSS 4** | Styling | Utility-first approach with optimized CSS processing. |
| **Supabase** | Auth & Database | Scalable Backend-as-a-Service with SSR support. |
| **Framer Motion** | Animation | Sophisticated, declarative UI animations. |
| **Groq/Grok SDK** | AI Integration | High-speed inference for real-time analysis. |

---

## 📁 Project Structure

```text
SkillBridge/
├── app/                         # Core application logic and routing
│   ├── actions/                 # Next.js Server Actions 
│   ├── api/                     # Backend API route definitions
│   ├── dashboard/               # Main user overview interface
│   ├── mock-interview/          # Interview simulation environment
│   ├── onboard/                 # New user welcome and setup flow
│   ├── resume-improve/          # Resume enhancement workspace
│   └── page.tsx                 # Landing page
├── components/                  # Reusable UI building blocks
│   └── ui/                      # Primitive and custom UI components
├── lib/                         # Shared utilities and service clients
│   └── supabase/                # Database and Auth clients
└── public/                      # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: Ensure you have the latest LTS version installed.
* **Package Manager**: npm or pnpm.

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

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root and add your Supabase, GitHub, and AI API keys.

4. **Initialize development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔧 Usage

Once the development server is running, navigate to `http://localhost:3000`.

### 1. Documenting a Repository
- Navigate to the **GitHub Integration** section.
- Provide repository details. Let the AI scan and generate your README.

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

We welcome contributions to improve SkillBridge!

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- ✅ Follow existing code styles (TypeScript/Tailwind).
- 📝 Add comments for complex logic.
- 🎯 Keep commits focused and atomic.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.
