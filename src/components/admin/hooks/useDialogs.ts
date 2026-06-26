import { useState } from 'react';
import type {
  ConfirmDialogState,
  ResultDialogState,
  BotContinueDialogState,
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

  const [botContinueDialog, setBotContinueDialog] = useState<BotContinueDialogState>({
    isOpen: false,
    nextOffset: 0,
    url: '',
    summary: '',
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
    botContinueDialog,
    setBotContinueDialog,
    showSuccess,
    showError,
    closeResult,
  };
}
