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

const getMonthValue = (m) => {
  if (!m) return 0;
  const months = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };
  return months[m.toLowerCase().trim()] || 0;
};

const compareEducation = (a, b) => {
  const isCurrentA = a.currentlyStudying;
  const isCurrentB = b.currentlyStudying;

  if (isCurrentA && !isCurrentB) return -1;
  if (!isCurrentA && isCurrentB) return 1;

  if (!isCurrentA && !isCurrentB) {
    if (a.endYear !== b.endYear) {
      return (b.endYear || 0) - (a.endYear || 0);
    }
    const endMonA = getMonthValue(a.endMonth);
    const endMonB = getMonthValue(b.endMonth);
    if (endMonA !== endMonB) {
      return endMonB - endMonA;
    }
  }

  if (a.startYear !== b.startYear) {
    return (b.startYear || 0) - (a.startYear || 0);
  }
  const startMonA = getMonthValue(a.startMonth);
  const startMonB = getMonthValue(b.startMonth);
  return startMonB - startMonA;
};

export const EducationStep = ({ data, onChange, onNext, onPrev }) => {
  const [institute, setInstitute] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [startMonth, setStartMonth] = useState("Jan");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("Dec");
  const [endYear, setEndYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [currentlyStudying, setCurrentlyStudying] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const educationList = [...(data.education || [])].sort(compareEducation);

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!institute || !degree || !branch || !startYear) return;

    const newEntry = {
      institute,
      degree,
      branch,
      startMonth,
      startYear: parseInt(startYear),
      endMonth: currentlyStudying ? "" : endMonth,
      endYear: currentlyStudying ? null : parseInt(endYear),
      currentlyStudying,
      cgpa: cgpa ? parseFloat(cgpa) : null,
    };

    let updatedList;
    if (editingIndex >= 0) {
      updatedList = [...educationList];
      updatedList[editingIndex] = newEntry;
      setEditingIndex(-1);
    } else {
      updatedList = [...educationList, newEntry];
    }

    const sortedList = updatedList.sort(compareEducation);
    onChange("education", sortedList);
    resetForm();
  };

  const resetForm = () => {
    setInstitute("");
    setDegree("");
    setBranch("");
    setStartMonth("Jan");
    setStartYear("");
    setEndMonth("Dec");
    setEndYear("");
    setCgpa("");
    setCurrentlyStudying(false);
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    const entry = educationList[index];
    setInstitute(entry.institute);
    setDegree(entry.degree);
    setBranch(entry.branch);
    setStartMonth(entry.startMonth || "Jan");
    setStartYear(entry.startYear || "");
    setEndMonth(entry.endMonth || "Dec");
    setEndYear(entry.endYear || "");
    setCgpa(entry.cgpa || "");
    setCurrentlyStudying(entry.currentlyStudying || false);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = educationList.filter((_, i) => i !== index);
    onChange("education", updatedList.sort(compareEducation));
  };

  const handleNext = () => {
    if (educationList.length === 0) {
      alert("At least one education entry is required.");
      return;
    }
    onNext();
  };

  return (
    <div>
      <h3 className={styles.stepTitle}>Education Details</h3>
      <p className={styles.stepDesc}>Add your educational credentials (at least one is required).</p>

      {/* Form Card */}
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: "20px" }}>
        <div className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <Input
              label="Institute / School Name"
              id="institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              placeholder="State University"
              required
            />
          </div>

          <div>
            <Input
              label="Degree"
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="Bachelor of Science"
              required
            />
          </div>

          <div>
            <Input
              label="Branch / Specialization"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="Computer Science"
              required
            />
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
              placeholder="2022"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label htmlFor="endMonth" style={{ fontSize: "14px", fontWeight: 550 }}>
              End Month {!currentlyStudying && <span style={{ color: "var(--error-color)" }}>*</span>}
            </label>
            <select
              id="endMonth"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              required={!currentlyStudying}
              disabled={currentlyStudying}
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
              placeholder="2026"
              disabled={currentlyStudying}
              required={!currentlyStudying}
            />
          </div>

          <div>
            <Input
              label="Grade / CGPA (Optional)"
              id="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="9.5"
            />
          </div>

          <div className={styles.fullWidth} style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "left", margin: "10px 0" }}>
            <input
              type="checkbox"
              id="currentlyStudying"
              checked={currentlyStudying}
              onChange={(e) => setCurrentlyStudying(e.target.checked)}
            />
            <label htmlFor="currentlyStudying" style={{ fontSize: "14px" }}>I am currently studying here</label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <Button type="submit" variant="secondary">
            <Plus size={16} style={{ marginRight: "4px" }} />
            {editingIndex >= 0 ? "Update Education" : "Add Education"}
          </Button>
        </div>
      </form>

      {/* List display */}
      <div className={styles.listContainer}>
        {educationList.map((edu, idx) => {
          const startMonthStr = edu.startMonth ? (edu.startMonth.length > 3 ? edu.startMonth.substring(0, 3) : edu.startMonth) : "Jan";
          const endMonthStr = edu.endMonth ? (edu.endMonth.length > 3 ? edu.endMonth.substring(0, 3) : edu.endMonth) : "Dec";
          const dateRange = `${startMonthStr} ${edu.startYear} – ${edu.currentlyStudying ? "Present" : `${endMonthStr} ${edu.endYear}`}`;

          return (
            <div key={idx} className={styles.listItem}>
              <div className={styles.listItemInfo}>
                <span className={styles.listItemTitle}>
                  {edu.degree} in {edu.branch} ({dateRange})
                </span>
                <span className={styles.listItemSubtitle}>{edu.institute}</span>
                {edu.cgpa && <span className={styles.listItemSubtitle}>CGPA: {edu.cgpa}/10</span>}
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => handleEdit(idx)} className={styles.iconBtn} aria-label="Edit Education">
                  <Edit size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(idx)} className={styles.iconBtn} aria-label="Delete Education">
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
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};

export default EducationStep;
