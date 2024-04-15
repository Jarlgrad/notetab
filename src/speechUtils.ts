import { pipeline } from '@xenova/transformers';

export async function startSpeechToText(displayCallback: (text: string) => void, updateButtonCallback: (isRecording: boolean) => void) {
    let mediaRecorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        console.log("stream started")
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
        };
        
        updateButtonCallback(true);
        
        mediaRecorder.onstop = async () => {
            console.log("stream stopped")
            const audioBlob = new Blob(audioChunks);
            audioChunks = []; // Reset chunks for next recording
        
            const audioUrl = URL.createObjectURL(audioBlob);
            const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.se');
            const output = await transcriber(audioUrl);
            console.log("whisper-tiny response:", output);
            
            URL.revokeObjectURL(audioUrl);

            stopSpeechToText(updateButtonCallback); // Stop recording on error
        };
    })
      .catch(e => {
        console.error(e);
        stopSpeechToText(updateButtonCallback); // Stop recording on error
    });
    
}

export async function stopSpeechToText(updateButtonCallback: (isRecording: boolean) => void) {
    let audioChunks: BlobPart[] = [];

    console.log("stream stopped, inside stopSpeechToText")
    const audioBlob = new Blob(audioChunks);
    audioChunks = []; // Reset chunks for next recording

    const audioUrl = URL.createObjectURL(audioBlob);
    const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.se');
    const output = await transcriber(audioUrl);
    console.log("whisper-tiny response:", output);
    
    URL.revokeObjectURL(audioUrl);
    updateButtonCallback(false); // Indicate recording has stopped
}