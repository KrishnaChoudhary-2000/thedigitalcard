
import React from 'react';
import { ExecutiveData } from '../types';

// In a real app, this would come from an environment variable
const CDN_BASE_URL = 'https://fake-cdn.your-domain.com';

interface CardBackProps {
    data: ExecutiveData | null;
    previews?: {
        cardBackLogoUrl?: string;
    };
}

export const CardBack: React.FC<CardBackProps> = ({ data, previews = {} }) => {
  if (!data) return null;

  const cardBackLogoUrl = previews.cardBackLogoUrl || (data.cardBackLogoKey ? `${CDN_BASE_URL}/${data.cardBackLogoKey}` : undefined);

  return (
    <div className="w-full h-full card-face card-back flex flex-col items-center justify-center p-8 text-center text-white font-sans bg-brand-card bg-gradient-to-b from-brand-card to-black">
      <div className="flex-grow flex flex-col items-center justify-center">
        {cardBackLogoUrl ? (
          <img 
            src={cardBackLogoUrl} 
            alt="Custom Card Back Logo" 
            className="object-contain"
            style={{ width: `${data.cardBackLogoSize}px`, height: `${data.cardBackLogoSize}px` }}
          />
        ) : null}
      </div>
      <div className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
        STEER THE WAVES
      </div>
    </div>
  );
};