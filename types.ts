
export interface SocialLink {
  url: string;
  enabled: boolean;
}

export interface Socials {
  linkedin: SocialLink;
  instagram: SocialLink;
  twitter: SocialLink;
  youtube: SocialLink;
  facebook: SocialLink;
  whatsapp: SocialLink;
}

export interface StyleOptions {
  accentColor: string;
}

export interface ExecutiveData {
  id: string;
  cardName: string;
  name: string;
  title: string;
  companyName: string;
  companyWebsite: string;
  phone: string;
  email: string;
  address: string;
  addressLink: string;
  calendlyLink: string;
  socials: Socials;
  profilePictureKey?: string;
  companyLogoKey?: string;
  companyLogoPosition: { x: number, y: number };
  companyLogoSize: number;
  cardBackLogoKey?: string;
  cardBackLogoSize: number;
  styleOptions: StyleOptions;
  meetingButtonText: string;
  saveContactButtonText: string;
}