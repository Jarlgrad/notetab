import { pipeline } from '@xenova/transformers';

let recognition: SpeechRecognition | null = null; // Hold the SpeechRecognition instance

export async function createVikingPipeline() {
    const modelIdentifier = 'LumiOpen/Viking-7B';
    const vikingPipeline = await pipeline('text-generation', modelIdentifier);
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

    recognition.start = function() {
        updateButtonCallback(true); // Indicate recording has started
    };

    recognition.onresult = function(event: any) {
        const speechToText = event.results[0][0].transcript;
        displayCallback(speechToText);
        stopSpeechToText(updateButtonCallback); // Stop recording after getting a result
    };

    recognition.onerror = function(event: any) {
        console.error('Speech recognition error', event.error);
        stopSpeechToText(updateButtonCallback); // Stop recording on error
    };

    recognition.start();
}

export function stopSpeechToText(updateButtonCallback: (isRecording: boolean) => void) {
    if (recognition) {
        recognition.stop();
        recognition = null; // Reset the recognition instance
        updateButtonCallback(false); // Indicate recording has stopped
    }
}