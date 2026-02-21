"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Upload, Brain, Calendar, CheckCircle2, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = React.forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-11 items-center justify-center rounded-full border-2 bg-white p-2 shadow-lg transition-all hover:scale-110 hover:shadow-xl",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
Circle.displayName = "Circle";

const testimonials = [
  {
    name: "Aarav Patel",
    username: "@aarav_dev",
    body: "SkillBridge identified critical gaps in my system design knowledge. The 30-day roadmap was incredibly structured and helped me secure an offer at a top product company.",
    img: "https://avatar.vercel.sh/aarav",
  },
  {
    name: "Priya Sharma",
    username: "@priya_tech",
    body: "The AI analysis was spot-on. It highlighted exactly what recruiters were looking for. My LinkedIn profile views increased by 200% after implementing their recommendations.",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Rahul Kumar",
    username: "@rahul_engineer",
    body: "Transformed my job search completely. The personalized learning path and resource recommendations saved me months of scattered preparation. Highly professional tool.",
    img: "https://avatar.vercel.sh/rahul",
  },
  {
    name: "Sneha Reddy",
    username: "@sneha_code",
    body: "Best career decision I made. The skill gap analysis gave me clarity on what to focus on. Landed three interview calls within weeks of following the roadmap.",
    img: "https://avatar.vercel.sh/sneha",
  },
  {
    name: "Vikram Singh",
    username: "@vikram_builds",
    body: "No more guessing what skills employers want. The AI recommendations are backed by real job market data. This is the career coach every developer needs.",
    img: "https://avatar.vercel.sh/vikram",
  },
  {
    name: "Ananya Gupta",
    username: "@ananya_dev",
    body: "The resume analysis was incredibly detailed. It pointed out things I never would have noticed. My interview conversion rate improved significantly after the updates.",
    img: "https://avatar.vercel.sh/ananya",
  },
];

const firstRow = testimonials.slice(0, 2);
const secondRow = testimonials.slice(2, 4);
const thirdRow = testimonials.slice(4, 6);
const fourthRow = testimonials.slice(0, 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-slate-200 bg-white hover:border-border-strong hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-slate-900">{name}</figcaption>
          <p className="text-xs text-slate-500">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
        "{body}"
      </blockquote>
    </figure>
  );
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("skillbridge_uuid")) {
      const newUuid = crypto.randomUUID();
      localStorage.setItem("skillbridge_uuid", newUuid);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-slate-900">
              SkillBridge
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">
                Features
              </Link>
              <Link href="#process" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-slate-600 hover:text-[#ff6b35] font-medium transition-colors text-sm">
                Testimonials
              </Link>
            </nav>

            <Link
              href="/onboard"
              className="px-4 py-2 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all hover:shadow-lg text-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left - Text */}
            <div className="text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff3ed] border border-border-soft rounded-full text-xs font-medium text-[#ff6b35] animate-fade-in">
                <span className="w-1.5 h-1.5 bg-border-strong rounded-full animate-pulse"></span>
                AI Powered Career Intelligence
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-slate-900">
                Bridge the Gap Between
                <span className="block text-[#ff6b35] mt-1">Skills & Success</span>
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Transform your career trajectory with AI driven resume analysis, personalized skill gap identification, and actionable 30 day roadmaps designed for the competitive tech landscape.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/onboard"
                  className="group inline-flex items-center justify-center px-6 py-3 bg-[#ff6b35] text-white font-semibold rounded-lg transition-all text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Start Your Analysis
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </Link>

                <Link
                  href="#process"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-200 hover:border-[#ff6b35] hover:text-[#ff6b35] transition-all text-sm"
                >
                  See How It Works
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="text-border-strong" size={14} />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="text-border-strong" size={14} />
                  Instant results
                </span>
              </div>
            </div>

            {/* Right - Animated Beam */}
            <div className="relative flex items-center justify-center" ref={containerRef}>
              <div className="relative h-90 w-full max-w-lg overflow-hidden rounded-xl bg-[#fffaf7] border border-slate-200 p-8">
                {/* Center - User profile */}
                <Circle
                  ref={centerRef}
                  className="size-16 border-[#ff6b35] bg-[#fff3ed] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xl"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Circle>

                {/* Tech icons */}
                <Circle ref={div1Ref} className="absolute top-6 left-6"><Icons.vscode /></Circle>
                <Circle ref={div2Ref} className="absolute top-8 right-10"><Icons.github /></Circle>
                <Circle ref={div3Ref} className="absolute bottom-12 left-8"><Icons.react /></Circle>
                <Circle ref={div4Ref} className="absolute bottom-10 right-16"><Icons.nodejs /></Circle>
                <Circle ref={div5Ref} className="absolute top-14 left-20"><Icons.docker /></Circle>
                <Circle ref={div6Ref} className="absolute top-20 right-20"><Icons.leetcode /></Circle>
                <Circle ref={div7Ref} className="absolute bottom-16 right-6"><Icons.linkedin /></Circle>

                {/* Animated Beams - using orange */}
                <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={centerRef} curvature={-80} />
                <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={centerRef} curvature={80} reverse />
                <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={centerRef} curvature={-60} />
                <AnimatedBeam containerRef={containerRef} fromRef={div4Ref} toRef={centerRef} curvature={60} reverse />
                <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={centerRef} />
                <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={centerRef} reverse />
                <AnimatedBeam containerRef={containerRef} fromRef={div7Ref} toRef={centerRef} curvature={-75} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-10 bg-[#fffcfa] border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "10,000+", label: "Resumes Analyzed" },
              { number: "94%", label: "Success Rate" },
              { number: "30 Days", label: "Average Timeline" },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl font-bold text-[#ff6b35] mb-1">{stat.number}</div>
                <div className="text-slate-600 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Precision Career Engineering
            </h2>
            <p className="text-base text-slate-600">
              Advanced AI technology meets career strategy to deliver actionable insights that accelerate your professional growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "Intelligent Resume Analysis",
                desc: "Advanced AI evaluates your resume against current industry standards and job requirements from top tier companies.",
              },
              {
                icon: Brain,
                title: "Skill Gap Identification",
                desc: "Pinpoint exact competency gaps in technical skills, system design, algorithms, and emerging technologies with actionable recommendations.",
              },
              {
                icon: Calendar,
                title: "Personalized Roadmap",
                desc: "Receive a structured 30 day action plan with daily objectives, curated resources, and progress tracking mechanisms.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-border-strong hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-[#fff3ed] flex items-center justify-center mb-4 group-hover:bg-[#ffebe1] transition-colors">
                  <item.icon className="text-[#ff6b35]" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Trusted by Professionals
            </h2>
            <p className="text-base text-slate-600">
              Join thousands who've accelerated their tech careers with SkillBridge
            </p>
          </div>

          <div className="relative flex h-95 w-full flex-row items-center justify-center gap-4 overflow-hidden perspective-[400px]">
            <div
              className="flex flex-row items-center gap-4"
              style={{
                transform: "translateX(-60px) translateY(0px) translateZ(-80px) rotateX(18deg) rotateY(-12deg) rotateZ(15deg)",
              }}
            >
              <Marquee pauseOnHover vertical className="[--duration:28s]">
                {firstRow.map((review) => <ReviewCard key={review.username} {...review} />)}
              </Marquee>

              <Marquee reverse pauseOnHover vertical className="[--duration:32s]">
                {secondRow.map((review) => <ReviewCard key={review.username} {...review} />)}
              </Marquee>

              <Marquee pauseOnHover vertical className="[--duration:26s]">
                {thirdRow.map((review) => <ReviewCard key={review.username} {...review} />)}
              </Marquee>

              <Marquee reverse pauseOnHover vertical className="[--duration:30s]">
                {fourthRow.map((review) => <ReviewCard key={review.username} {...review} />)}
              </Marquee>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white to-transparent" />
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-[#fffcfa]">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Why Choose SkillBridge?
              </h2>
              <p className="text-base text-slate-600 mb-6">
                We combine cutting edge AI technology with deep industry insights to provide you with the most accurate and actionable career guidance.
              </p>

              <div className="space-y-3">
                {[
                  "Data driven insights from 10,000+ successful placements",
                  "Real time job market analysis and trend forecasting",
                  "Personalized recommendations based on your unique profile",
                  "Continuous updates aligned with industry evolution",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#fff3ed] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-border-strong" size={12} />
                    </div>
                    <p className="text-slate-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, title: "Career Growth", value: "3x faster" },
                { icon: Award, title: "Success Rate", value: "94%" },
                { icon: Brain, title: "AI Accuracy", value: "99.2%" },
                { icon: CheckCircle2, title: "Satisfaction", value: "4.9/5" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-5 border border-slate-200">
                  <item.icon className="text-border-strong mb-2" size={22} />
                  <div className="text-2xl font-bold text-[#ff6b35] mb-0.5">{item.value}</div>
                  <div className="text-xs text-slate-600">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Icons 
const Icons = {
  vscode: () => (
    <svg viewBox="0 0 24 24" fill="#007ACC" className="w-7 h-7">
      <path d="M17.91 2.5L22 6.59v10.82l-4.09 4.09H6.09L2 17.41V6.59L6.09 2.5h11.82zM8.09 15.5l8 2.5-8 2.5v-5zm-2-7l3.5 3-3.5 3v-6z" />
    </svg>
  ),
  github: () => (
    <svg viewBox="0 0 24 24" fill="#181717" className="w-7 h-7">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  react: () => (
    <svg viewBox="0 0 24 24" fill="#61DAFB" className="w-8 h-8">
      <circle cx="12" cy="12" r="2" fill="#61DAFB" />
      <path fill="#61DAFB" d="M12 1.5c-1.38 0-2.5 4.5-2.5 10s1.12 10 2.5 10 2.5-4.5 2.5-10-1.12-10-2.5-10zm0 18c-1.38 0-2.5-4.5-2.5-10s1.12-10 2.5-10 2.5 4.5 2.5 10-1.12 10-2.5 10z"/>
    </svg>
  ),
  nodejs: () => (
    <svg viewBox="0 0 24 24" fill="#339933" className="w-7 h-7">
      <path d="M12 2L22 8v8l-10 6-10-6V8l10-6zm0 2.8L5.6 10v4.8L12 18l6.4-3.2V10L12 4.8z"/>
    </svg>
  ),
  docker: () => (
    <svg viewBox="0 0 24 24" fill="#2496ED" className="w-7 h-7">
      <path d="M22.5 9h-21v6h21V9zm-3 4h-15v-2h15v2zM3 7h18v2H3V7zm0 10h18v2H3v-2z"/>
    </svg>
  ),
  leetcode: () => (
    <svg viewBox="0 0 24 24" fill="#FFA116" className="w-7 h-7">
      <path d="M13.5 2.5h-3L2.5 7.5v9l8 8h3l8-8v-9l-8-5zm-1.5 15h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-7 h-7">
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  ),
};