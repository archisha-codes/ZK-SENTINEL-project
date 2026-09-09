export interface VoiceResponse {
  audioUrl?: string;
  transcript: string;
  nextQuestion: string;
  stepIndex: number;
  isComplete: boolean;
  integrationMode: 'REAL_PRODUCTION_INTEGRATION' | 'DEVELOPMENT_FALLBACK';
}

const ONBOARDING_QUESTIONS = [
  "Welcome to ZK-Sentinel. What is your full name or nickname?",
  "What type of work or business do you do?",
  "How long have you been working in this field?",
  "What is your approximate monthly income in USD?",
  "How much do you usually manage to save each month?",
  "Thank you! Your profile information is recorded. Please upload your financial dataset to proceed."
];

export class VoiceService {
  private static apiKey = process.env.ELEVENLABS_API_KEY;
  private static voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  public static async processVoiceTurn(stepIndex: number, userSpeechTranscript?: string): Promise<VoiceResponse> {
    const currentStep = Math.min(stepIndex, ONBOARDING_QUESTIONS.length - 1);
    const nextQuestion = ONBOARDING_QUESTIONS[currentStep];
    const isComplete = currentStep >= ONBOARDING_QUESTIONS.length - 1;

    if (!this.apiKey) {
      console.log(`[DEVELOPMENT FALLBACK] ElevenLabs API key missing. Returning structured transcript fallback for turn #${stepIndex}.`);
      return {
        transcript: userSpeechTranscript || "Response recorded",
        nextQuestion,
        stepIndex: currentStep,
        isComplete,
        integrationMode: 'DEVELOPMENT_FALLBACK',
      };
    }

    try {
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: nextQuestion,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`ElevenLabs TTS HTTP ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      return {
        audioUrl,
        transcript: userSpeechTranscript || "Voice response received",
        nextQuestion,
        stepIndex: currentStep,
        isComplete,
        integrationMode: 'REAL_PRODUCTION_INTEGRATION',
      };
    } catch (err: any) {
      console.warn(`[DEVELOPMENT FALLBACK] ElevenLabs API error: ${err.message}. Returning text transcript fallback.`);
      return {
        transcript: userSpeechTranscript || "Text mode active",
        nextQuestion,
        stepIndex: currentStep,
        isComplete,
        integrationMode: 'DEVELOPMENT_FALLBACK',
      };
    }
  }
}
