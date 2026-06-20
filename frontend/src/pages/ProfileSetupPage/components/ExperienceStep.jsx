import React, { useState } from "react";
import Input from "@components/Input";
import Button from "@components/Button";
import { Plus, Trash2, Edit } from "lucide-react";
import styles from "../ProfileSetupPage.module.css";

const selectStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--card-bg)",
  color: "var(--text-color)",
  fontSize: "14px",
  outline: "none",
};

const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getMonthIndex = (m) => {
  if (!m) return 0;
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  return months[m.toLowerCase().trim()] ?? 0;
};

const getDurationText = (startMon, startYr, endMon, endYr, isCurrent) => {
  const startY = parseInt(startYr);
  const startM = getMonthIndex(startMon);
  
  let endY, endM;
  if (isCurrent) {
    const now = new Date();
    endY = now.getFullYear();
    endM = now.getMonth();
  } else {
    endY = parseInt(endYr);
    endM = getMonthIndex(endMon);
  }

  if (isNaN(startY) || isNaN(startM) || isNaN(endY) || isNaN(endM)) {
    return "";
  }

  const totalMonths = (endY - startY) * 12 + (endM - startM) + 1;
  if (totalMonths <= 0) return "0 Months";

  const yrs = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  let parts = [];
  if (yrs > 0) parts.push(`${yrs} ${yrs === 1 ? "Year" : "Years"}`);
  if (mos > 0) parts.push(`${mos} ${mos === 1 ? "Month" : "Months"}`);
  return parts.join(" ") || "0 Months";
};

const compareExperience = (a, b) => {
  const isCurrentA = a.currentlyWorking || a.isCurrentRole;
  const isCurrentB = b.currentlyWorking || b.isCurrentRole;

  if (isCurrentA && !isCurrentB) return -1;
  if (!isCurrentA && isCurrentB) return 1;

  if (!isCurrentA && !isCurrentB) {
    if (a.endYear !== b.endYear) {
      return (b.endYear || 0) - (a.endYear || 0);
    }
    const endMonA = getMonthIndex(a.endMonth);
    const endMonB = getMonthIndex(b.endMonth);
    if (endMonA !== endMonB) {
      return endMonB - endMonA;
    }
  }

  if (a.startYear !== b.startYear) {
    return (b.startYear || 0) - (a.startYear || 0);
  }
  const startMonA = getMonthIndex(a.startMonth);
  const startMonB = getMonthIndex(b.startMonth);
  return startMonB - startMonA;
};

export const ExperienceStep = ({ data, onChange, onNext, onPrev }) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-Time");
  const [startMonth, setStartMonth] = useState("Jan");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("Dec");
  const [endYear, setEndYear] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const experienceList = [...(data.experience || [])].sort(compareExperience);
  const employmentTypes = ["Internship", "Full-Time", "Part-Time", "Freelance", "Contract"];

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!company || !role || !startYear) return;

    const startY = parseInt(startYear);
    const startM = getMonthIndex(startMonth);

    let endY, endM;
    if (currentlyWorking) {
      const now = new Date();
      endY = now.getFullYear();
      endM = now.getMonth();
    } else {
      endY = parseInt(endYear);
      endM = getMonthIndex(endMonth);

      // Validate date sequence
      if (endY < startY || (endY === startY && endM < startM)) {
        alert("End Date must not occur before Start Date.");
        return;
      }
    }

    const calculatedMonths = (endY - startY) * 12 + (endM - startM) + 1;

    const newEntry = {
      company,
      role,
      description,
      employmentType,
      startMonth,
      startYear: startY,
      endMonth: currentlyWorking ? "" : endMonth,
      endYear: currentlyWorking ? null : endY,
      currentlyWorking,
      isCurrentRole: currentlyWorking,
      duration: calculatedMonths > 0 ? calculatedMonths : 1,
    };

    let updatedList;
    if (editingIndex >= 0) {
      updatedList = [...experienceList];
      updatedList[editingIndex] = newEntry;
      setEditingIndex(-1);
    } else {
      updatedList = [...experienceList, newEntry];
    }

    const sortedList = updatedList.sort(compareExperience);
    onChange("experience", sortedList);
    resetForm();
  };

  const resetForm = () => {
    setCompany("");
    setRole("");
    setDescription("");
    setEmploymentType("Full-Time");
    setStartMonth("Jan");
    setStartYear("");
    setEndMonth("Dec");
    setEndYear("");
    setCurrentlyWorking(false);
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    const entry = experienceList[index];
    setCompany(entry.company);
    setRole(entry.role);
    setDescription(entry.description || "");
    setEmploymentType(entry.employmentType || "Full-Time");
    setStartMonth(entry.startMonth || "Jan");
    setStartYear(entry.startYear || "");
    setEndMonth(entry.endMonth || "Dec");
    setEndYear(entry.endYear || "");
    setCurrentlyWorking(entry.currentlyWorking || entry.isCurrentRole || false);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = experienceList.filter((_, i) => i !== index);
    onChange("experience", updatedList.sort(compareExperience));
  };

  return (
    <div>
      <h3 className={styles.stepTitle}>Work Experience</h3>
      <p className={styles.stepDesc}>Add internships or full-time experience (optional).</p>

      {/* Form */}
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: "20px" }}>
        <div className={styles.formGrid}>
          <div>
            <Input
              label="Company Name"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Google"
              required
            />
          </div>

          <div>
            <Input
              label="Job Title / Role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Software Engineer"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="employmentType" style={{ fontSize: "14px", fontWeight: 550 }}>Employment Type</label>
            <select
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              style={selectStyle}
            >
              {employmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="startMonth" style={{ fontSize: "14px", fontWeight: 550 }}>
              Start Month <span style={{ color: "var(--error-color)" }}>*</span>
            </label>
            <select
              id="startMonth"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              required
              style={selectStyle}
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Start Year"
              id="startYear"
              type="number"
              min="1900"
              max="2100"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="2024"
              required
            />
          </div>

          <div className={styles.fullWidth} style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left", margin: "4px 0" }}>
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
            />
            <label htmlFor="currentlyWorking" style={{ fontSize: "14px" }}>Currently Working Here</label>
          </div>

          {!currentlyWorking && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                <label htmlFor="endMonth" style={{ fontSize: "14px", fontWeight: 550 }}>
                  End Month <span style={{ color: "var(--error-color)" }}>*</span>
                </label>
                <select
                  id="endMonth"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  required={!currentlyWorking}
                  style={selectStyle}
                >
                  {monthsList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="End Year"
                  id="endYear"
                  type="number"
                  min="1900"
                  max="2100"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  placeholder="2025"
                  required={!currentlyWorking}
                />
              </div>
            </>
          )}

          <div className={styles.fullWidth} style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="description" style={{ fontSize: "14px", fontWeight: 550 }}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your responsibilities, key achievements, and technologies used."
              rows="3"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
                fontSize: "14px",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <Button type="submit" variant="secondary">
            <Plus size={16} style={{ marginRight: "4px" }} />
            {editingIndex >= 0 ? "Update Experience" : "Add Experience"}
          </Button>
        </div>
      </form>

      {/* List */}
      <div className={styles.listContainer}>
        {experienceList.map((exp, idx) => {
          const startMonthStr = exp.startMonth ? (exp.startMonth.length > 3 ? exp.startMonth.substring(0, 3) : exp.startMonth) : "Jan";
          const endMonthStr = exp.endMonth ? (exp.endMonth.length > 3 ? exp.endMonth.substring(0, 3) : exp.endMonth) : "Dec";
          const isCurrent = exp.currentlyWorking || exp.isCurrentRole;
          const dateRange = `${startMonthStr} ${exp.startYear} – ${isCurrent ? "Present" : `${endMonthStr} ${exp.endYear}`}`;
          const durationText = getDurationText(exp.startMonth || "Jan", exp.startYear, exp.endMonth || "Dec", exp.endYear, isCurrent);

          return (
            <div key={idx} className={styles.listItem}>
              <div className={styles.listItemInfo}>
                <span className={styles.listItemTitle}>{exp.role} at {exp.company}</span>
                <span className={styles.listItemSubtitle}>
                  {exp.employmentType} | {dateRange} {durationText ? `(${durationText})` : ""}
                </span>
                {exp.description && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {exp.description}
                  </p>
                )}
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => handleEdit(idx)} className={styles.iconBtn} aria-label="Edit Experience">
                  <Edit size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(idx)} className={styles.iconBtn} aria-label="Delete Experience">
                  <Trash2 size={16} color="var(--error-color)" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.buttonRow}>
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};

export default ExperienceStep;
