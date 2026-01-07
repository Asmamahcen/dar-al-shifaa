import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from Hugging Face
env.allowLocalModels = false;
env.useBrowserCache = true;

let generator: any = null;

self.onmessage = async (event) => {
  const { type, text, language } = event.data;

  if (type === 'load') {
    try {
      self.postMessage({ type: 'status', message: 'Loading model...' });
      
      // Using a small, efficient model for fast browser-side inference
      generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
      
      self.postMessage({ type: 'ready' });
    } catch (error: any) {
      self.postMessage({ type: 'error', message: error.message });
    }
  } else if (type === 'generate') {
    if (!generator) {
      self.postMessage({ type: 'error', message: 'Model not loaded' });
      return;
    }

    try {
      // Define a system prompt based on language
      const systemPrompts: any = {
        fr: "Tu es Shifaa, un assistant médical algérien professionnel. Réponds de manière concise et utile. Question: ",
        en: "You are Shifaa, a professional Algerian medical assistant. Answer concisely and helpfully. Question: ",
        ar: "أنت شيفاء، مساعد طبي جزائري محترف. أجب باختصار ومفيدة. السؤال: "
      };

      const prompt = `${systemPrompts[language] || systemPrompts.fr}${text}`;

      const result = await generator(prompt, {
        max_new_tokens: 100,
        temperature: 0.7,
        repetition_penalty: 1.2,
      });

      self.postMessage({ 
        type: 'result', 
        text: result[0].generated_text 
      });
    } catch (error: any) {
      self.postMessage({ type: 'error', message: error.message });
    }
  }
};
