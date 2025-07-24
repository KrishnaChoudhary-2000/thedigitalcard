
import { ExecutiveData } from '../types';

export const executiveData: ExecutiveData = {
  id: `card-${Date.now()}`,
  cardName: "Default Profile",
  name: "Atul Gupta",
  title: "Founder & CEO, Multisteer & Glydus",
  companyName: "Glydus",
  companyWebsite: "https://glydus.com/",
  profilePictureKey: undefined,
  phone: "+919876543210",
  email: "atul.gupta@multisteer.com",
  address: "Nagpur, Maharashtra, India",
  addressLink: "https://maps.google.com/?q=Nagpur,+Maharashtra,+India",
  calendlyLink: "https://calendly.com/your-link",
  socials: {
    linkedin: { url: "https://www.linkedin.com/in/atul-gupta-904bb7127/", enabled: true },
    instagram: { url: "https://www.instagram.com/atulgupta_1504?igsh=MXRrZ3l2NmVzdmZiag==", enabled: true },
    twitter: { url: "https://x.com/Glydus_IN", enabled: true },
    youtube: { url: "https://www.youtube.com/@Glydus", enabled: true },
    facebook: { url: "https://www.facebook.com/share/16bWt5DqJ6/", enabled: true },
    whatsapp: { url: "https://wa.me/919876543210", enabled: true },
  },
  styleOptions: {
    accentColor: '#00F0B5',
  },
  meetingButtonText: 'Book Meeting',
  saveContactButtonText: 'Save Contact',
  companyLogoKey: undefined,
  companyLogoPosition: { x: 50, y: 50 },
  companyLogoSize: 140,
  cardBackLogoKey: undefined,
  cardBackLogoSize: 160,
};