let danishVoice: SpeechSynthesisVoice | null | undefined;

function getDanishVoice(): SpeechSynthesisVoice | null {
  if (danishVoice !== undefined) return danishVoice;
  const voices = window.speechSynthesis.getVoices();
  danishVoice = voices.find((v) => v.lang.toLowerCase().startsWith("da")) ?? null;
  return danishVoice;
}

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "da-DK";
  const voice = getDanishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

if (isTtsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    danishVoice = undefined;
  };
}
