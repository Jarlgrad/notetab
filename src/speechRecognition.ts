declare global {
    interface Window {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    }

    interface SpeechRecognitionEventMap {
        'audiostart': Event;
        'soundstart': Event;
        'speechstart': Event;
        'speechend': Event;
        'soundend': Event;
        'audioend': Event;
        'result': SpeechRecognitionEvent;
        'nomatch': SpeechRecognitionEvent;
        'error': SpeechRecognitionErrorEvent;
        'start': Event;
        'end': Event;
    }

    interface SpeechRecognition extends EventTarget {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
        onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
        start: () => void;
        stop: () => void;
    }

    interface SpeechRecognitionEvent extends Event {
        results: SpeechRecognitionResultList;
        resultIndex: number;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        error: string;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };

    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
}

export {}; // This line is necessary to make this file a module and avoid the TS2669 error.