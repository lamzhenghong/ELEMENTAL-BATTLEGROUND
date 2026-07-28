import { X } from 'lucide-react';

interface MainMenuCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MainMenuCreditsModal({
  open,
  onClose,
}: MainMenuCreditsModalProps) {
  if (!open) return null;

  return (
    <div
      className="aether-preview-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="aether-preview-modal__frame"
        role="dialog"
        aria-modal="true"
        aria-labelledby="main-menu-credits-title"
      >
        <button
          type="button"
          className="aether-preview-modal__close"
          onClick={onClose}
          aria-label="Close project credits"
        >
          <X />
        </button>

        <span className="aether-preview-modal__eyebrow">PROJECT CREDITS</span>
        <h2 id="main-menu-credits-title">
          <span>ELEMENTAL</span>
          <span>BATTLEGROUND</span>
        </h2>

        <div className="aether-preview-credit-hero">
          <span>CREATED AND DIRECTED BY</span>
          <strong>lamzhenghong</strong>
          <p>Game creator, world designer, systems director, and project owner.</p>
        </div>

        <div className="aether-preview-credit-list">
          <div><span>PROJECT</span><strong>Elemental Battleground</strong></div>
          <div><span>STUDIO</span><strong>Aetheria Development</strong></div>
          <div><span>DESIGN DIRECTION</span><strong>lamzhenghong</strong></div>
          <div><span>BUILD</span><strong>Live Game Client</strong></div>
        </div>

        <p className="aether-preview-modal__note">
          The creator credit is intentionally treated as the visual focus of the project.
        </p>
      </section>
    </div>
  );
}
