import React, { useState, useRef } from "react";
import Button from "@components/Button";
import Input from "@components/Input";
import { UploadCloud, FileText, X } from "lucide-react";
import styles from "./UploadSection.module.css";

export const UploadSection = ({ onAnalyze, loading }) => {
  const [targetRole, setTargetRole] = useState("");
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedMimeTypes.includes(selectedFile.type) && fileExtension !== "docx" && fileExtension !== "pdf") {
      alert("Invalid format: Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File too large: Max file size allowed is 5 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRole = targetRole.trim();
    if (file && cleanRole) {
      onAnalyze(file, cleanRole);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ATS Resume Optimizer</h2>
      <p className={styles.subtitle}>
        Upload your resume PDF and enter your target job role. The optimizer will evaluate compatibility, keyword density, and provide actionable tips.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <Input
            id="analyzer-role-input"
            label="Target Job Role"
            placeholder="e.g. Senior React Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ""} ${file ? styles.dropzoneWithFile : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .docx"
            onChange={handleFileChange}
            className={styles.hiddenInput}
            disabled={loading}
          />

          {!file ? (
            <div className={styles.dropzoneContent}>
              <UploadCloud size={48} className={styles.uploadIcon} />
              <p className={styles.uploadText}>
                <strong>Drag & drop your resume</strong> or <span className={styles.browseLink}>browse</span>
              </p>
              <p className={styles.fileHint}>Supports PDF and DOCX files up to 5 MB</p>
            </div>
          ) : (
            <div className={styles.fileDisplay} onClick={(e) => e.stopPropagation()}>
              <FileText size={40} className={styles.fileIcon} />
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className={styles.removeFileBtn}
                disabled={loading}
                aria-label="Remove uploaded file"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className={styles.submitBtn}
          disabled={loading || !file || !targetRole.trim()}
          loading={loading}
        >
          Analyze Compatibility
        </Button>
      </form>
    </div>
  );
};

export default UploadSection;
