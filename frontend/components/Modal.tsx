import React, { forwardRef } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(function ModalComponent(
  { children, onClose },
  ref,
) {
  return <dialog ref={ref}>{children}</dialog>;
});

export default Modal;
