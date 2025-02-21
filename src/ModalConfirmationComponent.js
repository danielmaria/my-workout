import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalConfirmationComponent = () => {
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  const handleShowConfirmationModal = (title, description) => {
    return new Promise((resolve) => {
      setModalConfig({ show: true, title, description, onConfirm: resolve });
    });
  };

  const handleCloseConfirmationModal = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm();
    }
    setModalConfig({
      show: false,
      title: '',
      description: '',
      onConfirm: null,
    });
  };

  return {
    ModalUI: (
      <Modal
        show={modalConfig.show}
        onHide={handleCloseConfirmationModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalConfig.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalConfig.description}</Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={handleCloseConfirmationModal}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    ),
    handleShowConfirmationModal: handleShowConfirmationModal,
  };
};

export default ModalConfirmationComponent;
