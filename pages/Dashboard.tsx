import React, { useState, useRef, useEffect } from 'react';
import { ExecutiveData } from '../types';
import { api } from '../api';
import { executiveData as defaultCardSchema } from '../data/defaultCard';
import { FormSection } from '../components/FormSection';
import { InputField } from '../components/InputField';
import { CardPreview } from '../components/CardPreview';
import { CardBack } from '../components/CardBack';
import { CreateCardModal } from '../components/modals/CreateCardModal';
import { ConfirmDeleteModal } from '../components/modals/ConfirmDeleteModal';
import { InteractivePreviewModal } from '../components/modals/InteractivePreviewModal';
import { ShareModal } from '../components/modals/ShareModal';
import { QRCodeModal } from '../components/modals/QRCodeModal';
import { Toast } from '../components/Toast';
import { PublicCardPage } from '../components/PublicCardPage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PlusIcon, TrashIcon, ShareIcon, EyeIcon, PlayIcon, PencilIcon, GlydusLogo, LogoutIcon, NfcIcon, QRCodeIcon } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const [savedCards, setSavedCards] = useState<ExecutiveData[]>([]);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [cardData, setCardData] = useState<ExecutiveData | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    
    // State for temporary, local image previews
    const [profilePicPreview, setProfilePicPreview] = useState<string | undefined>();
    const [cardBackLogoPreview, setCardBackLogoPreview] = useState<string | undefined>();
    const [companyLogoPreview, setCompanyLogoPreview] = useState<string | undefined>();
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [shareableUrl, setShareableUrl] = useState('');
    const [isTestingPublicView, setIsTestingPublicView] = useState(false);
    const [isEditorPreviewFlipped, setIsEditorPreviewFlipped] = useState(false);
    const [isWritingNFC, setIsWritingNFC] = useState(false);

    const draggedItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);

    useEffect(() => {
        const loadInitialCards = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const cardsFromApi = await api.getCards();
                setSavedCards(cardsFromApi);
                if (cardsFromApi.length > 0) {
                    setActiveCardId(cardsFromApi[0].id);
                } else {
                    setCardData(null);
                }
            } catch (error) {
                console.error("Failed to load cards from API", error);
                setApiError("Could not load your cards. Please refresh the page.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialCards();
    }, []);

    useEffect(() => {
        const activeCard = savedCards.find(card => card.id === activeCardId);
        setCardData(activeCard || null);
        // Clear old previews when card changes
        setProfilePicPreview(undefined);
        setCardBackLogoPreview(undefined);
        setCompanyLogoPreview(undefined);
    }, [activeCardId, savedCards]);

    useEffect(() => {
      // Clean up blob URLs to prevent memory leaks
      return () => {
        if (profilePicPreview) URL.revokeObjectURL(profilePicPreview);
        if (cardBackLogoPreview) URL.revokeObjectURL(cardBackLogoPreview);
        if (companyLogoPreview) URL.revokeObjectURL(companyLogoPreview);
      };
    }, [profilePicPreview, cardBackLogoPreview, companyLogoPreview]);
    
    const handleCardDataChange = (updates: Partial<ExecutiveData>) => {
      setCardData(prev => (prev ? { ...prev, ...updates } : null));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const keys = name.split('.');
      
      setCardData(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev));
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newState;
      });
    };
    
    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      const keys = name.split('.');

      setCardData(prev => {
          if (!prev) return null;
          const newState = JSON.parse(JSON.stringify(prev));
          
          if (keys.length > 1) {
              let current = newState;
              for (let i = 0; i < keys.length - 1; i++) {
                  if (!current[keys[i]]) current[keys[i]] = {};
                  current = current[keys[i]];
              }
              current[keys[keys.length - 1]] = checked;
          } else {
              (newState as any)[name] = checked;
          }
          return newState;
      });
    };
    
    const handleImageChange = async (
        file: File,
        previewSetter: React.Dispatch<React.SetStateAction<string | undefined>>,
        keyField: keyof ExecutiveData
    ) => {
        // Create a temporary local URL for instant preview
        const localPreviewUrl = URL.createObjectURL(file);
        previewSetter(localPreviewUrl);

        try {
            // Step 1: Get a signed URL from the (simulated) backend
            const { uploadUrl, key } = await api.getSignedUploadUrl(file.name);
            
            // Step 2: Upload the file directly to the signed URL
            await api.uploadFile(uploadUrl, file);
            
            // Step 3: Update card data with the new file key
            setCardData(prev => (prev ? { ...prev, [keyField]: key } : null));
            setToast({ show: true, message: `${keyField} uploaded!`, type: 'success' });
        } catch (error) {
            console.error(`Failed to upload ${keyField}:`, error);
            setToast({ show: true, message: 'Image upload failed.', type: 'error' });
            // If upload fails, remove the temporary preview
            previewSetter(undefined);
            URL.revokeObjectURL(localPreviewUrl);
        }
    };

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageChange(e.target.files[0], setProfilePicPreview, 'profilePictureKey');
        }
    };

    const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageChange(e.target.files[0], setCompanyLogoPreview, 'companyLogoKey');
        }
    };
    
    const handleCardBackLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageChange(e.target.files[0], setCardBackLogoPreview, 'cardBackLogoKey');
        }
    };

    const handleRemoveImage = (
        previewSetter: React.Dispatch<React.SetStateAction<string | undefined>>,
        keyField: keyof ExecutiveData
    ) => {
        previewSetter(undefined);
        setCardData(prev => (prev ? { ...prev, [keyField]: undefined } : null));
    };
    
    const handleSaveChanges = async () => {
      if (!cardData || !activeCardId) return;
      setIsSaving(true);
      try {
          await api.updateCard(activeCardId, cardData);
          setSavedCards(prev => prev.map(card => card.id === activeCardId ? cardData : card));
          setToast({ show: true, message: 'Changes saved!', type: 'success' });
      } catch (error) {
          console.error("Failed to save changes:", error);
          setToast({ show: true, message: 'Error saving changes.', type: 'error' });
      } finally {
          setIsSaving(false);
      }
    };
    
    const handleResetChanges = () => {
      const activeCard = savedCards.find(card => card.id === activeCardId);
      setCardData(activeCard || null);
      setProfilePicPreview(undefined);
      setCardBackLogoPreview(undefined);
      setCompanyLogoPreview(undefined);
    };
    
    const handleCreateCard = async (newCardName: string) => {
      const newCard: ExecutiveData = {
        ...defaultCardSchema,
        id: `card-${Date.now()}`,
        cardName: newCardName,
        name: 'New Profile',
        title: 'New Title',
      };
      try {
          const createdCard = await api.createCard(newCard);
          setSavedCards(prev => [...prev, createdCard]);
          setActiveCardId(createdCard.id);
          setIsCreateModalOpen(false);
          setToast({show: true, message: "Card created!", type: 'success'});
      } catch (error) {
          console.error("Failed to create card:", error);
          setToast({ show: true, message: 'Error creating card.', type: 'error' });
      }
    };

    const handleDeleteCard = (idToDelete: string) => {
      setCardToDelete(idToDelete);
    };
    
    const confirmDeleteCard = async () => {
      if (!cardToDelete) return;
      
      try {
          await api.deleteCard(cardToDelete);
          const remainingCards = savedCards.filter(card => card.id !== cardToDelete);
          setSavedCards(remainingCards);

          if (activeCardId === cardToDelete) {
              setActiveCardId(remainingCards.length > 0 ? remainingCards[0].id : null);
          }
          setCardToDelete(null);
          setToast({ show: true, message: 'Card deleted.', type: 'success' });
      } catch (error) {
          console.error("Failed to delete card:", error);
          setToast({ show: true, message: 'Error deleting card.', type: 'error' });
      } finally {
          setCardToDelete(null);
      }
    };

    const handleShareCard = async () => {
      if (!cardData) return;
      try {
          const { slug } = await api.shareCard(cardData.id);
          const url = `${window.location.origin}/c/${slug}`;
          setShareableUrl(url);
          setIsShareModalOpen(true);
      } catch (e) {
          console.error("Failed to create shareable link:", e);
          setToast({ show: true, message: 'Could not create link.', type: 'error' });
      }
    };
    
    const handleShowQrCode = async () => {
        if (!cardData) return;
        try {
            const { slug } = await api.shareCard(cardData.id);
            const url = `${window.location.origin}/c/${slug}`;
            setShareableUrl(url);
            setIsQrModalOpen(true);
        } catch (e) {
            console.error("Failed to create shareable link for QR Code:", e);
            setToast({ show: true, message: 'Could not create link for QR Code.', type: 'error' });
        }
    };

    const handleWriteNFC = async () => {
        if (!cardData) {
            setToast({ show: true, message: 'Please select a card first.', type: 'error' });
            return;
        }

        if (!('NDEFReader' in window)) {
            setToast({ show: true, message: 'Web NFC is not supported on this device/browser.', type: 'error' });
            return;
        }

        setIsWritingNFC(true);
        setToast({ show: true, message: 'Tap an NFC tag to write...', type: 'success' });

        try {
            const { slug } = await api.shareCard(cardData.id);
            const urlToWrite = `${window.location.origin}/c/${slug}`;

            const ndef = new (window as any).NDEFReader();
            await ndef.write({
                records: [{ recordType: "url", data: urlToWrite }]
            });
            setToast({ show: true, message: 'NFC tag written successfully!', type: 'success' });
        } catch (error) {
            console.error('NFC Write Error:', error);
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    setToast({ show: true, message: 'NFC permission was denied.', type: 'error' });
                } else {
                     setToast({ show: true, message: 'Failed to write to NFC tag.', type: 'error' });
                }
            } else {
                setToast({ show: true, message: 'An unknown error occurred.', type: 'error' });
            }
        } finally {
            setIsWritingNFC(false);
        }
    };

    const handleDragSort = () => {
      if (draggedItem.current === null || dragOverItem.current === null) return;
      if (draggedItem.current === dragOverItem.current) return;

      let reorderedCards: ExecutiveData[] = [];
      setSavedCards(prev => {
          const cards = [...prev];
          const draggedItemIndex = cards.findIndex(c => c.id === draggedItem.current);
          const dragOverItemIndex = cards.findIndex(c => c.id === dragOverItem.current);
          
          const [reorderedItem] = cards.splice(draggedItemIndex, 1);
          cards.splice(dragOverItemIndex, 0, reorderedItem);
          reorderedCards = cards;
          return cards;
      });

      const orderedIds = reorderedCards.map(c => c.id);
      api.updateOrder(orderedIds).catch(err => {
          console.error("Failed to update card order:", err);
          setToast({ show: true, message: 'Could not save new order.', type: 'error' });
      });

      draggedItem.current = null;
      dragOverItem.current = null;
    };
    
    if (isTestingPublicView && cardData) {
        return (
          <div className="relative min-h-screen">
            <PublicCardPage data={cardData} />
            <button
              onClick={() => setIsTestingPublicView(false)}
              className="fixed top-4 right-4 bg-gray-900/80 backdrop-blur-lg border border-white/10 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition shadow-lg z-[101] flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              Return to Editor
            </button>
          </div>
        );
      }

    const editorDisabled = !cardData || isLoading;
    const cardToDeleteDetails = savedCards.find(c => c.id === cardToDelete);
    const currentAccentColor = cardData?.styleOptions?.accentColor || '#000000';
    
    // This object contains temporary local preview URLs for instant feedback.
    const livePreviews = {
        profilePictureUrl: profilePicPreview,
        companyLogoUrl: companyLogoPreview,
        cardBackLogoUrl: cardBackLogoPreview,
    };

    return (
        <div className="min-h-screen font-sans text-white bg-brand-dark">
            <header className="bg-gray-900/80 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-20">
                <h1 className="text-xl font-bold">Glydus Card Dashboard</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleShareCard} disabled={editorDisabled} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 lg:px-2 rounded-lg transition disabled:opacity-50" title="Copy Shareable Link">
                        <ShareIcon className="w-5 h-5" />
                        <span className="hidden sm:inline lg:hidden">Share</span>
                    </button>
                    <button onClick={handleShowQrCode} disabled={editorDisabled} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 lg:px-2 rounded-lg transition disabled:opacity-50" title="Show QR Code">
                        <QRCodeIcon className="w-5 h-5" />
                        <span className="hidden sm:inline lg:hidden">QR</span>
                    </button>
                    <button onClick={handleWriteNFC} disabled={editorDisabled || isWritingNFC} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 lg:px-2 rounded-lg transition disabled:opacity-50" title="Write to NFC Tag">
                        {isWritingNFC ? <LoadingSpinner className="w-5 h-5" /> : <NfcIcon className="w-5 h-5" />}
                        <span className="hidden sm:inline lg:hidden">NFC</span>
                    </button>
                    <button onClick={() => setIsPreviewModalOpen(true)} disabled={editorDisabled} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 lg:px-2 rounded-lg transition disabled:opacity-50" title="Interactive Preview">
                      <EyeIcon className="w-5 h-5" />
                      <span className="hidden sm:inline lg:hidden">Preview</span>
                    </button>
                    <button onClick={() => setIsTestingPublicView(true)} disabled={editorDisabled} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 lg:px-2 rounded-lg transition disabled:opacity-50" title="Test Live View">
                        <PlayIcon className="w-5 h-5" />
                        <span className="hidden sm:inline lg:hidden">Test</span>
                    </button>
                    <button onClick={handleSaveChanges} disabled={editorDisabled || isSaving} className="bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                      {isSaving ? <LoadingSpinner className="h-5 w-5 mx-auto" /> : 'Save Changes'}
                    </button>
                    <button onClick={handleResetChanges} disabled={editorDisabled} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50">Reset</button>
                    <button onClick={logout} className="bg-red-600/80 hover:bg-red-700/80 text-white font-semibold p-2 rounded-lg transition" title="Logout">
                      <LogoutIcon className="h-5 w-5" />
                    </button>
                </div>
            </header>
            
            <div className="flex">
                <aside className="w-64 bg-gray-900/50 border-r border-white/10 p-4 flex flex-col" style={{height: 'calc(100vh - 69px)'}}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Saved Cards</h2>
                    <button onClick={() => setIsCreateModalOpen(true)} title="Create New Card" className="p-2 rounded-md hover:bg-brand-accent/50 transition-colors disabled:opacity-50" disabled={isLoading}>
                      <PlusIcon className="w-5 h-5"/>
                    </button>
                  </div>
                  <ul className="space-y-1 overflow-y-auto">
                    {savedCards.map(card => (
                      <li key={card.id} draggable onDragStart={() => draggedItem.current = card.id} onDragEnter={() => dragOverItem.current = card.id} onDragEnd={handleDragSort} onDragOver={(e) => e.preventDefault()} className={`group rounded-md transition-all duration-150 ease-in-out cursor-grab active:cursor-grabbing ${draggedItem.current === card.id ? 'opacity-50 scale-105 shadow-lg' : ''} ${activeCardId === card.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                          <div className={`flex items-center justify-between p-2 rounded-md transition-colors border-l-4 ${activeCardId === card.id ? 'border-brand-accent' : 'border-transparent'}`}>
                            <span onClick={() => setActiveCardId(card.id)} className="truncate flex-1 pr-2 cursor-pointer">{card.cardName}</span>
                            <button onClick={() => handleDeleteCard(card.id)} title={`Delete ${card.cardName}`} className="p-1 rounded-full text-gray-500 hover:bg-red-500/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                      </li>
                    ))}
                     {savedCards.length === 0 && !isLoading && <p className="text-gray-500 text-sm text-center py-4">No cards yet. Create one!</p>}
                  </ul>
                </aside>
                
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center" style={{height: 'calc(100vh - 69px)'}}><LoadingSpinner className="w-12 h-12"/></div>
                ) : apiError ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-center" style={{height: 'calc(100vh - 69px)'}}>
                        <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-6 max-w-md">
                            <h3 className="text-2xl font-bold mb-3">An Error Occurred</h3>
                            <p>{apiError}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <main className="flex-1 lg:w-1/2 p-6 space-y-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 69px)'}}>
                          <FormSection title="Profile">
                            <InputField label="Card Name" name="cardName" value={cardData?.cardName || ''} onChange={handleInputChange} disabled={editorDisabled} />
                            <InputField label="Full Name" name="name" value={cardData?.name || ''} onChange={handleInputChange} disabled={editorDisabled} />
                            <InputField label="Designation/Title" name="title" value={cardData?.title || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            <InputField label="Company Name" name="companyName" value={cardData?.companyName || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            <InputField label="Company Website" name="companyWebsite" value={cardData?.companyWebsite || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            
                            <div className="flex items-center gap-4">
                              {companyLogoPreview ? (
                                <img src={companyLogoPreview} alt="Company Logo Preview" className="h-16 object-contain shadow-md bg-gray-700 p-1 rounded-md" style={{maxHeight: '64px', maxWidth: '128px'}} />
                              ) : cardData?.companyLogoKey ? (
                                <div className="h-16 w-16 flex items-center justify-center bg-gray-700 p-1 rounded-md text-xs text-gray-400">CDN</div>
                              ) : (
                                <div className="h-16 w-16 flex items-center justify-center bg-gray-700 p-1 rounded-md [&_span]:hidden"><GlydusLogo /></div>
                              )}
                              <div className="flex-grow">
                                <label className={`block text-sm font-medium text-gray-300 mb-1 ${editorDisabled ? 'opacity-50' : ''}`}>Company Logo</label>
                                <input type="file" accept="image/*" onChange={handleCompanyLogoChange} disabled={editorDisabled} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/80 file:text-white hover:file:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed" />
                              </div>
                              {(companyLogoPreview || cardData?.companyLogoKey) && (
                                <button onClick={() => handleRemoveImage(setCompanyLogoPreview, 'companyLogoKey')} className="p-2 rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors" title="Remove custom logo"><TrashIcon className="w-5 h-5" /></button>
                              )}
                            </div>

                             <div className="pt-4 space-y-4 border-t border-white/10 mt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-300">Logo Size</label>
                                        <span className="text-sm text-gray-400">{cardData?.companyLogoSize || 0}px</span>
                                    </div>
                                    <input type="range" min="30" max="250" name="companyLogoSize" value={cardData?.companyLogoSize || 140} onChange={e => handleCardDataChange({ companyLogoSize: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-brand-accent [&::-moz-range-thumb]:bg-brand-accent" disabled={editorDisabled}/>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/10 mt-4">
                              {profilePicPreview ? (
                                <img src={profilePicPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover shadow-md" />
                              ) : cardData?.profilePictureKey ? (
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-700 text-xs text-gray-400">CDN</div>
                              ) : <div className="w-16 h-16 rounded-full bg-gray-700"/>}

                              <div className="flex-grow">
                                <label className={`block text-sm font-medium text-gray-300 mb-1 ${editorDisabled ? 'opacity-50' : ''}`}>Profile Picture</label>
                                <input type="file" accept="image/*" onChange={handleProfilePicChange} disabled={editorDisabled} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/80 file:text-white hover:file:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed" />
                              </div>
                               {(profilePicPreview || cardData?.profilePictureKey) && (
                                <button onClick={() => handleRemoveImage(setProfilePicPreview, 'profilePictureKey')} className="p-2 rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors" title="Remove profile picture"><TrashIcon className="w-5 h-5" /></button>
                              )}
                            </div>
                          </FormSection>

                          <FormSection title="Primary Actions">
                            <InputField label="Book Meeting Button Text" name="meetingButtonText" value={cardData?.meetingButtonText || ''} onChange={handleInputChange} disabled={editorDisabled} />
                            <InputField label="Meeting URL" name="calendlyLink" value={cardData?.calendlyLink || ''} onChange={handleInputChange} disabled={editorDisabled} />
                            <InputField label="Save Contact Button Text" name="saveContactButtonText" value={cardData?.saveContactButtonText || ''} onChange={handleInputChange} disabled={editorDisabled} />
                          </FormSection>

                          <FormSection title="Contact Info">
                            <InputField label="Phone Number" name="phone" value={cardData?.phone || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            <InputField label="Email Address" name="email" value={cardData?.email || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            <InputField label="Location" name="address" value={cardData?.address || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                            <InputField label="Location Link (e.g., Google Maps URL)" name="addressLink" value={cardData?.addressLink || ''} onChange={handleInputChange} disabled={editorDisabled}/>
                          </FormSection>

                          <FormSection title="Social Media">
                            <div className="space-y-4">
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="LinkedIn URL" name="socials.linkedin.url" value={cardData?.socials?.linkedin?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.linkedin?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable LinkedIn" name="socials.linkedin.enabled" checked={cardData?.socials?.linkedin?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="Instagram URL" name="socials.instagram.url" value={cardData?.socials?.instagram?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.instagram?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable Instagram" name="socials.instagram.enabled" checked={cardData?.socials?.instagram?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="WhatsApp URL" name="socials.whatsapp.url" value={cardData?.socials?.whatsapp?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.whatsapp?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable WhatsApp" name="socials.whatsapp.enabled" checked={cardData?.socials?.whatsapp?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="Facebook URL" name="socials.facebook.url" value={cardData?.socials?.facebook?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.facebook?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable Facebook" name="socials.facebook.enabled" checked={cardData?.socials?.facebook?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="X (Twitter) URL" name="socials.twitter.url" value={cardData?.socials?.twitter?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.twitter?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable X (Twitter)" name="socials.twitter.enabled" checked={cardData?.socials?.twitter?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                                <div className="flex items-end gap-3">
                                  <div className="flex-grow"><InputField label="YouTube URL" name="socials.youtube.url" value={cardData?.socials?.youtube?.url || ''} onChange={handleInputChange} disabled={editorDisabled || !cardData?.socials?.youtube?.enabled} /></div>
                                  <div className="flex items-center h-10"><input type="checkbox" title="Enable/Disable YouTube" name="socials.youtube.enabled" checked={cardData?.socials?.youtube?.enabled ?? false} onChange={handleToggleChange} disabled={editorDisabled} className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed" /></div>
                                </div>
                            </div>
                          </FormSection>

                          <FormSection title="Styling">
                            <div className="flex items-center gap-4">
                              <label htmlFor="accentColor" className="font-medium text-gray-300">Accent Color</label>
                              <div className="relative">
                                <input type="color" id="accentColor" name="styleOptions.accentColor" value={currentAccentColor} onChange={handleInputChange} disabled={editorDisabled} className="p-1 h-10 w-14 block bg-gray-900 border border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" />
                              </div>
                              <div style={{ backgroundColor: currentAccentColor }} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-inner"></div>
                            </div>
                          </FormSection>

                          <FormSection title="Card Back">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {cardBackLogoPreview ? (
                                      <img src={cardBackLogoPreview} alt="Card Back Logo Preview" className="w-16 h-16 object-contain shadow-md bg-gray-700 p-1 rounded-md" />
                                    ) : cardData?.cardBackLogoKey ? (
                                      <div className="w-16 h-16 flex items-center justify-center bg-gray-700 p-1 rounded-md text-xs text-gray-400">CDN</div>
                                    ) : <div className="w-16 h-16 bg-gray-700 rounded-md" />}
                                    <div className="flex-grow">
                                    <label className={`block text-sm font-medium text-gray-300 mb-1 ${editorDisabled ? 'opacity-50' : ''}`}>Custom Card Back Logo</label>
                                    <input type="file" accept="image/*" onChange={handleCardBackLogoChange} disabled={editorDisabled} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/80 file:text-white hover:file:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed" />
                                    </div>
                                    {(cardBackLogoPreview || cardData?.cardBackLogoKey) && (
                                      <button onClick={() => handleRemoveImage(setCardBackLogoPreview, 'cardBackLogoKey')} className="p-2 rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors" title="Remove custom logo"><TrashIcon className="w-5 h-5" /></button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className={`block text-sm font-medium text-gray-300 ${!cardData?.cardBackLogoKey || editorDisabled ? 'opacity-50' : ''}`}>Logo Size</label>
                                        <span className="text-sm text-gray-400">{cardData?.cardBackLogoSize || 0}px</span>
                                    </div>
                                    <input type="range" min="50" max="300" name="cardBackLogoSize" value={cardData?.cardBackLogoSize || 160} onChange={e => handleCardDataChange({ cardBackLogoSize: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-brand-accent [&::-moz-range-thumb]:bg-brand-accent disabled:cursor-not-allowed" disabled={!cardData?.cardBackLogoKey || editorDisabled}/>
                                </div>
                            </div>
                          </FormSection>
                        </main>

                        <aside className="hidden lg:flex flex-col lg:w-1/2 p-6 bg-brand-dark overflow-y-auto" style={{maxHeight: 'calc(100vh - 69px)'}}>
                          <div className="flex-grow w-full perspective-container flex items-center justify-center">
                            <div className="card-3d w-[384px] h-[720px]" style={{ transform: `rotateY(${isEditorPreviewFlipped ? 180 : 0}deg)` }}>
                              <div className="card-face card-front">
                                <CardPreview data={cardData} onUpdate={handleCardDataChange} previews={livePreviews} />
                              </div>
                              <CardBack data={cardData} previews={livePreviews} />
                            </div>
                          </div>
                          <div className="mt-6 text-center">
                            <button onClick={() => setIsEditorPreviewFlipped(prev => !prev)} disabled={editorDisabled} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">
                              {isEditorPreviewFlipped ? 'View Front' : 'View Back'}
                            </button>
                          </div>
                        </aside>
                    </>
                )}
            </div>

            <CreateCardModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateCard}
            />
            
            {cardToDeleteDetails && <ConfirmDeleteModal 
                isOpen={!!cardToDelete}
                onClose={() => setCardToDelete(null)}
                onConfirm={confirmDeleteCard}
                cardName={cardToDeleteDetails.cardName}
            />}
            
            <InteractivePreviewModal 
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                data={cardData}
                onUpdate={handleCardDataChange}
                previews={livePreviews}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={shareableUrl}
            />
            
            <QRCodeModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                url={shareableUrl}
                cardName={cardData?.cardName || 'card'}
            />

            <Toast 
                message={toast.message} 
                show={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
                type={toast.type}
            />
        </div>
    );
};