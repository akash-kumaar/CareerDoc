// Toast notification component

import { useEffect } from 'react';

export default function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>{message}</div>
    </div>
  );
}
