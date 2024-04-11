import { pipeline } from '@xenova/transformers';

let recognition: SpeechRecognition | null = null; // Hold the SpeechRecognition instance

export async function createVikingPipeline() {
    const vikingPipeline = await pipeline('text-generation', 'LumiOpen/Viking-7B');
    return vikingPipeline;
}

declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }
}

export function startSpeechToText(displayCallback: (text: string) => void, updateButtonCallback: (isRecording: boolean) => void) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error('Speech recognition API not supported in this browser.');
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async function(event: any) {
        const speechToText = event.results[0][0].transcript;
        
        // Assuming createVikingPipeline returns a function that can process text
        const vikingPipeline = await createVikingPipeline();
        const processedText = await vikingPipeline(speechToText); // This line is conceptual; actual implementation may vary
   
        displayCallback(speechToText);
        stopSpeechToText(updateButtonCallback); // Stop recording after getting a result
    };

    recognition.onerror = function(event: any) {
        console.error('Speech recognition error', event.error);
        stopSpeechToText(updateButtonCallback); // Stop recording on error
    };

    recognition.start();
    updateButtonCallback(true);
}

export function stopSpeechToText(updateButtonCallback: (isRecording: boolean) => void) {
    if (recognition) {
        recognition.stop();
        recognition = null; // Reset the recognition instance
        updateButtonCallback(false); // Indicate recording has stopped
    }
}