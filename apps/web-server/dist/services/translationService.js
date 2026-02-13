import { translate } from 'google-translate-api-x';
export const translateText = async (text, targetLang = 'en') => {
    if (!text)
        return '';
    try {
        const processedText = text;
        const protectionMap = {
            'outrageous': 'ultroso',
            'outrageousness': 'ultroso',
            'outrageously': 'ultroso',
            'Ultroso': 'Ultroso'
        };
        try {
            const res = await translate(processedText, { to: targetLang, forceBatch: false, rejectOnPartialFail: false });
            let translatedText = res.text;
            // Apply replacements
            Object.entries(protectionMap).forEach(([target, replacement]) => {
                const regex = new RegExp(`\\b${target}\\b`, 'gi');
                translatedText = translatedText.replace(regex, replacement);
            });
            return translatedText;
        }
        catch (innerError) {
            console.error('Google Translate API Error:', innerError);
            throw innerError; // Re-throw to be caught by outer catch
        }
    }
    catch (error) {
        console.error('TranslationService Fatal Error:', error);
        return text; // Fallback to original text
    }
};
