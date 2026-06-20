import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import PersonalInfoStep from "./components/PersonalInfoStep";
import ContactInfoStep from "./components/ContactInfoStep";
import EducationStep from "./components/EducationStep";
import ExperienceStep from "./components/ExperienceStep";
import ProjectsStep from "./components/ProjectsStep";
import CareerInfoStep from "./components/CareerInfoStep";
import AdditionalInfoStep from "./components/AdditionalInfoStep";
import styles from "./ProfileSetupPage.module.css";

export const ProfileSetupPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    age: "",
    location: "",
    phoneCountryCode: "+91",
    phoneBody: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    education: [],
    experience: [],
    currentStatus: "",
    currentRole: "",
    targetRoles: [],
    careerObjective: "",
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const { saveUserProfile, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      // Parse phone into country code and body
      let phoneCountryCode = "+91";
      let phoneBody = "";
      if (userProfile.phone) {
        const parts = userProfile.phone.split(" ");
        if (parts.length > 1) {
          phoneCountryCode = parts[0];
          phoneBody = parts.slice(1).join(" ");
        } else {
          phoneBody = userProfile.phone;
        }
      }

      setFormData({
        fullName: userProfile.fullName || "",
        gender: userProfile.gender || "",
        age: userProfile.age || "",
        location: userProfile.location || "",
        phoneCountryCode,
        phoneBody,
        email: userProfile.user?.email || userProfile.email || "",
        linkedin: userProfile.linkedin || "",
        github: userProfile.github || "",
        portfolio: userProfile.portfolio || "",
        education: userProfile.education || [],
        experience: userProfile.experience || [],
        currentStatus: userProfile.currentStatus || "",
        currentRole: userProfile.currentRole || "",
        targetRoles: userProfile.targetRoles || [],
        careerObjective: userProfile.careerObjective || "",
        skills: userProfile.skills || [],
        projects: userProfile.projects || [],
        certifications: userProfile.certifications || [],
        achievements: userProfile.achievements || [],
        languages: userProfile.languages || [],
        interests: userProfile.interests || [],
      });
    }
  }, [userProfile]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  // Allow clicking completed/previous circles
  const handleStepClick = (step) => {
    if (step < activeStep) {
      setActiveStep(step);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const payload = {
        fullName: formData.fullName,
        gender: formData.gender,
        age: formData.age,
        location: formData.location,
        phone: `${formData.phoneCountryCode} ${formData.phoneBody}`.trim(),
        education: formData.education,
        experience: formData.experience,
        currentStatus: formData.currentStatus,
        currentRole: formData.currentRole,
        targetRoles: formData.targetRoles,
        careerObjective: formData.careerObjective,
        skills: formData.skills,
        projects: formData.projects,
        certifications: formData.certifications,
        achievements: formData.achievements,
        languages: formData.languages,
        interests: formData.interests,
        github: formData.github,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
      };

      await saveUserProfile(payload, !!userProfile);
      navigate(userProfile ? "/dashboard/profile" : "/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepComponent = () => {
    switch (activeStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <ContactInfoStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <EducationStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ExperienceStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ProjectsStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <CareerInfoStep
            data={formData}
            onChange={handleFieldChange}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 7:
        return (
          <AdditionalInfoStep
            data={formData}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            loading={submitLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>Let's Set Up Your Profile</h2>
        <p className={styles.subtitle}>Complete onboarding to access all features on Career-Build</p>
      </header>

      {/* Stepper Navigation Indicator */}
      <div className={styles.stepper}>
        <div className={styles.stepperLine} />
        <div
          className={styles.stepperLineActive}
          style={{ width: `${((activeStep - 1) / 6) * 100}%` }}
        />
        {[1, 2, 3, 4, 5, 6, 7].map((step) => {
          const isActive = step === activeStep;
          const isCompleted = step < activeStep;
          const circleClass = `${styles.stepCircle} ${
            isActive ? styles.stepCircleActive : isCompleted ? styles.stepCircleCompleted : ""
          }`;

          return (
            <button
              key={step}
              type="button"
              className={circleClass}
              onClick={() => handleStepClick(step)}
              disabled={step >= activeStep} // Disable future clicks
              aria-label={`Step ${step}`}
            >
              {step}
            </button>
          );
        })}
      </div>

      <div className={styles.formCard}>{renderStepComponent()}</div>
    </div>
  );
};

export default ProfileSetupPage;
