import React, { useState, useRef } from 'react';
import { useStory } from '../contexts/StoryContext';

const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25-2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const Step1_5_CharacterAssignment: React.FC = () => {
    const { fullStory, confirmCharacters } = useStory();
    const characters = fullStory?.personagens.map(p => p.nome) ?? [];
    
    const [photoMap, setPhotoMap] = useState<Map<string, { file: File; previewUrl: string }>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentCharacterRef = useRef<string | null>(null);

    const handleFileSelect = (characterName: string) => {
        currentCharacterRef.current = characterName;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const characterName = currentCharacterRef.current;

        if (file && characterName) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result as string;
                setPhotoMap(prevMap => {
                    const newMap = new Map(prevMap);
                    newMap.set(characterName, { file, previewUrl });
                    return newMap;
                });
            };
            reader.readAsDataURL(file);
        }

        if (e.target) {
            e.target.value = '';
        }
    };

    const removePhoto = (characterName: string) => {
        setPhotoMap(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(characterName);
            return newMap;
        });
    };

    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const fileMap = new Map<string, File>();
        for (const [name, data] of photoMap.entries()) {
            fileMap.set(name, data.file);
        }
        confirmCharacters(fileMap);
    };

    return (
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center gap-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#7C4DFF]">Quem são os heróis da sua história?</h2>
                <p className="text-gray-600 mt-1">(Opcional) Envie uma foto para cada personagem para que o Gênio possa desenhá-los!</p>
            </div>
            
            <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange} 
                className="hidden" 
            />

            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                {characters.map(name => {
                    const photoData = photoMap.get(name);
                    return (
                        <div key={name} className="flex flex-col gap-2 items-center">
                            <div className="relative aspect-square w-full">
                                {photoData ? (
                                    <>
                                        <img src={photoData.previewUrl} alt={`Preview ${name}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                        <button 
                                            type="button"
                                            onClick={() => removePhoto(name)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 transition-transform transform hover:scale-110"
                                            aria-label={`Remover foto de ${name}`}
                                        >
                                           <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div 
                                        onClick={() => handleFileSelect(name)}
                                        className="cursor-pointer aspect-square w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-[#1DE9B6] transition-all duration-300"
                                    >
                                        <div className="text-center p-2">
                                            <PhotoIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                            <p className="mt-2 text-sm font-semibold">Adicionar Foto</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="font-bold text-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{name}</p>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full max-w-md text-xl font-extrabold bg-[#FFE066] text-[#7C4DFF] px-6 py-4 rounded-xl shadow-lg hover:bg-[#FFD133] transform hover:scale-105 transition-all duration-300 mt-4 disabled:bg-[#FFE066]/50 disabled:text-[#7C4DFF]/60 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isSubmitting ? 'O Gênio está desenhando...' : 'Prepare-se para a Mágica!'}
            </button>
        </div>
    );
};

export default Step1_5_CharacterAssignment;