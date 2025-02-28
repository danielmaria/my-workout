import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalConfirmationComponent = () => {
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: '',
    description: '',
    onConfirm: null,
    onCancel: null,
  });

  const handleShowConfirmationModal = (title, description) => {
    return new Promise((resolve, reject) => {
      setModalConfig({
        show: true,
        title,
        description,
        onConfirm: resolve,
        onCancel: reject,
      });
    });
  };

  const handleCloseConfirmationModal = () => {
    if (modalConfig.onCancel) {
      modalConfig.onCancel();
    }
    setModalConfig({
      show: false,
      title: '',
      description: '',
      onConfirm: null,
      onCancel: null,
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
          <Button variant='secondary' onClick={handleCloseConfirmationModal}>
            Cancel
          </Button>
          <Button variant='primary' onClick={modalConfig.onConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    ),
    handleShowConfirmationModal: handleShowConfirmationModal,
  };
};

export default ModalConfirmationComponent;
