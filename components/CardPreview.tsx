
import React from 'react';
import { ExecutiveData } from '../types';
import { generateVCardString } from '../utils/vcard';
import { 
    GlydusLogo, 
    SaveContactIcon, 
    PhoneIcon, 
    EmailIcon, 
    LocationIcon, 
    FacebookIcon, 
    LinkedInIcon, 
    InstagramIcon, 
    WhatsAppIcon, 
    XIcon, 
    YouTubeIcon, 
    CalendarIcon, 
    ChevronRightIcon
} from './Icons';

// In a real app, this would come from an environment variable
const CDN_BASE_URL = 'https://fake-cdn.your-domain.com';

interface CardPreviewProps {
  data: ExecutiveData | null;
  onUpdate?: (updates: Partial<ExecutiveData>) => void;
  previews?: {
    profilePictureUrl?: string;
    companyLogoUrl?: string;
  };
}

export const CardPreview: React.FC<CardPreviewProps> = ({ data, onUpdate = () => {}, previews = {} }) => {
  if (!data) {
    return (
      <div className="bg-brand-card rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm mx-auto flex items-center justify-center font-sans text-gray-400 h-full">
        No card selected. Please select or create a card to see the preview.
      </div>
    );
  }
  
  const { name, title, companyWebsite, socials, styleOptions, profilePictureKey, companyLogoKey } = data;

  const profilePictureUrl = previews.profilePictureUrl || (profilePictureKey ? `${CDN_BASE_URL}/${profilePictureKey}` : undefined);
  const companyLogoUrl = previews.companyLogoUrl || (companyLogoKey ? `${CDN_BASE_URL}/${companyLogoKey}` : undefined);

  const formattedPhone = data.phone.startsWith('+91')
    ? data.phone.replace(/^\+(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3')
    : data.phone;

  const buttonStyle = { '--accent-color': styleOptions.accentColor } as React.CSSProperties;
  const actionButtonClasses = "flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-card focus:ring-[--accent-color]";


  const showSocialsSection = Object.values(socials).some(link => link.enabled && link.url);
  
  const handleSaveContact = () => {
    if (!data) return;
    const vCardString = generateVCardString(data);
    const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name.replace(/ /g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ContactRow = ({ href, icon, text, ariaLabel }: { href?: string; icon: React.ReactNode; text: string; ariaLabel: string }) => {
    const content = (
        <div className="flex items-center space-x-4 group p-3">
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-grow min-w-0 text-gray-200 break-words font-medium">
                {text}
            </div>
        </div>
    );
    
    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className="block rounded-lg transition-colors">{content}</a>;
    }
    return <div aria-label={ariaLabel} className="rounded-lg">{content}</div>;
  };
  
  return (
    <div className="relative bg-brand-card bg-gradient-to-b from-brand-card to-black rounded-3xl shadow-2xl w-full max-w-sm mx-auto transition-all duration-500 font-sans overflow-hidden flex flex-col h-full" style={buttonStyle}>
      <div className="flex-grow overflow-y-auto">
        <header 
            className="relative h-24"
        >
          <a
            href={companyWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute transition-transform duration-300 hover:scale-105"
            style={{
              left: `${data.companyLogoPosition.x}%`,
              top: `${data.companyLogoPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${data.companyLogoSize}px`,
            }}
          >
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt={`${data.companyName} logo`} className="max-h-[80px] w-full object-contain pointer-events-none" />
            ) : (
              <div className="pointer-events-none"><GlydusLogo /></div>
            )}
          </a>
        </header>
        
        <div className="relative p-6 md:p-8 pt-0 -mt-10">
          <div className="relative z-10">
              {profilePictureUrl && (
                  <div className="flex justify-center mb-6">
                      <img 
                      src={profilePictureUrl} 
                      alt={`Profile of ${name}`} 
                      className="w-36 h-36 rounded-full object-cover shadow-2xl ring-4 ring-white/10"
                      />
                  </div>
              )}

              <section className={`text-center mb-6 ${!profilePictureUrl ? 'pt-8' : ''}`}>
                  <h1 className="text-4xl font-bold text-white tracking-tight">{name}</h1>
                  <p className="text-sm mt-3 font-medium text-gray-400 tracking-widest uppercase">{title}</p>
              </section>
          </div>


          <div className="flex flex-col gap-3 mb-8">
              <a href={data.calendlyLink} target="_blank" rel="noopener noreferrer" className={actionButtonClasses}>
                  <div className="flex items-center gap-4">
                      <CalendarIcon className="w-6 h-6" style={{color: styleOptions.accentColor}} />
                      <span className="font-semibold text-white">{data.meetingButtonText}</span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </a>
              <button onClick={handleSaveContact} className={actionButtonClasses}>
                  <div className="flex items-center gap-4">
                      <SaveContactIcon className="w-6 h-6" style={{color: styleOptions.accentColor}} />
                      <span className="font-semibold text-white">{data.saveContactButtonText}</span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-500" />
              </button>
          </div>

          <section className="rounded-xl overflow-hidden">
              <ContactRow 
              href={`tel:${data.phone}`}
              icon={<PhoneIcon className="w-5 h-5" style={{color: styleOptions.accentColor}} />}
              text={formattedPhone}
              ariaLabel={`Call ${name}`}
              />
              <div className="h-px bg-white/10"></div>
              <ContactRow 
              href={`mailto:${data.email}`}
              icon={<EmailIcon className="w-5 h-5" style={{color: styleOptions.accentColor}} />}
              text={data.email}
              ariaLabel={`Email ${name}`}
              />
              <div className="h-px bg-white/10"></div>
              <ContactRow 
              href={data.addressLink}
              icon={<LocationIcon className="w-5 h-5" style={{color: styleOptions.accentColor}} />}
              text={data.address}
              ariaLabel={`Location: ${data.address}`}
              />
          </section>

          {showSocialsSection && (
              <>
              <div className="my-6 pb-2"></div>
              
              <section className="flex justify-center items-center flex-wrap gap-x-6 gap-y-4">
                  {socials.linkedin.enabled && socials.linkedin.url && <a href={socials.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s LinkedIn Profile`} className="text-[#0077B5] transition-opacity duration-300 hover:opacity-75"> <LinkedInIcon className="w-8 h-8" /> </a>}
                  {socials.instagram.enabled && socials.instagram.url && <a href={socials.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s Instagram Profile`} className="text-[#E1306C] transition-opacity duration-300 hover:opacity-75"> <InstagramIcon className="w-8 h-8" /> </a>}
                  {socials.whatsapp.enabled && socials.whatsapp.url && <a href={socials.whatsapp.url} target="_blank" rel="noopener noreferrer" aria-label={`Contact ${name} on WhatsApp`} className="text-[#25D366] transition-opacity duration-300 hover:opacity-75"> <WhatsAppIcon className="w-8 h-8" /> </a>}
                  {socials.facebook.enabled && socials.facebook.url && <a href={socials.facebook.url} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s Facebook Profile`} className="text-[#1877F2] transition-opacity duration-300 hover:opacity-75"> <FacebookIcon className="w-8 h-8" /> </a>}
                  {socials.twitter.enabled && socials.twitter.url && <a href={socials.twitter.url} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s X Profile`} className="text-white transition-opacity duration-300 hover:opacity-75"> <XIcon className="w-7 h-7" /> </a>}
                  {socials.youtube.enabled && socials.youtube.url && <a href={socials.youtube.url} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s YouTube Channel`} className="text-[#FF0000] transition-opacity duration-300 hover:opacity-75"> <YouTubeIcon className="w-8 h-8" /> </a>}
              </section>
              </>
          )}
        </div>
      </div>
      <footer className="p-4 pt-2 text-center text-xs font-semibold text-gray-500 tracking-widest uppercase shrink-0">
        STEER THE WAVES
      </footer>
    </div>
  );
};