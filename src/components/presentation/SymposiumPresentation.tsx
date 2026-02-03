/**
 * Generic Symposium Presentation Component
 * 
 * This component can be used for any symposia by providing configuration props.
 * It handles speech playback, animated busts, subtitles, and Q&A.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, MessageSquare, Send, ExternalLink, RotateCcw, Subtitles } from 'lucide-react';
import { fetchFacultyByHandleFromEdgeFunction } from '../../lib/supabase-edge-functions';

// =========================================================================
// Types & Interfaces
// =========================================================================

export interface Question {
  id: string;
  text: string;
  targetSpeaker?: string;
  timestamp: Date;
}

export interface SpeakerConfig {
  id: string;
  name: string;
  native?: string; // Native language name (e.g., Persian, French)
  epithet: string;
  isHeretic?: boolean;
}

export interface Speaker extends SpeakerConfig {
  // Dynamic from Supabase:
  voice?: string;
  voiceRate?: number;
  voicePitch?: number;
  bustFrontalUrl?: string;
  bustRightUrl?: string;
}

export interface FallbackVoice {
  voice: string;
  rate: number;
  language?: string;
  accent?: string;
}

export interface SymposiumTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  pattern?: string; // Optional SVG pattern
}

export interface LanguageSupport {
  audioLanguages: Array<{ code: string; label: string; nativeLabel?: string }>;
  captionLanguages: Array<{ code: string; label: string; nativeLabel?: string }>;
  defaultAudioLanguage: string;
  defaultCaptionLanguage: string;
  // Function to get speech text in a specific language
  getSpeechText?: (speakerId: string, language: string) => string | null;
  // Function to extract native text from speech (for captions)
  extractNativeText?: (text: string) => string;
  // Function to check if text contains native script
  containsNativeScript?: (text: string) => boolean;
}

export interface SymposiumPresentationProps {
  // Required configuration
  speakers: SpeakerConfig[];
  speeches: Record<string, string>; // Map of speakerId -> speech text
  fallbackVoices: Record<string, FallbackVoice>;
  matrixRoomUrl: string;
  matrixRoomAlias: string;
  theme: SymposiumTheme;
  title: string;
  subtitle?: string;
  
  // Optional language support
  languageSupport?: LanguageSupport;
  
  // Optional customizations
  autoPlayDefault?: boolean;
  showQAByDefault?: boolean;
}

type PresentationState = 'idle' | 'speaking' | 'paused' | 'transitioning' | 'complete';

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  // If already RGB format (comma-separated), return as-is
  if (hex.includes(',')) {
    return hex;
  }
  // Fallback
  return '0, 0, 0';
}

export default function SymposiumPresentation({
  speakers: speakerConfigs,
  speeches,
  fallbackVoices,
  matrixRoomUrl,
  matrixRoomAlias,
  theme,
  title,
  subtitle,
  languageSupport,
  autoPlayDefault = true,
  showQAByDefault = false,
}: SymposiumPresentationProps) {
  // Convert theme colors to RGB for rgba() usage
  const primaryRgb = hexToRgb(theme.primary);
  const secondaryRgb = hexToRgb(theme.secondary);
  const accentRgb = hexToRgb(theme.accent);
  
  // =========================================================================
  // State
  // =========================================================================
  
  const [speakers, setSpeakers] = useState<Speaker[]>(speakerConfigs as Speaker[]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [state, setState] = useState<PresentationState>('idle');
  const [subtitles, setSubtitles] = useState('');
  const [captionChunks, setCaptionChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [audioLanguage, setAudioLanguage] = useState<string>(
    languageSupport?.defaultAudioLanguage || languageSupport?.audioLanguages[0]?.code || 'english'
  );
  const [captionLanguage, setCaptionLanguage] = useState<string>(
    languageSupport?.defaultCaptionLanguage || languageSupport?.captionLanguages[0]?.code || 'english'
  );
  const [jawOpen, setJawOpen] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);
  
  // Q&A State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showQAPanel, setShowQAPanel] = useState(showQAByDefault);
  const [selectedSpeakerForQuestion, setSelectedSpeakerForQuestion] = useState<string | null>(null);
  
  // Auto-play state
  const [autoPlay, setAutoPlay] = useState(autoPlayDefault);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const speechTextRef = useRef<string>('');
  const autoPlayRef = useRef(autoPlayDefault);
  const pendingNextSpeechRef = useRef<number | null>(null);
  const currentChunkIndexRef = useRef(0);
  const audioCacheRef = useRef<Map<string, { url: string; audio: HTMLAudioElement }>>(new Map());
  
  // =========================================================================
  // Load Speaker Data from Supabase
  // =========================================================================
  
  useEffect(() => {
    async function loadSpeakerData() {
      try {
        const loadedSpeakers = await Promise.all(
          speakerConfigs.map(async (speaker) => {
            try {
              const data = await fetchFacultyByHandleFromEdgeFunction(speaker.id);
              if (data) {
                return {
                  ...speaker,
                  voice: data.voice_id || fallbackVoices[speaker.id]?.voice || 'en-US-GuyNeural',
                  voiceLanguage: data.voice_language || fallbackVoices[speaker.id]?.language || 'en-US',
                  voiceRate: data.voice_rate || fallbackVoices[speaker.id]?.rate || 1.0,
                  voicePitch: data.voice_pitch || 0,
                  bustFrontalUrl: data.bust_frontal_url || data.bust_right_url || `/busts/${speaker.id.replace(/^a[.-]/, '').replace(/[.-]/g, '-')}/bust.png`,
                  bustRightUrl: data.bust_right_url || `/busts/${speaker.id.replace(/^a[.-]/, '').replace(/[.-]/g, '-')}/bust.png`,
                };
              }
            } catch (err) {
              console.warn(`Failed to load data for ${speaker.id}:`, err);
            }
            // Use fallback
            const fallback = fallbackVoices[speaker.id] || { voice: 'en-US-GuyNeural', rate: 1.0, language: 'en-US' };
            const fallbackBustUrl = `/busts/${speaker.id.replace(/^a[.-]/, '').replace(/[.-]/g, '-')}/bust.png`;
            return {
              ...speaker,
              voice: fallback.voice,
              voiceLanguage: fallback.language || 'en-US',
              voiceRate: fallback.rate,
              voicePitch: 0,
              bustFrontalUrl: fallbackBustUrl,
              bustRightUrl: fallbackBustUrl,
            };
          })
        );
        setSpeakers(loadedSpeakers);
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load speaker data:', err);
        // Use config with fallbacks
        setSpeakers(speakerConfigs.map(s => {
          const fallbackBustUrl = `/busts/${s.id.replace('a.', '')}/bust.png`;
          return {
            ...s,
            voice: fallbackVoices[s.id]?.voice || 'en-US-GuyNeural',
            voiceRate: fallbackVoices[s.id]?.rate || 1.0,
            voicePitch: 0,
            bustFrontalUrl: fallbackBustUrl,
            bustRightUrl: fallbackBustUrl,
          };
        }));
        setDataLoaded(true);
      }
    }
    loadSpeakerData();
  }, [speakerConfigs, fallbackVoices]);

  const currentSpeaker = speakers[currentSpeakerIndex];
  const previousSpeaker = currentSpeakerIndex > 0 ? speakers[currentSpeakerIndex - 1] : null;
  
  // =========================================================================
  // Caption Chunking
  // =========================================================================
  
  const chunkSpeech = useCallback((text: string, maxLen: number = 150): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length <= maxLen) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }, []);

  // =========================================================================
  // Speech Synthesis & Playback
  // =========================================================================

  const getSpeechContent = useCallback((speakerId: string, lang: string): string => {
    // Normalize speaker ID to hyphen format for speech lookup
    const speechKey = speakerId.replace(/^a\./, 'a-').replace(/\./g, '-');
    const baseSpeech = speeches[speechKey] || speeches[speakerId] || '';
    
    // If language support is provided, try to get language-specific speech
    if (languageSupport?.getSpeechText) {
      const langSpeech = languageSupport.getSpeechText(speakerId, lang);
      if (langSpeech) {
        return langSpeech;
      }
    }
    
    return baseSpeech;
  }, [speeches, languageSupport]);

  const getVoiceUrl = useCallback(async (
    speakerId: string,
    text: string,
    voiceId: string,
    voiceRate: number,
    voicePitch: number,
    language: string
  ) => {
    const cacheKey = `${speakerId}-${language}-${text.substring(0, 50)}`;
    if (audioCacheRef.current.has(cacheKey)) {
      return audioCacheRef.current.get(cacheKey)?.url;
    }

    const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
    const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
      console.warn('Supabase anon key not set. TTS will not work. Set PUBLIC_SUPABASE_ANON_KEY environment variable.');
      return null;
    }

    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/tts`;
    
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          text: text,
          voice_id: voiceId,
          voice_rate: voiceRate,
          voice_pitch: voicePitch,
          voice_language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS Edge Function error:', errorData);
        throw new Error(`TTS failed: ${errorData.error || response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioCacheRef.current.set(cacheKey, { url, audio: new Audio(url) });
      return url;
    } catch (error) {
      console.error('Error fetching TTS audio:', error);
      return null;
    }
  }, []);

  const playSpeech = useCallback(async (speaker: Speaker, speechText: string) => {
    if (!speechText) {
      console.warn(`No speech content for ${speaker.name}. Skipping.`);
      setState('complete');
      return;
    }

    setIsLoading(true);
    setState('speaking');
    setSubtitles('');
    setSpeechProgress(0);
    setCurrentChunkIndex(0);
    currentChunkIndexRef.current = 0;

    const voiceId = speaker.voice || fallbackVoices[speaker.id]?.voice || 'en-US-GuyNeural';
    const voiceRate = speaker.voiceRate || fallbackVoices[speaker.id]?.rate || 1.0;
    const voicePitch = speaker.voicePitch || 0;
    const voiceLanguage = (speaker as any).voiceLanguage || fallbackVoices[speaker.id]?.language || 'en-US';

    const audioUrl = await getVoiceUrl(speaker.id, speechText, voiceId, voiceRate, voicePitch, voiceLanguage);

    if (!audioUrl) {
      console.error('Failed to get audio URL.');
      setIsLoading(false);
      setState('idle');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    audioRef.current = new Audio(audioUrl);
    audioRef.current.playbackRate = voiceRate;
    audioRef.current.volume = isMuted ? 0 : 1;

    const chunks = chunkSpeech(speechText);
    setCaptionChunks(chunks);

    audioRef.current.onloadedmetadata = () => {
      setAudioDuration(audioRef.current?.duration || 0);
      setIsLoading(false);
      audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
    };

    audioRef.current.ontimeupdate = () => {
      const current = audioRef.current?.currentTime || 0;
      const duration = audioRef.current?.duration || 0;
      setAudioCurrentTime(current);
      setSpeechProgress((current / duration) * 100);

      // Update subtitles
      const chunkIndex = Math.min(
        Math.floor((current / duration) * chunks.length),
        chunks.length - 1
      );
      
      if (chunkIndex !== currentChunkIndexRef.current) {
        let captionText = chunks[chunkIndex] || '';
        
        // If caption language is different, try to extract native text
        if (captionLanguage !== audioLanguage && languageSupport?.extractNativeText) {
          const nativeText = languageSupport.extractNativeText(captionText);
          if (nativeText) {
            captionText = nativeText;
          }
        }
        
        setSubtitles(captionText);
        currentChunkIndexRef.current = chunkIndex;
      }
      
      setJawOpen(Math.sin(current * 10) * 0.5 + 0.5); // Simple jaw animation
    };

    audioRef.current.onended = () => {
      setJawOpen(0);
      setSubtitles('');
      setState('complete');
      if (autoPlayRef.current && currentSpeakerIndex < speakers.length - 1) {
        pendingNextSpeechRef.current = setTimeout(() => {
          setCurrentSpeakerIndex(prev => prev + 1);
        }, 3000); // 3-second pause before next speaker
      }
    };
  }, [chunkSpeech, getVoiceUrl, isMuted, speakers.length, currentSpeakerIndex, captionLanguage, audioLanguage, languageSupport, fallbackVoices]);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  // Auto-start first speech when data is loaded
  useEffect(() => {
    if (dataLoaded && currentSpeaker && state === 'idle' && autoPlay) {
      const speechContent = getSpeechContent(currentSpeaker.id, audioLanguage);
      if (speechContent) {
        playSpeech(currentSpeaker, speechContent);
      }
    }
  }, [currentSpeaker, dataLoaded, getSpeechContent, playSpeech, state, audioLanguage, autoPlay]);

  // Handle speaker change
  useEffect(() => {
    if (dataLoaded && currentSpeaker && state === 'complete' && currentSpeakerIndex > 0) {
      const speechContent = getSpeechContent(currentSpeaker.id, audioLanguage);
      if (speechContent && autoPlay) {
        playSpeech(currentSpeaker, speechContent);
      }
    }
  }, [currentSpeaker, currentSpeakerIndex, dataLoaded, getSpeechContent, playSpeech, state, audioLanguage, autoPlay]);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (state === 'speaking') {
        audioRef.current.pause();
        setState('paused');
      } else {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        setState('speaking');
      }
    } else if (currentSpeaker && dataLoaded) {
      const speechContent = getSpeechContent(currentSpeaker.id, audioLanguage);
      if (speechContent) {
        playSpeech(currentSpeaker, speechContent);
      }
    }
  }, [state, currentSpeaker, dataLoaded, getSpeechContent, playSpeech, audioLanguage]);

  const skipToNextSpeaker = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    clearTimeout(pendingNextSpeechRef.current || 0);
    setJawOpen(0);
    setSubtitles('');
    setState('idle');
    if (currentSpeakerIndex < speakers.length - 1) {
      setCurrentSpeakerIndex(prev => prev + 1);
    } else {
      setCurrentSpeakerIndex(0);
      setState('complete');
    }
  }, [currentSpeakerIndex, speakers.length]);

  const skipToPreviousSpeaker = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    clearTimeout(pendingNextSpeechRef.current || 0);
    setJawOpen(0);
    setSubtitles('');
    setState('idle');
    if (currentSpeakerIndex > 0) {
      setCurrentSpeakerIndex(prev => prev - 1);
    } else {
      setCurrentSpeakerIndex(speakers.length - 1);
    }
  }, [currentSpeakerIndex, speakers.length]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0;
    }
    setIsMuted(prev => !prev);
  }, [isMuted]);

  const toggleCaptions = useCallback(() => {
    setShowCaptions(prev => !prev);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleQuestionSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      const newQ: Question = {
        id: Date.now().toString(),
        text: newQuestion.trim(),
        targetSpeaker: selectedSpeakerForQuestion || undefined,
        timestamp: new Date(),
      };
      setQuestions(prev => [...prev, newQ]);
      setNewQuestion('');
      setSelectedSpeakerForQuestion(null);
      console.log('Question submitted:', newQ);
    }
  }, [newQuestion, selectedSpeakerForQuestion]);

  const openMatrixRoom = useCallback(() => {
    window.open(matrixRoomUrl, '_blank');
  }, [matrixRoomUrl]);

  if (!dataLoaded) {
    return (
      <div className="presentation-loading" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: theme.background,
        color: theme.text
      }}>
        <p>Loading symposium data...</p>
      </div>
    );
  }

  // Render completion screen
  if (state === 'complete' && currentSpeakerIndex === speakers.length - 1) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: theme.background,
        color: theme.text,
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: theme.accent, marginBottom: '1rem' }}>{title}</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>All speeches complete.</p>
          
          <div style={{ 
            background: `rgba(${primaryRgb}, 0.1)`, 
            padding: '2rem', 
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: theme.accent, marginBottom: '1rem' }}>Join the Q&A Discussion</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              Continue the conversation with fellow attendees and engage with the speakers.
            </p>
            <button
              onClick={openMatrixRoom}
              style={{
                background: theme.accent,
                color: theme.text,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Enter Discussion Room
            </button>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Room: <code>{matrixRoomAlias}</code>
            </p>
          </div>
          
          {questions.length > 0 && (
            <div style={{ 
              background: `rgba(${secondaryRgb}, 0.1)`, 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: theme.accent, marginBottom: '1rem' }}>Your Questions ({questions.length})</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {questions.map(q => (
                  <li key={q.id} style={{ 
                    padding: '0.75rem', 
                    marginBottom: '0.5rem',
                    background: `rgba(${primaryRgb}, 0.1)`,
                    borderRadius: '6px'
                  }}>
                    <p>{q.text}</p>
                    {q.targetSpeaker && (
                      <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>
                        For: {speakers.find(s => s.id === q.targetSpeaker)?.name}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={() => {
              setCurrentSpeakerIndex(0);
              setState('idle');
              setSpeechProgress(0);
            }}
            style={{
              background: 'transparent',
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Replay the symposium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.background,
      color: theme.text,
      overflow: 'hidden'
    }}>
      {/* Pattern overlay */}
      {theme.pattern && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            opacity: 0.05,
            pointerEvents: 'none',
            backgroundImage: `url("${theme.pattern}")`,
          }}
        />
      )}
      
      {/* Header */}
      <header style={{ 
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '0.75rem',
        borderBottom: `1px solid ${theme.accent}40`
      }}>
        <h1 style={{ 
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: theme.accent,
          margin: 0
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.25rem 0 0' }}>{subtitle}</p>
        )}
      </header>
      
      {/* Main Stage */}
      <main style={{ 
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        minHeight: 'calc(100vh - 320px)'
      }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Speaker Carousel */}
          <div style={{ 
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '2rem',
            transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}>
            {/* Previous Speaker */}
            {previousSpeaker && previousSpeaker.bustRightUrl && (
              <div style={{ 
                opacity: isTransitioning ? 0.2 : 0.5,
                transform: isTransitioning 
                  ? 'scale(0.5) translateX(-120px)' 
                  : 'scale(0.7) translateX(20px)',
                transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                filter: 'grayscale(100%)'
              }}>
                <div style={{ 
                  width: '112px',
                  height: '160px',
                  backgroundImage: `url(${previousSpeaker.bustRightUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: 'scaleX(-1)'
                }} />
              </div>
            )}
            
            {/* Current Speaker */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              transform: isTransitioning 
                ? 'scale(0.75) translateX(-80px)' 
                : 'scale(1) translateX(0)',
              opacity: isTransitioning ? 0.7 : 1,
              filter: isTransitioning ? 'grayscale(0.3)' : 'none',
              transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}>
              {/* Heretic badge */}
              {currentSpeaker.isHeretic && (
                <div style={{ 
                  position: 'absolute',
                  top: '-1rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`,
                  color: theme.text,
                  padding: '0.25rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${theme.accent}50`,
                  zIndex: 20
                }}>
                  ⚠️ UNINVITED
                </div>
              )}
              
              {/* Spotlight effect */}
              <div style={{
                position: 'absolute',
                inset: '-1rem',
                borderRadius: '50%',
                background: state === 'speaking' 
                  ? `radial-gradient(circle, ${theme.accent}25 0%, transparent 70%)`
                  : `radial-gradient(circle, ${theme.accent}10 0%, transparent 70%)`,
                transform: `scale(${1 + jawOpen * 0.1})`,
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.6s ease',
              }} />
              
              {/* Bust - only show if bust image exists */}
              {(currentSpeaker.bustFrontalUrl || currentSpeaker.bustRightUrl) && (
                <div style={{
                  width: '224px',
                  height: '288px',
                  backgroundImage: `url(${state === 'speaking' && currentSpeaker.bustFrontalUrl 
                    ? currentSpeaker.bustFrontalUrl 
                    : currentSpeaker.bustRightUrl || currentSpeaker.bustFrontalUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  transform: state === 'speaking' && !isTransitioning
                    ? `translateY(${-jawOpen * 4}px) scale(${1 + jawOpen * 0.015})`
                    : 'translateY(0) scale(1)',
                  transition: state === 'speaking' ? 'transform 100ms ease' : 'transform 0.5s ease',
                  filter: state === 'speaking' && !isTransitioning ? 'brightness(1.1) contrast(1.05)' : 'brightness(1)',
                }} />
              )}
              
              {/* Speaker name plate */}
              <div style={{ 
                textAlign: 'center',
                marginTop: '0.5rem',
                opacity: isTransitioning ? 0.5 : 1,
                transition: 'opacity 0.6s ease',
              }}>
                {currentSpeaker.native && (
                  <p style={{ 
                    fontSize: '1.25rem',
                    color: theme.accent,
                    margin: 0
                  }}>
                    {currentSpeaker.native}
                  </p>
                )}
                <p style={{ 
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  margin: '0.25rem 0',
                  color: theme.text
                }}>
                  {currentSpeaker.name}
                </p>
                <p style={{ 
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  opacity: 0.8,
                  margin: 0,
                  color: theme.accent
                }}>
                  {currentSpeaker.epithet}
                </p>
              </div>
            </div>
            
            {/* Next Speaker */}
            {currentSpeakerIndex < speakers.length - 1 && speakers[currentSpeakerIndex + 1]?.bustFrontalUrl && (
              <div style={{ 
                opacity: isTransitioning ? 1 : 0.35,
                transform: isTransitioning 
                  ? 'scale(0.95) translateX(-60px)' 
                  : 'scale(0.6) translateX(-10px)',
                filter: isTransitioning ? 'none' : 'grayscale(0.4)',
                transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}>
                <div style={{ 
                  width: '112px',
                  height: '160px',
                  backgroundImage: `url(${speakers[currentSpeakerIndex + 1].bustFrontalUrl})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }} />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Closed Captions */}
      {showCaptions && (
        <div style={{ 
          position: 'fixed',
          bottom: '200px',
          left: 0,
          right: 0,
          padding: '0 1rem',
          zIndex: 30,
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              maxWidth: '800px'
            }}>
              {isLoading ? (
                <span style={{ 
                  display: 'inline-block',
                  background: 'rgba(0, 0, 0, 0.95)',
                  color: theme.accent,
                  fontSize: '1.125rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  textShadow: '2px 2px 0 #000'
                }}>
                  ▶ Loading audio...
                </span>
              ) : subtitles ? (
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.95)',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: theme.text,
                    fontSize: '1.125rem',
                    lineHeight: '1.6',
                    margin: 0,
                    textShadow: '2px 2px 0 #000'
                  }}>
                    {subtitles}
                  </p>
                </div>
              ) : state === 'idle' ? (
                <span style={{ 
                  display: 'inline-block',
                  background: 'rgba(0, 0, 0, 0.95)',
                  color: theme.accent,
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px'
                }}>
                  ▶ Press play to begin
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <footer style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: `rgba(${primaryRgb}, 0.95)`,
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${theme.accent}40`,
        padding: '1rem',
        zIndex: 20
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: theme.text, opacity: 0.7, width: '3rem', textAlign: 'right', fontFamily: 'monospace' }}>
              {formatTime(audioCurrentTime)}
            </span>
            <div style={{ flex: 1, height: '6px', background: `rgba(${theme.secondary}, 0.3)`, borderRadius: '999px' }}>
              <div style={{ 
                height: '100%',
                background: theme.accent,
                borderRadius: '999px',
                width: `${speechProgress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: theme.text, opacity: 0.7, width: '3rem', fontFamily: 'monospace' }}>
              -{formatTime(audioDuration - audioCurrentTime)}
            </span>
          </div>
          
          {/* Speaker indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            {speakers.map((speaker, index) => (
              <button
                key={speaker.id}
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setCurrentSpeakerIndex(index);
                  setState('idle');
                  setSpeechProgress(0);
                }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: index === currentSpeakerIndex 
                    ? theme.accent
                    : index < currentSpeakerIndex 
                      ? theme.secondary
                      : `rgba(${theme.secondary}, 0.3)`,
                  transform: index === currentSpeakerIndex ? 'scale(1.25)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  outline: speaker.isHeretic ? `2px solid ${theme.accent}` : 'none'
                }}
                title={speaker.name}
              />
            ))}
          </div>
          
          {/* Control buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={skipToPreviousSpeaker}
              disabled={currentSpeakerIndex === 0}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: `rgba(${secondaryRgb}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: currentSpeakerIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentSpeakerIndex === 0 ? 0.3 : 1
              }}
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              style={{
                padding: '1rem',
                borderRadius: '50%',
                background: theme.accent,
                border: 'none',
                color: theme.text,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? (
                <div style={{ 
                  width: '24px',
                  height: '24px',
                  border: `2px solid ${theme.text}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : state === 'speaking' ? (
                <Pause size={24} />
              ) : (
                <Play size={24} style={{ marginLeft: '2px' }} />
              )}
            </button>
            
            <button
              onClick={skipToNextSpeaker}
              disabled={currentSpeakerIndex === speakers.length - 1}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: `rgba(${secondaryRgb}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: currentSpeakerIndex === speakers.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentSpeakerIndex === speakers.length - 1 ? 0.3 : 1
              }}
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={toggleMute}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: isMuted ? theme.secondary : `rgba(${theme.secondary}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              onClick={toggleCaptions}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: showCaptions ? theme.accent : `rgba(${theme.secondary}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: 'pointer'
              }}
              title={showCaptions ? 'Hide captions (CC)' : 'Show captions (CC)'}
            >
              <Subtitles size={20} />
            </button>
            
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: autoPlay ? theme.accent : `rgba(${theme.secondary}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: 'pointer'
              }}
              title={autoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
            >
              <RotateCcw size={20} />
            </button>
            
            <button
              onClick={() => setShowQAPanel(!showQAPanel)}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: showQAPanel ? theme.accent : `rgba(${theme.secondary}, 0.3)`,
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                position: 'relative'
              }}
              title="Queue a question"
            >
              <MessageSquare size={20} />
              {questions.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  background: theme.secondary,
                  borderRadius: '50%',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {questions.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Status */}
          <p style={{ 
            textAlign: 'center',
            fontSize: '0.75rem',
            color: theme.text,
            opacity: 0.6,
            marginTop: '0.75rem',
            marginBottom: 0
          }}>
            Speaker {currentSpeakerIndex + 1} of {speakers.length} • {state}
            {autoPlay && <span style={{ marginLeft: '0.5rem', color: theme.accent }}>⟳ Auto</span>}
          </p>
        </div>
      </footer>
      
      {/* Q&A Panel */}
      {showQAPanel && (
        <div style={{
          position: 'fixed',
          right: '1rem',
          bottom: '200px',
          width: '320px',
          background: `rgba(${primaryRgb}, 0.95)`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${theme.accent}40`,
          borderRadius: '12px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{
            background: `rgba(${secondaryRgb}, 0.3)`,
            padding: '0.75rem 1rem',
            borderBottom: `1px solid ${theme.accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ 
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: theme.accent,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <MessageSquare size={16} />
              Queue a Question
            </h3>
            <button
              onClick={() => setShowQAPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '1.25rem',
                opacity: 0.7
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: theme.text, opacity: 0.7, marginBottom: '0.75rem' }}>
              Questions will be saved for the Q&A session after all speeches.
            </p>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ 
                fontSize: '0.75rem',
                color: theme.text,
                opacity: 0.7,
                marginBottom: '0.25rem',
                display: 'block'
              }}>
                Direct to speaker (optional):
              </label>
              <select
                value={selectedSpeakerForQuestion || ''}
                onChange={(e) => setSelectedSpeakerForQuestion(e.target.value || null)}
                style={{
                  width: '100%',
                  background: `rgba(${secondaryRgb}, 0.2)`,
                  border: `1px solid ${theme.accent}40`,
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  color: theme.text
                }}
              >
                <option value="">Any speaker</option>
                {speakers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <form onSubmit={handleQuestionSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question..."
                style={{
                  flex: 1,
                  background: `rgba(${secondaryRgb}, 0.2)`,
                  border: `1px solid ${theme.accent}40`,
                  borderRadius: '6px',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  color: theme.text
                }}
              />
              <button
                type="submit"
                disabled={!newQuestion.trim()}
                style={{
                  padding: '0.5rem',
                  background: theme.accent,
                  border: 'none',
                  borderRadius: '6px',
                  color: theme.text,
                  cursor: newQuestion.trim() ? 'pointer' : 'not-allowed',
                  opacity: newQuestion.trim() ? 1 : 0.5
                }}
              >
                <Send size={16} />
              </button>
            </form>
            
            {questions.length > 0 && (
              <div style={{ 
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${theme.accent}40`
              }}>
                <p style={{ fontSize: '0.75rem', color: theme.accent, marginBottom: '0.5rem' }}>
                  Queued ({questions.length})
                </p>
                <ul style={{ 
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  maxHeight: '128px',
                  overflowY: 'auto'
                }}>
                  {questions.slice(-3).map(q => (
                    <li key={q.id} style={{ 
                      fontSize: '0.75rem',
                      color: theme.text,
                      background: `rgba(${secondaryRgb}, 0.1)`,
                      borderRadius: '4px',
                      padding: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      {q.text.substring(0, 60)}{q.text.length > 60 ? '...' : ''}
                      {q.targetSpeaker && (
                        <span style={{ color: theme.accent, marginLeft: '0.25rem' }}>
                          → {speakers.find(s => s.id === q.targetSpeaker)?.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ 
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${theme.accent}40`,
              fontSize: '0.75rem',
              color: theme.text,
              opacity: 0.7
            }}>
              Join the live discussion on Matrix:{' '}
              <a 
                href={matrixRoomUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: theme.accent, textDecoration: 'none' }}
              >
                {matrixRoomAlias} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </a>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
