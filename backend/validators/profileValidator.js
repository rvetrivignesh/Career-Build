// Validator middleware for Profile requests
export const validateProfile = (req, res, next) => {
  const errors = [];
  const body = req.body;

  // Helper to validate and trim strings
  const validateString = (field, name, required = true) => {
    if (body[field] === undefined || body[field] === null) {
      if (required) {
        errors.push(`${name} is required`);
      }
      return;
    }
    if (typeof body[field] !== "string") {
      errors.push(`${name} must be a string`);
      return;
    }
    body[field] = body[field].trim();
    if (required && body[field].length === 0) {
      errors.push(`${name} cannot be empty`);
    }
  };

  // 1. Personal Details
  validateString("fullName", "Full name", true);
  
  if (body.age === undefined || body.age === null) {
    errors.push("Age is required");
  } else {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 10 || age > 100) {
      errors.push("Age must be an integer between 10 and 100");
    } else {
      body.age = age;
    }
  }

  if (body.gender === undefined || body.gender === null) {
    errors.push("Gender is required");
  } else if (!["Male", "Female", "Other"].includes(body.gender)) {
    errors.push("Gender must be 'Male', 'Female', or 'Other'");
  }

  validateString("phone", "Phone number", true);
  if (body.phone && typeof body.phone === "string") {
    // Simple phone regex to allow +, digits, spaces, and dashes
    const phoneRegex = /^[+\d\s-]+$/;
    if (!phoneRegex.test(body.phone)) {
      errors.push("Phone number format is invalid");
    }
  }

  validateString("location", "Location", true);
  validateString("careerObjective", "Career objective", true);

  // 2. Education Validation
  if (body.education === undefined || body.education === null) {
    errors.push("Education is required");
  } else if (!Array.isArray(body.education)) {
    errors.push("Education must be an array");
  } else if (body.education.length === 0) {
    errors.push("At least one education entry is required");
  } else {
    body.education.forEach((edu, idx) => {
      if (!edu || typeof edu !== "object") {
        errors.push(`Education entry at index ${idx} is invalid`);
        return;
      }
      if (!edu.institute || typeof edu.institute !== "string" || edu.institute.trim().length === 0) {
        errors.push(`Education entry at index ${idx}: Institute is required`);
      } else {
        edu.institute = edu.institute.trim();
      }
      if (!edu.degree || typeof edu.degree !== "string" || edu.degree.trim().length === 0) {
        errors.push(`Education entry at index ${idx}: Degree is required`);
      } else {
        edu.degree = edu.degree.trim();
      }
      if (edu.cgpa !== undefined && edu.cgpa !== null) {
        const cgpa = Number(edu.cgpa);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
          errors.push(`Education entry at index ${idx}: CGPA must be a number between 0 and 10`);
        } else {
          edu.cgpa = cgpa;
        }
      }
      if (edu.duration !== undefined && edu.duration !== null) {
        const dur = Number(edu.duration);
        if (isNaN(dur) || dur < 1 || dur > 10) {
          errors.push(`Education entry at index ${idx}: Duration must be a number between 1 and 10`);
        } else {
          edu.duration = dur;
        }
      }
      if (edu.startYear !== undefined && edu.startYear !== null) {
        const sy = Number(edu.startYear);
        if (isNaN(sy) || sy < 1900 || sy > 2100) {
          errors.push(`Education entry at index ${idx}: Start year is invalid`);
        } else {
          edu.startYear = sy;
        }
      }
      if (edu.endYear !== undefined && edu.endYear !== null) {
        const ey = Number(edu.endYear);
        if (isNaN(ey) || ey < 1900 || ey > 2100) {
          errors.push(`Education entry at index ${idx}: End year is invalid`);
        } else {
          edu.endYear = ey;
        }
      }
      if (edu.location && typeof edu.location === "string") edu.location = edu.location.trim();
      if (edu.startMonth && typeof edu.startMonth === "string") edu.startMonth = edu.startMonth.trim();
      if (edu.endMonth && typeof edu.endMonth === "string") edu.endMonth = edu.endMonth.trim();
    });
  }

  // 3. Skills Validation
  if (body.skills === undefined || body.skills === null) {
    errors.push("Skills are required");
  } else if (!Array.isArray(body.skills)) {
    errors.push("Skills must be an array");
  } else if (body.skills.length === 0) {
    errors.push("At least one skill is required");
  } else {
    body.skills = body.skills.map((skill, idx) => {
      if (typeof skill !== "string") {
        errors.push(`Skill at index ${idx} must be a string`);
        return "";
      }
      return skill.trim();
    }).filter(skill => skill.length > 0);
    if (body.skills.length === 0) {
      errors.push("Skills cannot contain only empty strings");
    }
  }

  // 4. Projects Validation (Optional array)
  if (body.projects !== undefined && body.projects !== null) {
    if (!Array.isArray(body.projects)) {
      errors.push("Projects must be an array");
    } else {
      body.projects.forEach((proj, idx) => {
        if (!proj || typeof proj !== "object") {
          errors.push(`Project at index ${idx} is invalid`);
          return;
        }
        if (!proj.title || typeof proj.title !== "string" || proj.title.trim().length === 0) {
          errors.push(`Project at index ${idx}: Title is required`);
        } else {
          proj.title = proj.title.trim();
        }
        if (proj.description && typeof proj.description === "string") proj.description = proj.description.trim();
        if (Array.isArray(proj.technologies)) {
          proj.technologies = proj.technologies.map(t => typeof t === "string" ? t.trim() : "").filter(t => t.length > 0);
        }
        if (proj.githubLink && typeof proj.githubLink === "string") proj.githubLink = proj.githubLink.trim();
        if (proj.liveLink && typeof proj.liveLink === "string") proj.liveLink = proj.liveLink.trim();
      });
    }
  }

  // 5. Certifications Validation (Optional array)
  if (body.certifications !== undefined && body.certifications !== null) {
    if (!Array.isArray(body.certifications)) {
      errors.push("Certifications must be an array");
    } else {
      body.certifications.forEach((cert, idx) => {
        if (!cert || typeof cert !== "object") {
          errors.push(`Certification at index ${idx} is invalid`);
          return;
        }
        if (!cert.title || typeof cert.title !== "string" || cert.title.trim().length === 0) {
          errors.push(`Certification at index ${idx}: Title is required`);
        } else {
          cert.title = cert.title.trim();
        }
        if (cert.issuer && typeof cert.issuer === "string") cert.issuer = cert.issuer.trim();
        if (cert.credentialLink && typeof cert.credentialLink === "string") cert.credentialLink = cert.credentialLink.trim();
      });
    }
  }

  // 6. Experience Validation (Optional array)
  if (body.experience !== undefined && body.experience !== null) {
    if (!Array.isArray(body.experience)) {
      errors.push("Experience must be an array");
    } else {
      const allowedEmploymentTypes = ["Internship", "Full-Time", "Part-Time", "Freelance", "Contract"];
      body.experience.forEach((exp, idx) => {
        if (!exp || typeof exp !== "object") {
          errors.push(`Experience entry at index ${idx} is invalid`);
          return;
        }
        if (!exp.company || typeof exp.company !== "string" || exp.company.trim().length === 0) {
          errors.push(`Experience entry at index ${idx}: Company is required`);
        } else {
          exp.company = exp.company.trim();
        }
        if (!exp.role || typeof exp.role !== "string" || exp.role.trim().length === 0) {
          errors.push(`Experience entry at index ${idx}: Role is required`);
        } else {
          exp.role = exp.role.trim();
        }
        if (exp.employmentType && !allowedEmploymentTypes.includes(exp.employmentType)) {
          errors.push(`Experience entry at index ${idx}: Employment type must be one of: ${allowedEmploymentTypes.join(", ")}`);
        }
        if (exp.duration !== undefined && exp.duration !== null) {
          const dur = Number(exp.duration);
          if (isNaN(dur) || dur < 1 || dur > 100) {
            errors.push(`Experience entry at index ${idx}: Duration must be a number between 1 and 100`);
          } else {
            exp.duration = dur;
          }
        }
        if (exp.location && typeof exp.location === "string") exp.location = exp.location.trim();
        if (exp.startMonth && typeof exp.startMonth === "string") exp.startMonth = exp.startMonth.trim();
        if (exp.endMonth && typeof exp.endMonth === "string") exp.endMonth = exp.endMonth.trim();
        if (Array.isArray(exp.technologies)) {
          exp.technologies = exp.technologies.map(t => typeof t === "string" ? t.trim() : "").filter(t => t.length > 0);
        }
      });
    }
  }

  // 7. Target Roles Validation
  if (body.targetRoles === undefined || body.targetRoles === null) {
    errors.push("Target roles are required");
  } else if (!Array.isArray(body.targetRoles)) {
    errors.push("Target roles must be an array");
  } else if (body.targetRoles.length === 0) {
    errors.push("At least one target role is required");
  } else {
    body.targetRoles = body.targetRoles.map((role, idx) => {
      if (typeof role !== "string") {
        errors.push(`Target role at index ${idx} must be a string`);
        return "";
      }
      return role.trim();
    }).filter(role => role.length > 0);
    if (body.targetRoles.length === 0) {
      errors.push("Target roles cannot contain only empty strings");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
