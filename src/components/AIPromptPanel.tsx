import React from 'react';
import { Sparkles, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import type { TShirtPanel } from '../types';

interface AIPromptPanelProps {
  selectedPanel: TShirtPanel;
  onApplyPattern: (url: string) => void;
  onAddGraphic: (url: string) => void;
}

const PRESET_STYLES = [
  { name: 'Cyberpunk', term: 'cyberpunk synthwave aesthetic, neon lights, highly detailed vector illustration, 8k' },
  { name: 'Vaporwave', term: '90s vaporwave aesthetic, pastel gradients, retro grid, wireframe, vector art' },
  { name: 'Anime', term: 'modern anime style graphic, bold lineart, vibrant colors, flat shading, manga vector' },
  { name: 'Streetwear', term: 'modern streetwear brand graphic, typography elements, gothic punk, grunge vector, black and white' },
  { name: 'Abstract', term: 'minimalist abstract pattern, organic shapes, harmonious earth tone color scheme, fluid vector' },
  { name: 'Retro Vintage', term: 'retro 70s vintage vector graphic, distressed texture, warm summer colors, distressed stamp' },
  { name: 'Sakura Floral', term: 'japanese cherry blossom floral pattern, traditional ink wash vector illustration, gold accent' }
];

export const AIPromptPanel: React.FC<AIPromptPanelProps> = ({
  selectedPanel,
  onApplyPattern,
  onAddGraphic,
}) => {
  const [prompt, setPrompt] = React.useState('');
  const [selectedStyle, setSelectedStyle] = React.useState<string>('');
  const [applyMode, setApplyMode] = React.useState<'pattern' | 'graphic'>('pattern');
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>([]);
  const [statusText, setStatusText] = React.useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStatusText('Consulting AI model...');

    // Construct full prompt based on chosen presets
    const styleObj = PRESET_STYLES.find((s) => s.name === selectedStyle);
    const styleAddendum = styleObj ? `, ${styleObj.term}` : '';
    const fullPrompt = `${prompt}${styleAddendum}`;

    // Pollinations AI URL
    const seed = Math.floor(Math.random() * 1000000);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    try {
      setStatusText('Generating graphic assets...');
      
      // Load image in background to ensure it is fetched before rendering
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = generatedUrl;
        img.crossOrigin = 'anonymous'; // request CORS access
        img.onload = resolve;
        img.onerror = reject;
      });

      setStatusText('Applying design to canvas...');
      
      if (applyMode === 'pattern') {
        onApplyPattern(generatedUrl);
      } else {
        onAddGraphic(generatedUrl);
      }

      setHistory((prev) => [generatedUrl, ...prev.slice(0, 5)]);
      setStatusText('');
    } catch (error) {
      console.error('Image load failed', error);
      setStatusText('Failed to fetch. Applying direct fallback link...');
      // Fallback: apply directly anyway
      if (applyMode === 'pattern') {
        onApplyPattern(generatedUrl);
      } else {
        onAddGraphic(generatedUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (styleName: string) => {
    if (selectedStyle === styleName) {
      setSelectedStyle('');
    } else {
      setSelectedStyle(styleName);
    }
  };

  return (
    <div className="flex-col gap-md">
      <div className="flex-col gap-sm">
        <label className="text-sm font-semibold text-muted">1. Choose AI Generation Mode</label>
        <div className="flex-row gap-sm w-full">
          <button
            type="button"
            className={`btn-secondary flex-1 justify-center gap-sm ${applyMode === 'pattern' ? 'active font-semibold' : ''}`}
            onClick={() => setApplyMode('pattern')}
            style={{
              borderColor: applyMode === 'pattern' ? 'var(--accent-purple)' : 'var(--border-color)',
              background: applyMode === 'pattern' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <LayoutGrid size={16} />
            Background Pattern
          </button>
          <button
            type="button"
            className={`btn-secondary flex-1 justify-center gap-sm ${applyMode === 'graphic' ? 'active font-semibold' : ''}`}
            onClick={() => setApplyMode('graphic')}
            style={{
              borderColor: applyMode === 'graphic' ? 'var(--accent-purple)' : 'var(--border-color)',
              background: applyMode === 'graphic' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <ImageIcon size={16} />
            Chest Graphic
          </button>
        </div>
      </div>

      <div className="flex-col gap-sm">
        <label className="text-sm font-semibold text-muted">2. Select Design Aesthetic Preset (Optional)</label>
        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
          {PRESET_STYLES.map((style) => (
            <span
              key={style.name}
              className={`prompt-preset-tag ${selectedStyle === style.name ? 'active' : ''}`}
              onClick={() => handleSelectPreset(style.name)}
            >
              {style.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-col gap-sm">
        <label className="text-sm font-semibold text-muted">3. Write Creative Prompt</label>
        <textarea
          className="glass-input w-full"
          rows={3}
          placeholder="e.g., Japanese cyberpunk white dragon wrapping around, neon magenta flame background..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
        />
      </div>

      <button
        type="button"
        className="btn-primary w-full py-md mt-sm"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? (
          <div className="flex-row items-center gap-md">
            <div className="loading-wave">
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
            </div>
            <span style={{ fontSize: '13px' }}>{statusText}</span>
          </div>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Design with AI
          </>
        )}
      </button>

      {applyMode === 'pattern' && !loading && (
        <span className="text-xs text-center text-muted" style={{ display: 'block', marginTop: '-8px' }}>
          Applying pattern to current selected panel: <strong className="gradient-text">{selectedPanel.toUpperCase()}</strong>
        </span>
      )}

      {history.length > 0 && (
        <div className="flex-col gap-sm mt-md">
          <label className="text-sm font-semibold text-muted">Recently Generated Designs</label>
          <div className="flex-row" style={{ gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {history.map((url, index) => (
              <div
                key={index}
                className="glass-panel"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
                onClick={() => {
                  if (applyMode === 'pattern') {
                    onApplyPattern(url);
                  } else {
                    onAddGraphic(url);
                  }
                }}
              >
                <img src={url} alt="History item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
