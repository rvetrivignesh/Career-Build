// Using global fetch (supported natively in Node.js 18+)

// Helper to make API call to Groq
export const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.2,
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (
    !result.choices ||
    result.choices.length === 0 ||
    !result.choices[0].message ||
    !result.choices[0].message.content
  ) {
    throw new Error("Invalid or empty response from Groq API");
  }

  let jsonText = result.choices[0].message.content.trim();

  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  return JSON.parse(jsonText);
};

export const generateJobRoleIntelligence = async (targetRole) => {
  const prompt = `
You are an expert career consultant.
Analyze the target job role: "${targetRole}"
Generate professional career intelligence for this role in strict JSON format.

Expected Output Schema:
{
  "targetRole": "${targetRole}",
  "coreSkills": ["At least 5 core skills required for this role"],
  "secondarySkills": ["At least 5 secondary/soft skills for this role"],
  "technicalKeywords": ["At least 5 technical keywords/concepts relevant to the role"],
  "tools": ["At least 5 popular software tools, libraries, or IDEs used in this role"],
  "industryKeywords": ["At least 5 industry-specific buzzwords or concepts"],
  "atsKeywords": ["At least 5 keywords frequently found in job descriptions for this role to optimize ATS scoring"],
  "professionalSummary": "A concise, general professional summary (2-3 sentences) for a professional seeking a ${targetRole} role.",
  "careerObjective": "A general career objective for a professional seeking a ${targetRole} role."
}

Do not include markdown blocks, backticks, or other conversational text. Return ONLY the JSON object.
`;
  return await callGroq(prompt);
};

export const generateSummaryAndObjective = async (profile, roleIntelligence) => {
  const prompt = `
You are an expert AI Resume Writer.
Based on the user's raw profile data and the target job role intelligence, generate a highly personalized Professional Summary and Career Objective.

User Profile:
${JSON.stringify(profile, null, 2)}

Role Intelligence:
${JSON.stringify(roleIntelligence, null, 2)}

Generate a customized summary and objective tailored to the target role "${roleIntelligence.targetRole}" and the user's specific experience/skills.

Expected Output Schema:
{
  "summary": "A highly customized professional summary (2-3 sentences) highlighting their matching skills, projects, and experiences.",
  "objective": "A customized career objective focused on their target role and how they can add value."
}

Do not include markdown blocks, backticks, or other conversational text. Return ONLY the JSON object.
`;
  return await callGroq(prompt);
};

export const generateResumeFromProfile = async (profile) => {
  const prompt = `
You are an expert AI Resume Writer specialized in creating ATS-friendly, professional resumes.
Your task is to take the following raw user profile data and generate a highly polished, professional resume in strict JSON format.

Raw Profile Data:
${JSON.stringify(profile, null, 2)}

Instructions for resume generation:
1. **ATS Compatibility**: Optimize the language, structure, and keywords for Applicant Tracking Systems. Highlight relevant skills and professional achievements.
2. **Professional Language**: Enhance sentences to sound professional, active, and result-oriented. Avoid weak phrasing and passive voice.
3. **Consolidate & Streamline**: Remove repetitive content and unnecessary details.
4. **Action Verbs & Metrics**: Describe experiences and projects using action verbs. Create measurable/quantitative achievements where possible based on the provided details.
5. **Relevancy**: Prioritize details matching the user's target roles and career objective.
6. **Strict Output Format**: You MUST return a single, valid JSON object conforming EXACTLY to the schema below.
7. **No Explanations or Markdown**: Do not include markdown formatting, backticks (\`\`\`), or additional conversational text. Return ONLY the raw JSON string.

Expected Output JSON Schema:
{
  "header": {
    "fullName": "User's full name",
    "phone": "User's phone number",
    "location": "User's location (city, state, etc.)",
    "targetRole": "A primary professional title matching targetRoles",
    "careerObjective": "A refined, professional version of the user's careerObjective"
  },
  "professionalSummary": "A concise (2-3 sentences) professional summary highlighting core strengths and target roles.",
  "skills": ["List of consolidated professional and technical skills"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "employmentType": "Internship, Full-Time, Part-Time, Freelance, or Contract",
      "location": "Location of work",
      "duration": "Duration in months or years, e.g. '3 months', '1 year'",
      "startMonth": "Month started",
      "startYear": 2024,
      "endMonth": "Month ended or empty if current",
      "endYear": 2025,
      "currentlyWorking": true,
      "highlights": ["Bullet points of result-oriented accomplishments and responsibilities (concise, no long paragraphs)"]
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short project description",
      "technologies": ["List of technologies used"],
      "githubLink": "GitHub repository URL or empty string",
      "liveLink": "Live project URL or empty string"
    }
  ],
  "education": [
    {
      "institute": "School or University Name",
      "degree": "Degree and Major",
      "location": "Location",
      "duration": 4,
      "cgpa": 9.5,
      "startMonth": "Month started",
      "startYear": 2022,
      "endMonth": "Month ended",
      "endYear": 2026,
      "currentlyStudying": false
    }
  ],
  "certifications": [
    {
      "title": "Certification Title",
      "issuer": "Issuing Organization",
      "issueDate": "Date issued as string or empty",
      "credentialLink": "Credential verification URL or empty string"
    }
  ],
  "achievements": ["Bullet points of key academic, professional, or skill milestones"]
}
`;
  return await callGroq(prompt);
};

export const fallbackExtractResume = async (rawText) => {
  const prompt = `
You are an expert AI Resume Parser.
Extract the structured information from the raw resume text provided below.
Provide a clean, consolidated, and structured extraction in strict JSON format.

Raw Resume Text:
"""
${rawText}
"""

Expected Output Schema:
{
  "skills": ["List of skills found"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short project description or bullet details",
      "technologies": ["List of technologies used"]
    }
  ],
  "education": [
    {
      "institute": "School or University Name",
      "degree": "Degree and Major",
      "location": "Location or empty string",
      "duration": "Duration description or years"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "description": "Responsibility descriptions or bullet points",
      "duration": "Duration in months or years"
    }
  ],
  "certifications": [
    {
      "title": "Certification Title",
      "issuer": "Issuing Organization or empty"
    }
  ]
}

Ensure to return only valid JSON without markdown wrapping. Do not generate any scores.
`;
  return await callGroq(prompt);
};

export const analyzeResumeWithGemini = async (fileBuffer, fileMimeType, resumeText, targetRole, roleProfile, userProgress) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) Resume Reviewer and Career Coach.
Analyze the attached candidate's resume (provided as a native PDF document file or raw text if DOCX) against the target role: "${targetRole}".

Target Role Profile Requirements:
- Core Skills: ${JSON.stringify(roleProfile?.coreSkills || [])}
- Secondary Skills: ${JSON.stringify(roleProfile?.secondarySkills || [])}
- Tools: ${JSON.stringify(roleProfile?.tools || [])}
- Technical Keywords: ${JSON.stringify(roleProfile?.technicalKeywords || [])}

User's Learning & Assessment Progress on our Platform:
- Skills they assessed/completed: ${JSON.stringify(userProgress?.completedSkills || [])}
- Highest quiz score per skill: ${JSON.stringify(userProgress?.quizScores || {})}

Analyze the resume's technology stack, work experience, projects, and educational background against these requirements. Understand the text semantically (e.g., if the resume mentions 'Node/Express' and 'MongoDB', then 'Node.js', 'Express.js', and 'MongoDB' are present). Detect skills, internships/experience, projects, and education correctly, regardless of column or page formatting.

Evaluate:
1. Overall Resume Score (0-100)
2. ATS Compatibility Score (0-100)
3. Technical Skills Score (0-100)
4. Project Quality Score (0-100)
5. Experience Score (0-100)
6. Education Score (0-100)
7. Industry Readiness Score (0-100)
8. Communication Score (0-100)

Return a strict, valid JSON object containing exactly the fields listed below. Do not wrap in markdown blocks (such as \`\`\`json), do not include any explanatory notes, or pre/post-text.

JSON Output Schema:
{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "technicalScore": number (0-100),
  "projectScore": number (0-100),
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "industryReadiness": number (0-100),
  "communicationScore": number (0-100),
  "candidate": {
    "name": "Candidate's full name (or empty string if not found)",
    "email": "Candidate's email (or empty string if not found)",
    "phone": "Candidate's phone number (or empty string if not found)",
    "location": "Candidate's location/address (or empty string if not found)"
  },
  "skills": ["Array of core technical/soft skills extracted from the resume"],
  "frameworks": ["Array of frameworks/libraries extracted from the resume"],
  "databases": ["Array of databases extracted from the resume"],
  "tools": ["Array of tools/IDEs/platforms extracted from the resume"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short description of project and achievements",
      "technologies": ["List of technologies used in this project"]
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job/Internship Title",
      "description": "Description of work done and accomplishments",
      "duration": "Duration or years of employment, e.g. 'June 2024 - Present' or '6 months'"
    }
  ],
  "education": [
    {
      "institute": "University or School Name",
      "degree": "Degree and major description",
      "duration": "Graduation year or duration of studies, e.g. '2020 - 2024'"
    }
  ],
  "strengths": ["3-5 clear, specific professional strengths identified in the resume (as strings)"],
  "weaknesses": ["3-5 clear, specific weaknesses or gaps in the resume (as strings)"],
  "missingSkills": ["List of core/secondary skills from the Target Role Profile that are missing from this resume (as strings)"],
  "recommendations": ["3-5 highly actionable suggestions to improve the resume or career preparedness (as strings)"],
  "careerPreparedness": {
    "technicalSkills": number (0-100, matching technicalScore),
    "projects": number (0-100, matching projectScore),
    "experience": number (0-100, matching experienceScore),
    "resumeQuality": number (0-100, matching communicationScore),
    "industryReadiness": number (0-100, matching industryReadiness)
  }
}
`;

  const parts = [];
  if (fileBuffer && fileMimeType === "application/pdf") {
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: fileBuffer.toString("base64")
      }
    });
  } else if (resumeText) {
    parts.push({
      text: `Candidate's Resume Text (Extracted):\n"""\n${resumeText}\n"""`
    });
  }

  parts.push({
    text: prompt
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: parts,
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (
    !result.candidates ||
    result.candidates.length === 0 ||
    !result.candidates[0].content ||
    !result.candidates[0].content.parts ||
    result.candidates[0].content.parts.length === 0
  ) {
    throw new Error("Invalid or empty response from Gemini API");
  }

  let jsonText = result.candidates[0].content.parts[0].text.trim();

  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  return JSON.parse(jsonText);
};


