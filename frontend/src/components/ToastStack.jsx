export default function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={'toast toast--' + t.kind}>
          <span className="material-symbols-outlined">
            {t.kind === 'error' ? 'error' : t.kind === 'info' ? 'info' : 'check_circle'}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
