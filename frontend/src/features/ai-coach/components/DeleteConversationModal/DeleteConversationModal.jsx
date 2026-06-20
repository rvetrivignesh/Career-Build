import React from "react";
import Modal from "@components/Modal";
import Button from "@components/Button";
import styles from "./DeleteConversationModal.module.css";

export const DeleteConversationModal = ({ isOpen, onClose, onConfirm, chatTitle }) => {
  const footer = (
    <div className={styles.footerActions}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Delete
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Chat" footer={footer}>
      <p className={styles.confirmText}>
        Are you sure you want to delete the conversation <strong>"{chatTitle}"</strong>?
      </p>
      <p className={styles.warningText}>
        This action will soft-delete the conversation and hide it from your history. This cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteConversationModal;
