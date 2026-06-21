# TASK: Resume Analyzer V5 - Gemini Native File Analysis

## Objective

Completely remove local resume parsing logic.

The system should no longer:

* Extract skills locally
* Parse projects locally
* Parse education locally
* Parse experience locally
* Use regex matching
* Use keyword matching
* Use pdf-parse for analysis
* Use OCR for analysis

Instead:

The uploaded resume file itself should be sent directly to Gemini.

Gemini should perform 100% of the analysis.

---

# Why This Change

Current architecture:

```text
Resume
 ↓
Local Parser
 ↓
Extract Text
 ↓
Extract Skills
 ↓
Build Prompt
 ↓
Gemini
```

Problems:

* Different PDF layouts break extraction
* Two-column resumes fail
* ATS templates fail
* Canva templates fail
* Scanned PDFs fail
* Skills are missed
* Scores become inaccurate

The parser has become the bottleneck.

---

# New Architecture

```text
Resume Upload
 ↓
Gemini File Upload
 ↓
Gemini Analysis
 ↓
Structured JSON
 ↓
Frontend Display
```

Gemini already understands:

* PDF structure
* DOCX structure
* Columns
* Tables
* Sidebars
* Formatting
* Resume sections

There is no reason for us to recreate that logic.

---

# Backend Requirements

## Remove Existing Logic

Delete all code related to:

```javascript
extractSkills()
extractProjects()
extractEducation()
extractExperience()
scoreKeywords()
pdfTextParsing()
resumeKeywordMatching()
```

No local extraction should influence analysis.

---

# Gemini File Upload Flow

When user uploads:

```text
resume.pdf
```

Store temporarily.

Upload directly to Gemini.

Example flow:

```javascript
const uploadedFile = await ai.files.upload({
  file: resumePath
});
```

Then:

```javascript
const response = await model.generateContent([
  uploadedFile,
  analysisPrompt
]);
```

The actual uploaded file must be attached.

Do not send extracted text.

Do not send parser output.

Do not send keyword lists.

Send the file itself.

---

# Gemini Analysis Prompt

Prompt:

You are an expert ATS Resume Reviewer and Career Coach.

Analyze the attached resume.

Return ONLY valid JSON.

Evaluate:

1. Overall Resume Score (0-100)
2. ATS Compatibility Score
3. Technical Skills Score
4. Project Quality Score
5. Experience Score
6. Education Score
7. Industry Readiness Score
8. Communication Score

Extract:

* Name
* Email
* Phone
* Location
* Skills
* Programming Languages
* Frameworks
* Libraries
* Databases
* Tools
* Projects
* Education
* Certifications
* Experience
* Strengths
* Weaknesses
* Missing Skills

Generate:

* Career Preparedness Breakdown
* ATS Suggestions
* Resume Improvement Suggestions
* Learning Roadmap
* Interview Readiness Assessment

Return JSON only.

---

# Expected Response Format

```json
{
  "overallScore": 74,

  "atsScore": 81,
  "technicalScore": 76,
  "projectScore": 72,
  "experienceScore": 58,
  "educationScore": 88,
  "industryReadiness": 68,
  "communicationScore": 71,

  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },

  "skills": [],
  "frameworks": [],
  "databases": [],
  "tools": [],

  "projects": [],

  "experience": [],

  "education": [],

  "strengths": [],

  "weaknesses": [],

  "missingSkills": [],

  "recommendations": [],

  "careerPreparedness": {
    "technicalSkills": 0,
    "projects": 0,
    "experience": 0,
    "resumeQuality": 0,
    "industryReadiness": 0
  }
}
```

---

# Scoring Rules

Gemini should determine scores.

The backend must NOT calculate scores.

The backend must NOT modify scores.

The backend must NOT normalize scores.

The backend must simply:

```javascript
return geminiResponse;
```

---

# Frontend Requirements

Frontend becomes a renderer.

It should:

1. Upload resume
2. Wait for analysis
3. Render returned JSON

The frontend must not compute:

* Skills
* Scores
* Missing skills

Everything comes from Gemini.

---

# Error Handling

If Gemini fails:

Return:

```json
{
  "success": false,
  "error": "Resume analysis failed"
}
```

Do not attempt local analysis.

Do not generate fallback scores.

Do not generate placeholder data.

---

# Development Debug Logs

Add:

```javascript
console.log("Uploaded Resume:", file.name);

console.log("Gemini Analysis Started");

console.log("Gemini Response:", result);
```

for debugging.

---

# Acceptance Criteria

The implementation is complete only if:

✓ Entire resume file is sent directly to Gemini

✓ No local skill extraction exists

✓ No regex extraction exists

✓ No keyword matching exists

✓ No local score calculation exists

✓ Gemini returns all metrics

✓ Frontend only renders Gemini output

✓ Resume analysis works regardless of PDF layout

✓ Two-column resumes work

✓ ATS templates work

✓ Modern resume designs work

✓ Scores are generated entirely by Gemini

Priority: BLOCKER

Resume analysis should rely on Gemini's document understanding capabilities rather than local parsing logic.
