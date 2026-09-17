import { useState } from 'react';
import type {
  ConfirmDialogState,
  ResultDialogState,
} from '../types';

export function useDialogs() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
  });

  const [resultDialog, setResultDialog] = useState<ResultDialogState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showSuccess = (title: string, message: string) =>
    setResultDialog({ isOpen: true, type: 'success', title, message });

  const showError = (title: string, message: string) =>
    setResultDialog({ isOpen: true, type: 'error', title, message });

  const closeResult = () =>
    setResultDialog(prev => ({ ...prev, isOpen: false }));

  return {
    confirmDialog,
    setConfirmDialog,
    resultDialog,
    setResultDialog,
    showSuccess,
    showError,
    closeResult,
  };
}
