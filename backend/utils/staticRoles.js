export const staticRoles = {
  "Frontend Developer": {
    coreSkills: ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Redux"],
    secondarySkills: ["Webpack", "Vite", "Next.js", "Tailwind CSS", "Sass", "Git", "Testing"],
    tools: ["Chrome DevTools", "VS Code", "GitHub", "Figma"],
    technicalKeywords: ["DOM Manipulation", "REST API", "GraphQL", "Responsive Design", "Vite", "npm", "SEO"],
    atsKeywords: ["Vite", "Responsive Design", "TypeScript", "Redux", "React State Management", "Single Page Application"],
    professionalSummary: "Detail-oriented Frontend Developer with experience building highly interactive user interfaces using React, JavaScript, and modern CSS modules. Passionate about performance, responsive design, and state management.",
    careerObjective: "To obtain a challenging position as a Frontend Developer, leveraging expertise in React, TypeScript, and modern UI practices to build clean, maintainable, and high-performance client applications."
  },
  "Backend Developer": {
    coreSkills: ["Node.js", "Express", "JavaScript", "Python", "SQL", "MongoDB", "PostgreSQL"],
    secondarySkills: ["Docker", "REST API", "GraphQL", "Redis", "AWS", "Microservices", "Git", "Testing"],
    tools: ["Postman", "Docker", "VS Code", "GitHub", "Databases"],
    technicalKeywords: ["MVC Architecture", "Authentication", "JWT", "ORM", "Scaling", "Middleware", "Unit Testing"],
    atsKeywords: ["Node.js API", "Database Design", "JWT Authentication", "Microservices Architecture", "API Documentation", "Containerization"],
    professionalSummary: "Robust Backend Developer specializing in Node.js, database optimization, and high-performance API design. Experienced in Docker containerization, REST/GraphQL design patterns, and microservices architecture.",
    careerObjective: "Seeking a Backend Developer role to design scalable system architectures, improve database throughput, and implement secure token-based user authentication methods."
  },
  "Full Stack Developer": {
    coreSkills: ["React", "Node.js", "Express", "JavaScript", "SQL", "MongoDB", "TypeScript"],
    secondarySkills: ["Next.js", "Docker", "REST API", "GraphQL", "AWS", "Tailwind CSS", "CSS", "Git"],
    tools: ["Postman", "Docker", "VS Code", "GitHub", "Webpack"],
    technicalKeywords: ["Authentication", "DOM Manipulation", "Responsive Design", "JWT", "CI/CD Pipelines", "Git"],
    atsKeywords: ["MERN Stack", "Full Stack Architecture", "API Integration", "State Management", "JWT", "Version Control"],
    professionalSummary: "Versatile Full Stack Developer with expertise in building end-to-end applications using the MERN stack. Proficient in both modern responsive user interfaces and backend REST services.",
    careerObjective: "Looking to contribute as a Full Stack Developer by leveraging frontend UX skills and backend database architecture capabilities to deliver robust, high-performance web products."
  },
  "AI Engineer": {
    coreSkills: ["Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "LLMs", "NLP"],
    secondarySkills: ["Scikit-Learn", "Pandas", "NumPy", "SQL", "Git", "Docker", "Prompt Engineering"],
    tools: ["Jupyter Notebook", "Google Colab", "Hugging Face", "Weights & Biases"],
    technicalKeywords: ["Transformers", "Neural Networks", "Fine-Tuning", "Embeddings", "Vector Databases", "LangChain"],
    atsKeywords: ["Large Language Models", "Model Evaluation", "Neural Networks", "Transformers Architecture", "Data Pipeline", "Python AI Scripting"],
    professionalSummary: "Innovating AI Engineer specializing in Python, PyTorch, and deploying Large Language Models. Experienced in neural networks architecture, supervised fine-tuning, and embedding-based search vector stores.",
    careerObjective: "To work as an AI Engineer focusing on commercializing machine learning techniques, prompt optimizations, and embedding AI agents into web application platforms."
  },
  "Data Scientist": {
    coreSkills: ["Python", "SQL", "R", "Statistics", "Machine Learning", "Data Analysis", "Data Visualization"],
    secondarySkills: ["Pandas", "NumPy", "Scikit-Learn", "Tableau", "PowerBI", "Git", "Big Data"],
    tools: ["Jupyter Notebook", "Tableau", "Excel", "GitHub"],
    technicalKeywords: ["A/B Testing", "Regression Analysis", "Classification", "Clustering", "EDA", "Probability Theory"],
    atsKeywords: ["Predictive Modeling", "Exploratory Data Analysis", "A/B Testing", "Data Analysis", "Regression Modeling", "Machine Learning Algorithms"],
    professionalSummary: "Analytical Data Scientist with background in statistics, data mining, and machine learning architectures. Highly skilled in converting unstructured data into actionable data visualizations.",
    careerObjective: "Seeking a Data Scientist position to lead statistical experiment designs, predictive pipeline deployments, and help management make data-driven decisions."
  },
  "DevOps Engineer": {
    coreSkills: ["Docker", "Kubernetes", "CI/CD Pipelines", "AWS", "Linux", "Terraform", "Bash Scripting"],
    secondarySkills: ["Python", "Git", "Jenkins", "GitHub Actions", "Monitoring Tools", "Prometheus", "Ansible"],
    tools: ["Docker", "Kubernetes", "AWS", "Jenkins", "Grafana", "Git"],
    technicalKeywords: ["Infrastructure as Code", "Containerization", "Automation Pipelines", "Scaling", "System Administration", "Nginx", "Cloud Security"],
    atsKeywords: ["Infrastructure as Code", "CI/CD Pipelines", "Container Orchestration", "Cloud Deployments", "Monitoring & Alerts", "Linux Shell Scripting"],
    professionalSummary: "Security-focused DevOps Engineer with extensive experience in automated infrastructure scripting (Terraform), continuous integration, and container orchestration workflows (Kubernetes).",
    careerObjective: "Aiming for a DevOps position to design robust automated deployment pipelines, reduce server latencies, and implement standard system monitoring configurations."
  }
};

export const normalizeTargetRole = (role) => {
  if (!role) return "";
  const clean = role.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  if (clean.includes("frontend") || clean.includes("front end")) return "Frontend Developer";
  if (clean.includes("backend") || clean.includes("back end")) return "Backend Developer";
  if (clean.includes("full stack") || clean.includes("fullstack") || clean.includes("full-stack")) return "Full Stack Developer";
  if (clean.includes("ai ") || clean.startsWith("ai") || clean.includes("artificial intelligence")) return "AI Engineer";
  if (clean.includes("data scientist") || clean.includes("data science")) return "Data Scientist";
  if (clean.includes("devops") || clean.includes("dev ops")) return "DevOps Engineer";
  return role; // Fallback to original
};
