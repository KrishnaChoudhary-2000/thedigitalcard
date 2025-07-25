
import React, { useState } from 'react';
import { ExecutiveData } from '../types';
import { CardPreview } from './CardPreview';
import { CardBack } from './CardBack';

const CDN_BASE_URL = 'https://fake-cdn.your-domain.com';

export const PublicCardPage: React.FC<{ data: ExecutiveData }> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const toggleFlip = () => setIsFlipped(prev => !prev);

  // Since this is a public page, we directly construct URLs from keys.
  // There are no live previews to manage.
  const displayPreviews = {
      profilePictureUrl: data.profilePictureKey ? `${CDN_BASE_URL}/${data.profilePictureKey}` : undefined,
      companyLogoUrl: data.companyLogoKey ? `${CDN_BASE_URL}/${data.companyLogoKey}` : undefined,
      cardBackLogoUrl: data.cardBackLogoKey ? `${CDN_BASE_URL}/${data.cardBackLogoKey}` : undefined,
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-brand-dark font-sans">
      <div className="relative perspective-container">
        <div
      <div className="relative perspective-container w-full max-w-[384px]">
        <div
          className="relative w-full card-3d"
          style={{
            transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
            aspectRatio: '384 / 720',
          }}
        >
          <div className="card-face card-front">
            <CardPreview data={data} onUpdate={() => {}} previews={displayPreviews}/>
          </div>
          <CardBack data={data} previews={displayPreviews} />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={toggleFlip}
          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-white/20"
        >
          {isFlipped ? 'Flip to Front' : 'Flip to Back'}
        </button>
      </div>
      <a href="https://vercel.com?utm_source=digital_card_creator" target="_blank" rel="noopener noreferrer" className="absolute bottom-5 text-gray-500 text-xs hover:text-white transition-colors">
          Hosted on ▲ Vercel
      </a>
    </div>
  );
};
