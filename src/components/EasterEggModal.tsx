import { useState, useEffect, lazy, Suspense } from 'react';

const HoloCard = lazy(() => import('./HoloCard'));

export default function EasterEggModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const sequence = ['r', 'e', 'n', 'd', 'e', 'r', '7', '2'];
    let currentIndex = 0;
    let timer: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key.toLowerCase() === sequence[currentIndex]) {
        currentIndex++;
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          currentIndex = 0;
        }, 2000);

        if (currentIndex === sequence.length) {
          currentIndex = 0;
          setIsOpen(true);
        }
      } else {
        currentIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Render72 Easter Egg Discovered"
    >
      <div className="easter-egg-card-container" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close easter egg"
        >
          ✕
        </button>

        <div className="easter-egg-header">
          <span className="easter-egg-tag">EASTER EGG UNLOCKED</span>
          <h3 className="shiny-text">Render72 Secret Ticket</h3>
          <p>
            You typed the secret code: <code>render72</code>
          </p>
        </div>

        {/* WebGL2 HoloCard Component - Tuned for maximum text clarity & gold foil border */}
        <div className="easter-egg-holo-wrapper">
          <Suspense
            fallback={
              <div
                className="holo-card"
                style={{
                  width: 320,
                  aspectRatio: '63/88',
                  borderRadius: 18,
                  background: 'rgba(18, 24, 41, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="spinner" role="status" aria-label="Loading holographic card" />
              </div>
            }
          >
            <HoloCard
              image="/ticket-front.svg"
              backImage="/ticket-back.svg"
              alt="Render72 Participant Secret Ticket"
              preset="gold"
              foilColor="#e8c872"
              intensity={0.46}
              glare={0.3}
              edgeSparkle={0.85}
              scale={1.2}
              frame={3.5}
              width={320}
              radius={18}
              tiltMax={14}
              hoverScale={1.04}
              idle={true}
              shadow={true}
            />
          </Suspense>
        </div>

        <div className="easter-egg-instructions">
          <span>Click card to flip 3D · Hover to view holographic shimmer</span>
        </div>

        <div className="easter-egg-footer">
          <p>Secret audition pass unlocked · Discovered on the Render72 portal</p>
        </div>
      </div>
    </div>
  );
}
