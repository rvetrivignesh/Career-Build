/**
 * Gemini API Integration Service
 */

export const generateResumeFromProfile = async (profile) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  // Construct prompt containing user profile data and formatting instructions
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
      "startYear": Start year as number,
      "endMonth": "Month ended or empty if current",
      "endYear": End year as number or empty if current,
      "currentlyWorking": Boolean,
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
      "duration": Duration as number,
      "cgpa": CGPA as number or empty,
      "startMonth": "Month started",
      "startYear": Start year as number,
      "endMonth": "Month ended",
      "endYear": End year as number,
      "currentlyStudying": Boolean
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

  try {
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
              parts: [
                {
                  text: prompt,
                },
              ],
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

    // Strip markdown formatting block if Gemini returned it despite constraints
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(jsonText);
    return parsedData;
  } catch (error) {
    console.error("Gemini service error:", error);
    throw new Error(`Failed to generate resume content via Gemini: ${error.message}`);
  }
};
