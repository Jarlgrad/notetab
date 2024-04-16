import { pipeline } from '@xenova/transformers';
let mediaRecorder: MediaRecorder;

export async function startSpeechToText(displayCallback: (text: string) => void, updateButtonCallback: (isRecording: boolean) => void) {
    let audioChunks: BlobPart[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start()
        console.log("stream started, state:", mediaRecorder.state)
        console.log("state", )
        mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
        };
        
        updateButtonCallback(true);
        
        mediaRecorder.onstop = async () => {
            console.log("stream stopped")
            const audioBlob = new Blob(audioChunks);
            audioChunks = []; // Reset chunks for next recording
        
            const audioUrl = URL.createObjectURL(audioBlob);
            const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.sv');
            const output = await transcriber(audioUrl);
            console.log("whisper-tiny response:", output);
            
            URL.revokeObjectURL(audioUrl);

            updateButtonCallback(false); // Stop recording on error
        };
    })
      .catch(e => {
        console.error(e);
        stopSpeechToText(); // Stop recording on error
    });
    
}

export async function stopSpeechToText() {
    console.log("inside stop, state:", mediaRecorder.state)
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log("Recording stopped");
    }
}