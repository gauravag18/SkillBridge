import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain, Target, Flame, RotateCcw, ChevronRight, Upload, FileText, Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProgressRing from "@/components/ProgressRing";
import { mockAnalysis } from "@/lib/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<string>("");
  const [analyzed, setAnalyzed] = useState(true); // mock: already analyzed
  const [analyzing, setAnalyzing] = useState(false);

  const completedTasks = 4;
  const progress = Math.round((completedTasks / 30) * 100);
  const streak = 4;
  const hasPlan = true; // mock

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file.name);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Here's your career progress at a glance.</p>
        </motion.div>

        {/* Stats Row */}
        {hasPlan && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 flex items-center gap-6">
              <ProgressRing progress={progress} />
              <div>
                <p className="text-sm text-muted-foreground">30-Day Plan</p>
                <p className="text-xl font-bold">{completedTasks}/30 Tasks</p>
                <p className="text-xs text-muted-foreground mt-1">Keep going!</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                  <Flame className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{streak} Days 🔥</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Complete today's task to keep your streak alive!</p>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Skill Match</p>
                  <p className="text-2xl font-bold">{mockAnalysis.matchScore}%</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mockAnalysis.suggestedRoles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column — Resume & Analyze */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Resume Upload */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" /> Resume
              </h2>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                {resumeFile ? (
                  <p className="text-sm font-medium">{resumeFile}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Upload resume</p>
                    <p className="text-xs text-muted-foreground">PDF or DOCX, max 5MB</p>
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
              </label>
              <Button
                className="w-full mt-4 shadow-warm"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>Analyzing…</>
                ) : analyzed ? (
                  <><RotateCcw className="mr-2 h-4 w-4" /> Re-analyze Resume</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Analyze Resume</>
                )}
              </Button>
            </div>

            {/* Analysis Results */}
            {analyzed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border shadow-card p-6"
              >
                <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-primary" /> Skill Gaps
                </h2>
                <div className="space-y-2.5">
                  {mockAnalysis.topGaps.map((gap) => (
                    <div key={gap.skill} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <gap.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{gap.skill}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          gap.priority === "High"
                            ? "bg-destructive/10 text-destructive"
                            : gap.priority === "Medium"
                            ? "bg-accent/20 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {gap.priority}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-5 shadow-warm"
                  size="lg"
                  onClick={() => navigate("/plan")}
                >
                  {hasPlan ? (
                    <>View / Re-generate 30-Day Plan <ChevronRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Generate 30-Day Plan <Sparkles className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column — Quick Plan Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {hasPlan ? (
              <div className="bg-card rounded-2xl border border-border shadow-card p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Your Roadmap
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigate("/plan")}>
                    View Full Plan <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 30 }, (_, i) => {
                    const done = i < completedTasks;
                    const today = i === completedTasks;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                          done
                            ? "gradient-warm text-primary-foreground"
                            : today
                            ? "border-2 border-primary text-primary"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                        onClick={() => navigate("/plan")}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Click any day or "View Full Plan" to see tasks & check them off
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-card p-12 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl gradient-warm-subtle flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">No Plan Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload your resume and analyze it to generate your personalized 30-day action plan.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
