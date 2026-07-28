import { X } from 'lucide-react';

interface MainMenuLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MainMenuLeaveModal({
  open,
  onClose,
  onConfirm,
}: MainMenuLeaveModalProps) {
  if (!open) return null;

  return (
    <div
      className="aether-preview-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="aether-preview-modal__frame aether-preview-modal__frame--leave"
        role="dialog"
        aria-modal="true"
        aria-labelledby="main-menu-leave-title"
      >
        <button
          type="button"
          className="aether-preview-modal__close"
          onClick={onClose}
          aria-label="Close leave game confirmation"
        >
          <X />
        </button>

        <span className="aether-preview-modal__eyebrow">SESSION CONTROL</span>
        <h2 id="main-menu-leave-title">
          <span>LEAVE</span>
          <span>GAME?</span>
        </h2>
        <p className="aether-preview-modal__description">
          Your progress is saved. You can reconnect to Aetheria from this device at any time.
        </p>
        <button
          type="button"
          className="aether-preview-modal__danger"
          onClick={onConfirm}
        >
          LEAVE GAME
        </button>
      </section>
    </div>
  );
}
