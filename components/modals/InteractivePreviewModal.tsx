import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { ExecutiveData } from '../../types';
import { CardPreview } from '../CardPreview';
import { CardBack } from '../CardBack';

interface InteractivePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ExecutiveData | null;
    onUpdate: (updates: Partial<ExecutiveData>) => void;
    previews: {
        profilePictureUrl?: string;
        companyLogoUrl?: string;
        cardBackLogoUrl?: string;
    };
}

export const InteractivePreviewModal: React.FC<InteractivePreviewModalProps> = ({ isOpen, onClose, data, onUpdate, previews }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [{ rotateX, rotateY, scale }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  useGesture({
    onDrag: ({ down, movement: [mx, my] }) => {
      api.start({
        rotateX: down ? -my / 20 : 0,
        rotateY: down ? mx / 20 : 0,
        scale: down ? 1.05 : 1,
      });
    },
    onHover: ({ hovering }) => !hovering && api.start({ rotateX: 0, rotateY: 0, scale: 1 }),
  }, {
    target: cardRef,
    eventOptions: { passive: false },
  });

  const toggleFlip = () => {
    setIsFlipped(prev => !prev);
  };
  
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setIsFlipped(false);
        api.start({ rotateX: 0, rotateY: 0, scale: 1, immediate: true });
      }, 300);
    }
  }, [isOpen, api]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex flex-col items-center justify-center font-sans overflow-hidden" 
        onClick={onClose}
    >
        <animated.div 
          ref={cardRef}
          className="relative perspective-container animate-fade-in-up"
          onClick={e => e.stopPropagation()}
          onDoubleClick={toggleFlip}
          style={{ scale }}
        >
          <div className="modal-glow"></div>
          <animated.div
            className="relative w-[384px] h-[720px] card-3d"
            style={{
              transform: 'rotateX(var(--rotateX)) rotateY(var(--rotateY))',
              // @ts-ignore
              '--rotateX': rotateX.to(val => `${val}deg`),
              '--rotateY': rotateY.to(val => `${val + (isFlipped ? 180 : 0)}deg`),
            }}
          >
            <div className="card-face card-front">
              <CardPreview data={data} onUpdate={onUpdate} previews={previews} />
            </div>
            <CardBack data={data} previews={previews} />
          </animated.div>
        </animated.div>
        <button onClick={onClose} className="absolute top-6 right-6 bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50">&times;</button>
        <div className="absolute bottom-6 flex flex-col items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-white/20"
            >
              {isFlipped ? 'Flip to Front' : 'Flip to Back'}
            </button>
            <div className="text-white/50 text-sm">
                Drag to rotate &nbsp;&bull;&nbsp; Double-click or use button to flip
            </div>
        </div>
    </div>
  );
};