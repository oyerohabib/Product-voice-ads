const SAMPLE_RATE = 44100;
const LEAD_IN = 1.2;
const TAIL = 1.8;

async function decode(blob: Blob) {
  const context = new OfflineAudioContext(2, 1, SAMPLE_RATE);
  return context.decodeAudioData(await blob.arrayBuffer());
}

export async function audioDuration(blob: Blob) {
  return (await decode(blob)).duration;
}

// Music plays alone for a short intro, ducks under the voice, swells briefly
// after the last word, then fades out.
export async function mixVoiceWithMusic(voiceBlob: Blob, musicBlob: Blob, musicVolume: number) {
  const [voice, music] = await Promise.all([decode(voiceBlob), decode(musicBlob)]);
  const voiceEnd = LEAD_IN + voice.duration;
  const total = voiceEnd + TAIL;

  const context = new OfflineAudioContext(2, Math.ceil(total * SAMPLE_RATE), SAMPLE_RATE);

  const musicSource = context.createBufferSource();
  musicSource.buffer = music;
  musicSource.loop = music.duration < total;
  const musicGain = context.createGain();
  const intro = Math.min(1, musicVolume * 2.2);
  musicGain.gain.setValueAtTime(0, 0);
  musicGain.gain.linearRampToValueAtTime(intro, 0.4);
  musicGain.gain.setValueAtTime(intro, LEAD_IN - 0.4);
  musicGain.gain.linearRampToValueAtTime(musicVolume, LEAD_IN);
  musicGain.gain.setValueAtTime(musicVolume, voiceEnd);
  musicGain.gain.linearRampToValueAtTime(intro, voiceEnd + 0.4);
  musicGain.gain.linearRampToValueAtTime(0, total);
  musicSource.connect(musicGain).connect(context.destination);

  const voiceSource = context.createBufferSource();
  voiceSource.buffer = voice;
  voiceSource.connect(context.destination);

  musicSource.start(0);
  voiceSource.start(LEAD_IN);

  return encodeWav(await context.startRendering());
}

function encodeWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const dataSize = frames * channels * bytesPerSample;
  const view = new DataView(new ArrayBuffer(44 + dataSize));

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channelData = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}
