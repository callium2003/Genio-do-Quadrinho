const CACHE_NAME = 'genio-das-historias-imagens-v1';

const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error('URL de dados inválida');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Não foi possível analisar o tipo MIME da URL de dados');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Falha ao converter blob para URL de dados'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const getCachedImage = async (key: string): Promise<string | null> => {
    try {
        if (!('caches' in window)) {
            console.warn('API de Cache não suportada.');
            return null;
        }
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(key);
        if (response) {
            const blob = await response.blob();
            return await blobToDataURL(blob);
        }
        return null;
    } catch (error) {
        console.error('Erro ao recuperar imagem do cache:', error);
        return null;
    }
};

export const cacheImage = async (key: string, dataUrl: string): Promise<void> => {
    try {
        if (!('caches' in window)) {
            console.warn('API de Cache não suportada.');
            return;
        }
        const blob = dataURLtoBlob(dataUrl);
        const response = new Response(blob, {
            headers: { 'Content-Type': blob.type }
        });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(key, response);
    } catch (error) {
        console.error('Erro ao armazenar imagem em cache:', error);
    }
};
