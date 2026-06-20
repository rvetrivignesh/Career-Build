import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { FileText, Compass, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import styles from "./LandingPage.module.css";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTA = (path) => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate(path);
    }
  };

  const features = [
    {
      title: "Resume Builder",
      description: "Draft polished, tailored professional resumes using structured guides.",
      icon: <FileText size={24} color="var(--primary-color)" />,
    },
    {
      title: "Resume Analyzer",
      description: "Receive instant analytics on resume score, format alignment, and impact.",
      icon: <Sparkles size={24} color="var(--primary-color)" />,
    },
    {
      title: "Job Readiness Assessment",
      description: "Evaluate your technical skill level and preparedness for target market roles.",
      icon: <GraduationCap size={24} color="var(--primary-color)" />,
    },
    {
      title: "Career Roadmaps",
      description: "Navigate structured milestones to acquire key competencies and master new skills.",
      icon: <Compass size={24} color="var(--primary-color)" />,
    },
    {
      title: "AI Coach",
      description: "Get interactive, personalized recommendations to support your career growth.",
      icon: <GraduationCap size={24} color="var(--primary-color)" />,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Career-Build</h1>
        <p className={styles.tagline}>Build Skills. Track Progress. Reach Your Goals.</p>
        <p className={styles.description}>
          Career-Build is an intelligent career development platform that helps users organize their professional profile, evaluate their readiness, discover growth opportunities, and progress toward their career goals through a unified experience.
        </p>

        <div className={styles.ctas}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => handleCTA("/login")}
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => handleCTA("/register")}
          >
            Create Account
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionHeading}>Platform Features</h2>
        <p className={styles.sectionSubtitle}>
          Everything you need to guide and accelerate your professional journey.
        </p>
        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.card}>
              <div className={styles.iconContainer}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
