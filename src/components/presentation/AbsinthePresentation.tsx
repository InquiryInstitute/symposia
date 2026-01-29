import { useState, useEffect } from 'react';
import { fetchFacultyByHandleFromEdgeFunction } from '../../lib/supabase-edge-functions';

interface Speaker {
  id: string;
  name: string;
  epithet: string;
  isHeretic?: boolean;
  voice?: string;
  voiceRate?: number;
  bustFrontalUrl?: string;
  bustRightUrl?: string;
}

const SPEAKER_CONFIG: Speaker[] = [
  { id: 'a.gogh', name: 'Vincent van Gogh', epithet: 'The Martyr' },
  { id: 'a.crowley', name: 'Aleister Crowley', epithet: 'The Magus' },
  { id: 'a.wilde', name: 'Oscar Wilde', epithet: 'The Wit' },
  { id: 'a.toulouse-lautrec', name: 'Henri de Toulouse-Lautrec', epithet: 'The Chronicler' },
  { id: 'a.pasteur', name: 'Louis Pasteur', epithet: 'The Scientist' },
  { id: 'a.foucault', name: 'Michel Foucault', epithet: 'The Philosopher' },
  { id: 'a.verlaine', name: 'Paul Verlaine', epithet: 'The Heretic', isHeretic: true },
];

export default function AbsinthePresentation() {
  const [speakers, setSpeakers] = useState<Speaker[]>(SPEAKER_CONFIG);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function loadSpeakerData() {
      try {
        const loadedSpeakers = await Promise.all(
          SPEAKER_CONFIG.map(async (speaker) => {
            try {
              const data = await fetchFacultyByHandleFromEdgeFunction(speaker.id);
              if (data) {
                return {
                  ...speaker,
                  voice: data.voice_id || 'en-US-GuyNeural',
                  voiceRate: data.voice_rate || 1.0,
                  bustFrontalUrl: data.bust_frontal_url || `/busts/${speaker.id.replace('a.', '')}/bust.png`,
                  bustRightUrl: data.bust_right_url || `/busts/${speaker.id.replace('a.', '')}/bust.png`,
                };
              }
            } catch (err) {
              console.warn(`Failed to load data for ${speaker.id}:`, err);
            }
            return {
              ...speaker,
              voice: 'en-US-GuyNeural',
              voiceRate: 1.0,
              bustFrontalUrl: `/busts/${speaker.id.replace('a.', '')}/bust.png`,
              bustRightUrl: `/busts/${speaker.id.replace('a.', '')}/bust.png`,
            };
          })
        );
        setSpeakers(loadedSpeakers);
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load speaker data:', err);
        setDataLoaded(true);
      }
    }
    loadSpeakerData();
  }, []);

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 200px)', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #2d5016 0%, #7fb069 100%)',
      color: '#f5f0e6'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'Cinzel, serif' }}>
        Symposion of the Green Fairy
      </h2>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
        The interactive presentation component is ready. Speech content for the seven witnesses is being prepared.
      </p>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        padding: '2rem', 
        borderRadius: '12px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>The Seven Witnesses</h3>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {speakers.map((speaker, idx) => (
            <li key={speaker.id} style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0 }}>{idx + 1}.</span>
              <strong>{speaker.name}</strong> — {speaker.epithet}
              {speaker.isHeretic && <span style={{ color: '#d4af37', marginLeft: '0.5rem' }}>💔</span>}
            </li>
          ))}
        </ul>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
        Full presentation with AI voices, animated busts, and real-time subtitles coming soon.
      </p>
    </div>
  );
}
