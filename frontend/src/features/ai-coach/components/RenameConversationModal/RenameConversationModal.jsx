import React, { useState, useEffect } from "react";
import Modal from "@components/Modal";
import Button from "@components/Button";
import Input from "@components/Input";
import styles from "./RenameConversationModal.module.css";

export const RenameConversationModal = ({ isOpen, onClose, onConfirm, initialTitle }) => {
  const [newTitle, setNewTitle] = useState(initialTitle || "");

  useEffect(() => {
    if (isOpen) {
      setNewTitle(initialTitle || "");
    }
  }, [isOpen, initialTitle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onConfirm(newTitle.trim());
    }
  };

  const footer = (
    <div className={styles.footerActions}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} disabled={!newTitle.trim()}>
        Save
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Chat" footer={footer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          id="rename-chat-input"
          label="Conversation Title"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new conversation title"
          autoFocus
          required
        />
      </form>
    </Modal>
  );
};

export default RenameConversationModal;
;
