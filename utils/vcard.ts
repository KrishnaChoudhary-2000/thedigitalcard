
import { ExecutiveData } from '../types';

export const generateVCardString = (vcfData: ExecutiveData): string => {
  let vCard = `BEGIN:VCARD\nVERSION:3.0\n`;
  const nameParts = vcfData.name.split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');
  
  vCard += `N:${lastName};${firstName};;;\n`;
  vCard += `FN:${vcfData.name}\n`;
  vCard += `ORG:${vcfData.companyName}\n`;
  vCard += `TITLE:${vcfData.title}\n`;
  vCard += `TEL;TYPE=WORK,VOICE:${vcfData.phone}\n`;
  vCard += `EMAIL:${vcfData.email}\n`;
  vCard += `ADR;TYPE=WORK:;;${vcfData.address}\n`;
  if (vcfData.companyWebsite) vCard += `URL:${vcfData.companyWebsite}\n`;
  
  // NOTE: Photo embedding is removed as the client no longer stores the full image data.
  // In a production app, you might fetch the image and convert to base64 here if needed,
  // but that adds significant complexity to the contact saving process.

  if (vcfData.socials.linkedin.enabled && vcfData.socials.linkedin.url) vCard += `X-SOCIALPROFILE;type=linkedin:${vcfData.socials.linkedin.url}\n`;
  if (vcfData.socials.twitter.enabled && vcfData.socials.twitter.url) vCard += `X-SOCIALPROFILE;type=twitter:${vcfData.socials.twitter.url}\n`;
  if (vcfData.socials.instagram.enabled && vcfData.socials.instagram.url) vCard += `X-SOCIALPROFILE;type=instagram:${vcfData.socials.instagram.url}\n`;
  
  vCard += `END:VCARD`;
  return vCard;
};