import React, { useEffect } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { useAuth } from "@contexts/AuthContext";
import styles from "../ProfileSetupPage.module.css";

export const ContactInfoStep = ({ data, onChange, onNext, onPrev }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Prefill email from auth context if not set
    if (user?.email && !data.email) {
      onChange("email", user.email.toLowerCase().trim());
    }
  }, [user, data.email, onChange]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!data.phoneCountryCode || !data.phoneBody || !data.email) return;

    // Validate URLs (optional)
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    if (data.github && !urlPattern.test(data.github)) {
      alert("GitHub must be a valid URL");
      return;
    }
    if (data.linkedin && !urlPattern.test(data.linkedin)) {
      alert("LinkedIn must be a valid URL");
      return;
    }
    if (data.portfolio && !urlPattern.test(data.portfolio)) {
      alert("Portfolio must be a valid URL");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleNext}>
      <h3 className={styles.stepTitle}>Contact Information</h3>
      <p className={styles.stepDesc}>How can companies or other members reach you?</p>

      <div className={styles.formGrid}>
        <div>
          <Input
            label="Country Code"
            id="phoneCountryCode"
            placeholder="+91"
            value={data.phoneCountryCode || ""}
            onChange={(e) => onChange("phoneCountryCode", e.target.value.trim())}
            required
          />
        </div>

        <div>
          <Input
            label="Mobile Number"
            id="phoneBody"
            placeholder="9876543210"
            type="tel"
            value={data.phoneBody || ""}
            onChange={(e) => onChange("phoneBody", e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value.toLowerCase().trim())}
            disabled // Keep email disabled as it's linked to auth account
            required
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="LinkedIn Profile (Optional)"
            id="linkedin"
            placeholder="https://linkedin.com/in/username"
            value={data.linkedin || ""}
            onChange={(e) => onChange("linkedin", e.target.value.trim())}
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="GitHub Profile (Optional)"
            id="github"
            placeholder="https://github.com/username"
            value={data.github || ""}
            onChange={(e) => onChange("github", e.target.value.trim())}
          />
        </div>

        <div className={styles.fullWidth}>
          <Input
            label="Portfolio Website (Optional)"
            id="portfolio"
            placeholder="https://myportfolio.com"
            value={data.portfolio || ""}
            onChange={(e) => onChange("portfolio", e.target.value.trim())}
          />
        </div>
      </div>

      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default ContactInfoStep;
