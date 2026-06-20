/**
 * Reusable Resume Parser Utility
 * Extracts contact info, summary, skills, projects, experience, education, certifications, and achievements
 */

const detectSectionType = (line) => {
  if (!line) return null;
  const clean = line.replace(/[:\-•\s\d\.\(\)]+/g, " ").trim().toLowerCase();
  
  // Length check: section headers are usually very short
  if (clean.length === 0 || clean.split(/\s+/).length > 5) return null;

  const sectionHeadersMap = {
    summary: [
      "summary", "profile", "objective", "career objective", "about me", "executive summary", 
      "professional summary", "professional profile", "summary of qualifications", "intro", "introduction"
    ],
    skills: [
      "skills", "technical skills", "core competencies", "key skills", "technologies", 
      "programming languages", "technical skills & core skills", "technologies tools", 
      "toolset", "professional skills", "expertise", "technical expertise", "skills & tools",
      "skills and technologies"
    ],
    projects: [
      "projects", "personal projects", "key projects", "recent projects", "academic projects", 
      "technical projects", "selected projects", "development projects", "portfolio", "featured projects"
    ],
    experience: [
      "experience", "work experience", "employment history", "work history", "job history", 
      "professional experience", "professional work experience", "relevant experience", 
      "employment", "career history"
    ],
    education: [
      "education", "academic background", "academic history", "education credentials", 
      "academic qualifications", "qualifications"
    ],
    certifications: [
      "certifications", "certificates", "licenses", "courses", "awards", "credentials",
      "certification", "licensure"
    ],
    achievements: [
      "achievements", "awards", "honors", "key achievements", "accomplishments"
    ]
  };

  for (const [secName, keywords] of Object.entries(sectionHeadersMap)) {
    if (keywords.includes(clean)) {
      return secName;
    }
  }

  // Regex fallback detection for headings
  if (/^tech(nical)?\s+skills$/i.test(clean) || /^(skills|technologies)(\s+&\s+tools)?$/i.test(clean)) return "skills";
  if (/^(work|professional|relevant)?\s*experience$/i.test(clean) || /^employment(\s+history)?$/i.test(clean)) return "experience";
  if (/^education(\s+background)?$/i.test(clean) || /^academic\s+(history|background)$/i.test(clean)) return "education";
  if (/^projects$/i.test(clean) || /^personal\s+projects$/i.test(clean)) return "projects";
  if (/^(certifications|certificates|licenses)$/i.test(clean)) return "certifications";
  if (/^achievements$/i.test(clean) || /^awards$/i.test(clean)) return "achievements";

  return null;
};

export const extractResumeSections = (text) => {
  if (!text) {
    return {
      hasContact: false,
      hasEmails: false,
      hasPhones: false,
      hasLinks: false,
      summary: "",
      skills: "",
      projects: "",
      experience: "",
      education: "",
      certifications: "",
      achievements: ""
    };
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  
  // Extract contact info
  const emails = [];
  const phones = [];
  const links = [];
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/ig;

  text.replace(emailRegex, (m) => emails.push(m));
  text.replace(phoneRegex, (m) => phones.push(m));
  text.replace(urlRegex, (m) => links.push(m));

  // Identify sections
  const sections = {
    summary: [],
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    achievements: []
  };

  let currentSection = "";

  for (const line of lines) {
    const sectionType = detectSectionType(line);
    if (sectionType) {
      currentSection = sectionType;
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return {
    hasContact: emails.length > 0 || phones.length > 0 || links.length > 0,
    hasEmails: emails.length > 0,
    hasPhones: phones.length > 0,
    hasLinks: links.length > 0,
    summary: sections.summary.join(" "),
    skills: sections.skills.join(" "),
    projects: sections.projects.join("\n"),
    experience: sections.experience.join("\n"),
    education: sections.education.join("\n"),
    certifications: sections.certifications.join("\n"),
    achievements: sections.achievements.join("\n")
  };
};
