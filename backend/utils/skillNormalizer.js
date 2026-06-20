/**
 * Skill Normalizer Utility
 * Normalizes variations of popular skill names to standard representations.
 */

const skillMapping = {
  // NodeJS
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "node js": "Node.js",
  "node-js": "Node.js",

  // React
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
  "react js": "React",

  // Machine Learning
  "machine learning": "Machine Learning",
  "ml": "Machine Learning",
  "machine-learning": "Machine Learning",

  // JavaScript
  "javascript": "JavaScript",
  "js": "JavaScript",

  // TypeScript
  "typescript": "TypeScript",
  "ts": "TypeScript",

  // MongoDB
  "mongodb": "MongoDB",
  "mongo db": "MongoDB",

  // PostgreSQL
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",

  // Tailwind CSS
  "tailwind css": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind": "Tailwind CSS",

  // DevOps
  "devops": "DevOps",
  "dev ops": "DevOps",

  // AWS
  "aws": "AWS",
  "amazon web services": "AWS",
};

/**
 * Normalizes a single skill name to its standard form.
 * @param {string} skill - The raw skill name.
 * @returns {string} - Normalized skill name.
 */
export const normalizeSkill = (skill) => {
  if (!skill) return "";
  const clean = skill.trim().toLowerCase();
  return skillMapping[clean] || skill.trim();
};

/**
 * Normalizes a list of skills or a delimited string of skills.
 * @param {Array|string} skills - Array or delimited string of skills.
 * @returns {Array} - Cleaned list of unique normalized skills.
 */
export const normalizeSkillsList = (skills) => {
  if (!skills) return [];
  let list = [];
  if (typeof skills === "string") {
    list = skills.split(/[,;\/\n•]+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(skills)) {
    list = skills;
  }
  return [...new Set(list.map(normalizeSkill).filter(Boolean))];
};

/**
 * Returns regex variants to match variations of a given standard skill.
 * @param {string} skill - Canonical skill name
 * @returns {Array} - Array of regex string variants
 */
export const getSkillVariants = (skill) => {
  const clean = skill.toLowerCase().trim();
  if (clean === "node.js" || clean === "nodejs" || clean === "node js") {
    return ["node\\.js", "nodejs", "node\\s+js"];
  }
  if (clean === "react" || clean === "reactjs" || clean === "react.js" || clean === "react js") {
    return ["react", "reactjs", "react\\.js", "react\\s+js"];
  }
  if (clean === "machine learning" || clean === "ml" || clean === "machine-learning") {
    return ["machine\\s*learning", "\\bml\\b", "machine-learning"];
  }
  if (clean === "javascript" || clean === "js") {
    return ["javascript", "\\bjs\\b"];
  }
  if (clean === "typescript" || clean === "ts") {
    return ["typescript", "\\bts\\b"];
  }
  if (clean === "postgresql" || clean === "postgres") {
    return ["postgresql", "postgres"];
  }
  if (clean === "tailwind css" || clean === "tailwindcss" || clean === "tailwind") {
    return ["tailwind\\s*css", "tailwindcss", "tailwind"];
  }
  return [skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')];
};

/**
 * Robust skill matching checker.
 * @param {string} skill - Canonical skill name to match.
 * @param {string} text - Raw search text.
 * @returns {boolean} - True if skill or any of its variations matches.
 */
export const checkSkillMatch = (skill, text) => {
  if (!skill || !text) return false;
  const variants = getSkillVariants(skill);
  return variants.some(v => {
    const regex = new RegExp(v.startsWith("\\b") ? v : `\\b${v}\\b`, "i");
    return regex.test(text);
  });
};
