import React from 'react';
import type { 
  TShirtPanel, 
  CanvasElement, 
  EditorState, 
  PanelDesign,
  SideDesign,
  ShapeType
} from './types';
import { TShirtMockup } from './components/TShirtMockup';
import { AIPromptPanel } from './components/AIPromptPanel';
import { ExportPanel } from './components/ExportPanel';
import { SaveModal } from './components/SaveModal';
import { toJpeg, toPng } from 'html-to-image';
import { 
  Type, 
  Upload, 
  Plus, 
  Layers, 
  Settings2, 
  Undo2, 
  RefreshCw, 
  Palette, 
  Scissors,
  ImageDown,
  Square,
  Circle,
  Minus,
  Triangle,
  Star
} from 'lucide-react';

const FONT_PRESETS = [
  'Inter', 'Outfit', 'Anton', 'Bebas Neue', 'Pacifico', 
  'Satisfy', 'Orbitron', 'Bungee', 'Creepster', 'Playfair Display'
];

const COLOR_PALETTES = [
  // Whites & Grays
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Off White', color: '#f5f0e8' },
  { name: 'Light Gray', color: '#d1d5db' },
  { name: 'Silver', color: '#9ca3af' },
  { name: 'Dark Gray', color: '#4b5563' },
  { name: 'Charcoal', color: '#1f2937' },
  { name: 'Near Black', color: '#111827' },
  { name: 'Dark Void', color: '#09090e' },
  // Reds & Pinks
  { name: 'Crimson', color: '#ef4444' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Hot Pink', color: '#ec4899' },
  { name: 'Fuchsia', color: '#d946ef' },
  { name: 'Burgundy', color: '#7f1d1d' },
  { name: 'Salmon', color: '#fca5a5' },
  // Oranges & Yellows
  { name: 'Orange', color: '#f97316' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Cream', color: '#fef3c7' },
  { name: 'Gold', color: '#ca8a04' },
  // Greens
  { name: 'Acid Green', color: '#a3e635' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Forest', color: '#166534' },
  { name: 'Teal', color: '#14b8a6' },
  { name: 'Mint', color: '#6ee7b7' },
  { name: 'Olive', color: '#65a30d' },
  // Blues & Purples
  { name: 'Sky Blue', color: '#38bdf8' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Royal Blue', color: '#1d4ed8' },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Neon Purple', color: '#8b5cf6' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Electric Cyan', color: '#06b6d4' },
];

const INITIAL_PANEL = (color: string): PanelDesign => ({
  color,
  patternUrl: null,
  patternScale: 1.0,
  patternX: 0,
  patternY: 0
});

const INITIAL_SIDE = (baseColor: string): SideDesign => ({
  elements: [],
  panels: {
    body: INITIAL_PANEL(baseColor),
    'left-sleeve': INITIAL_PANEL(baseColor),
    'right-sleeve': INITIAL_PANEL(baseColor),
    collar: INITIAL_PANEL('#1e293b') // default dark collar
  }
});

export default function App() {
  const [editorState, setEditorState] = React.useState<EditorState>({
    view: 'front',
    front: INITIAL_SIDE('#ffffff'),
    back: INITIAL_SIDE('#ffffff'),
    selectedElementId: null,
    selectedPanel: 'body',
    activeTool: 'select'
  });

  const [newText, setNewText] = React.useState('ChromaThread');
  const [history, setHistory] = React.useState<Omit<EditorState, 'selectedElementId' | 'selectedPanel' | 'activeTool'>[]>([]);
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canvasAreaRef = React.useRef<HTMLDivElement>(null);

  const currentDesign = editorState.view === 'front' ? editorState.front : editorState.back;

  // Push to history for undo
  const saveToHistory = (stateToSave: EditorState) => {
    setHistory((prev) => [
      ...prev.slice(-19), // keep last 20 steps
      {
        view: stateToSave.view,
        front: JSON.parse(JSON.stringify(stateToSave.front)),
        back: JSON.parse(JSON.stringify(stateToSave.back))
      }
    ]);
  };

  // ==============================
  // SAVE AS JPEG / PNG WITH WATERMARK
  // ==============================
  const handleSaveImage = async (format: 'jpeg' | 'png', withWatermark: boolean) => {
    if (!canvasAreaRef.current) return;
    setIsSaving(true);

    try {
      const node = canvasAreaRef.current;
      let dataUrl: string;

      if (format === 'jpeg') {
        dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: '#0b0b10', pixelRatio: 2 });
      } else {
        dataUrl = await toPng(node, { backgroundColor: 'transparent', pixelRatio: 2 });
      }

      if (withWatermark) {
        // Draw watermark onto a canvas
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // Watermark style
        const fontSize = Math.round(canvas.width * 0.055);
        ctx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = fontSize * 0.04;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Rotate and tile watermark diagonally
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6); // -30 degrees
        const step = fontSize * 3.5;
        for (let y = -canvas.height; y < canvas.height; y += step) {
          for (let x = -canvas.width; x < canvas.width; x += step * 1.5) {
            ctx.strokeText('นำสมัย', x, y);
            ctx.fillText('นำสมัย', x, y);
          }
        }
        ctx.restore();

        dataUrl = format === 'jpeg'
          ? canvas.toDataURL('image/jpeg', 0.95)
          : canvas.toDataURL('image/png');
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `chromathread_${editorState.view}_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSaveModal(false);
    } catch (err) {
      console.error('Save image failed:', err);
      alert('ไม่สามารถบันทึกรูปได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setEditorState((prev) => ({
      ...prev,
      front: previous.front,
      back: previous.back
    }));
  };

  const updateSideDesign = (updates: Partial<SideDesign>) => {
    saveToHistory(editorState);
    const targetSide = editorState.view === 'front' ? 'front' : 'back';
    setEditorState((prev) => ({
      ...prev,
      [targetSide]: {
        ...prev[targetSide],
        ...updates
      }
    }));
  };

  // Element actions
  const handleAddText = () => {
    if (!newText.trim()) return;

    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 250,
      y: 200,
      width: Math.max(80, newText.length * 15),
      height: 40,
      rotation: 0,
      text: newText,
      fontSize: 32,
      fontFamily: 'Anton',
      fill: '#ffffff',
      letterSpacing: 0,
      fontWeight: 'normal'
    };

    updateSideDesign({
      elements: [...currentDesign.elements, newElement]
    });
    setEditorState((prev) => ({ ...prev, selectedElementId: newElement.id }));
    setNewText('');
  };

  const handleAddGraphic = (url: string) => {
    const newElement: CanvasElement = {
      id: `img_${Date.now()}`,
      type: 'image',
      x: 250,
      y: 250,
      width: 150,
      height: 150,
      rotation: 0,
      url
    };

    updateSideDesign({
      elements: [...currentDesign.elements, newElement]
    });
    setEditorState((prev) => ({ ...prev, selectedElementId: newElement.id }));
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const isLine = shapeType === 'line';
    const newElement: CanvasElement = {
      id: `shape_${Date.now()}`,
      type: 'shape',
      x: 250,
      y: 250,
      width: isLine ? 120 : 100,
      height: isLine ? 0 : 100,
      rotation: 0,
      shapeType,
      shapeFill: shapeType === 'line' ? 'none' : 'rgba(139,92,246,0.4)',
      shapeStroke: '#8b5cf6',
      shapeStrokeWidth: 3,
      shapeOpacity: 1,
    };
    updateSideDesign({
      elements: [...currentDesign.elements, newElement]
    });
    setEditorState((prev) => ({
      ...prev,
      selectedElementId: newElement.id,
      activeTool: 'select'
    }));
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    // Check if it's a delete operation
    if (updates.id === 'DELETE_FLAG') {
      updateSideDesign({
        elements: currentDesign.elements.filter((el) => el.id !== id)
      });
      return;
    }

    // Regular update
    const updatedElements = currentDesign.elements.map((el) => {
      if (el.id === id) {
        return { ...el, ...updates };
      }
      return el;
    });

    // Update state directly without saving full undo history for mouse dragging/resizing moves
    // (We only want discrete actions in history, but we still update elements)
    const targetSide = editorState.view === 'front' ? 'front' : 'back';
    setEditorState((prev) => ({
      ...prev,
      [targetSide]: {
        ...prev[targetSide],
        elements: updatedElements
      }
    }));
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleAddGraphic(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Panel design actions
  const handleUpdatePanel = (panelId: TShirtPanel, updates: Partial<PanelDesign>) => {
    saveToHistory(editorState);
    const updatedPanels = {
      ...currentDesign.panels,
      [panelId]: {
        ...currentDesign.panels[panelId],
        ...updates
      }
    };

    updateSideDesign({
      panels: updatedPanels
    });
  };

  const handleApplyColorAllPanels = (color: string) => {
    saveToHistory(editorState);
    const updatedPanels = { ...currentDesign.panels };
    (Object.keys(updatedPanels) as TShirtPanel[]).forEach((key) => {
      updatedPanels[key] = {
        ...updatedPanels[key],
        color
      };
    });

    updateSideDesign({
      panels: updatedPanels
    });
  };

  const handleClearPattern = (panelId: TShirtPanel) => {
    handleUpdatePanel(panelId, { patternUrl: null });
  };

  const handleClearAll = () => {
    if (window.confirm('Reset this side design?')) {
      updateSideDesign(INITIAL_SIDE('#ffffff'));
    }
  };

  const handleResetCollarColor = () => {
    handleUpdatePanel('collar', { color: '#1e293b' });
  };

  const activeElement = currentDesign.elements.find((el) => el.id === editorState.selectedElementId);

  return (
    <div className="app-container">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-header flex-col">
          <div className="flex-row items-center gap-sm">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scissors size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 800 }}>ChromaThread</h1>
              <p className="text-xs text-muted" style={{ fontSize: '11px', margin: 0 }}>AI Custom Print Designer</p>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Base Fabric Colors */}
          <div className="flex-col gap-sm">
            <h2 className="text-sm font-semibold text-muted flex-row items-center gap-sm" style={{ fontSize: '13px', margin: 0 }}>
              <Palette size={16} className="gradient-text" />
              สีผ้าเสื้อ
            </h2>
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="text-xs text-muted font-medium">กดสีเพื่อเปลี่ยนสีเสื้อทั้งตัว (32 สี)</span>
              <div className="color-grid">
                {COLOR_PALETTES.map((palette) => (
                  <div
                    key={palette.name}
                    className={`color-swatch ${currentDesign.panels.body.color === palette.color ? 'active' : ''}`}
                    style={{
                      backgroundColor: palette.color,
                      border: currentDesign.panels.body.color === palette.color
                        ? '2px solid var(--accent-purple)'
                        : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '5px',
                      width: '100%',
                      height: '22px',
                    }}
                    onClick={() => handleApplyColorAllPanels(palette.color)}
                    title={palette.name}
                  />
                ))}
              </div>
              <div className="flex-row items-center gap-sm" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <span className="text-xs text-muted">Custom:</span>
                <input
                  type="color"
                  onChange={(e) => handleApplyColorAllPanels(e.target.value)}
                  style={{ width: '30px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                  title="เลือกสีเอง"
                />
                <span className="text-xs text-muted">หรือ กดบนแขน/ปกเสื้อโดยตรงเพื่อเลือกสีแต่ละส่วน</span>
              </div>
            </div>
          </div>

          {/* Shape Drawing Tools */}
          <div className="flex-col gap-sm">
            <h2 className="text-sm font-semibold text-muted flex-row items-center gap-sm" style={{ fontSize: '13px', margin: 0 }}>
              <Square size={16} className="gradient-text" />
              เครื่องมือวาดรูปทรง
            </h2>
            <div className="glass-panel" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { type: 'rectangle' as const, label: 'สี่เหลี่ยม', icon: <Square size={18} /> },
                  { type: 'circle' as const, label: 'วงกลม', icon: <Circle size={18} /> },
                  { type: 'line' as const, label: 'เส้น', icon: <Minus size={18} /> },
                  { type: 'triangle' as const, label: 'สามเหลี่ยม', icon: <Triangle size={18} /> },
                  { type: 'star' as const, label: 'ดาว', icon: <Star size={18} /> },
                ].map((tool) => (
                  <button
                    key={tool.type}
                    className="tool-btn"
                    onClick={() => handleAddShape(tool.type)}
                    title={`เพิ่ม${tool.label}`}
                    style={{ minWidth: '54px' }}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                กดปุ่มเพื่อเพิ่มรูปทรงลงบนเสื้อ แล้วปรับสี/ขนาด/หมุนได้ในแผง Properties ด้านขวา
              </p>
            </div>
          </div>

          {/* AI Generation Box */}
          <div className="flex-col gap-sm">
            <h2 className="text-sm font-semibold text-muted flex-row items-center gap-sm" style={{ fontSize: '13px', margin: 0 }}>
              <Plus size={16} className="gradient-text" />
              AI Prompt Creator
            </h2>
            <div className="glass-panel" style={{ padding: '14px' }}>
              <AIPromptPanel
                selectedPanel={editorState.selectedPanel || 'body'}
                onApplyPattern={(url) => {
                  if (editorState.selectedPanel) {
                    handleUpdatePanel(editorState.selectedPanel, { patternUrl: url });
                  } else {
                    handleUpdatePanel('body', { patternUrl: url });
                  }
                }}
                onAddGraphic={handleAddGraphic}
              />
            </div>
          </div>

          {/* Upload Files */}
          <div className="flex-col gap-sm">
            <h2 className="text-sm font-semibold text-muted flex-row items-center gap-sm" style={{ fontSize: '13px', margin: 0 }}>
              <Upload size={16} className="gradient-text" />
              Upload Graphics
            </h2>
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Upload Logo / Graphic (PNG)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadImage}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </aside>

      {/* ================= CENTER WORKSPACE ================= */}
      <main className="workspace-container">
        {/* Workspace Toolbar */}
        <div className="workspace-toolbar">
          {/* View Toggles */}
          <div className="flex-row gap-sm items-center">
            <button
              className={`btn-secondary ${editorState.view === 'front' ? 'active font-semibold' : ''}`}
              onClick={() => setEditorState((prev) => ({ ...prev, view: 'front' }))}
              style={{
                borderColor: editorState.view === 'front' ? 'var(--accent-purple)' : 'var(--border-color)',
                background: editorState.view === 'front' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                padding: '6px 16px',
                fontSize: '13px'
              }}
            >
              Front View
            </button>
            <button
              className={`btn-secondary ${editorState.view === 'back' ? 'active font-semibold' : ''}`}
              onClick={() => setEditorState((prev) => ({ ...prev, view: 'back' }))}
              style={{
                borderColor: editorState.view === 'back' ? 'var(--accent-purple)' : 'var(--border-color)',
                background: editorState.view === 'back' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                padding: '6px 16px',
                fontSize: '13px'
              }}
            >
              Back View
            </button>
          </div>

          <div className="flex-row gap-sm items-center">
            {/* Save Image Button */}
            <button
              className="btn-primary"
              onClick={() => setShowSaveModal(true)}
              title="บันทึกเป็น JPEG / PNG"
              style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
            >
              <ImageDown size={16} />
              บันทึกรูป
            </button>

            {/* Undo Action */}
            <button
              className="btn-secondary"
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Undo Last Action"
              style={{ padding: '8px' }}
            >
              <Undo2 size={16} />
            </button>

            {/* Clear All */}
            <button
              className="btn-secondary"
              onClick={handleClearAll}
              title="Reset Editor"
              style={{ padding: '8px' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Mockup Canvas */}
        <div className="workspace-canvas-area" ref={canvasAreaRef} style={{ position: 'relative' }}>
          {/* Logo Watermark Background */}
          <img
            src="/logo.jpg"
            alt="นำสมัย logo"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.08,
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 0,
              filter: 'grayscale(100%) brightness(2)',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TShirtMockup
              view={editorState.view}
              design={currentDesign}
              selectedElementId={editorState.selectedElementId}
              selectedPanel={editorState.selectedPanel}
              activeTool={editorState.activeTool}
              onSelectPanel={(panel) => setEditorState((prev) => ({ ...prev, selectedPanel: panel }))}
              onSelectElement={(id) => setEditorState((prev) => ({ ...prev, selectedElementId: id }))}
              onUpdateElement={handleUpdateElement}
            />
          </div>
        </div>
      </main>

      {/* ================= RIGHT SIDEBAR ================= */}
      <aside className="sidebar sidebar-right">
        <div className="sidebar-header">
          <h2 className="text-sm font-semibold flex-row items-center gap-sm" style={{ margin: 0, fontSize: '15px' }}>
            <Settings2 size={16} className="gradient-text" />
            Properties Inspector
          </h2>
        </div>

        <div className="sidebar-content">
          {/* Add Text Card */}
          <div className="flex-col gap-sm">
            <span className="text-xs font-semibold text-muted">Add Typography</span>
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                className="glass-input w-full"
                placeholder="Enter text..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <button className="btn-primary w-full" onClick={handleAddText}>
                <Type size={16} />
                Add Text Box
              </button>
            </div>
          </div>

          {/* Active Element Properties */}
          {activeElement && (
            <div className="flex-col gap-sm">
              <span className="text-xs font-semibold text-muted">Selected: {activeElement.type.toUpperCase()} ELEMENT</span>
              <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeElement.type === 'text' && (
                  <>
                    {/* Text content editing */}
                    <div className="flex-col gap-sm">
                      <span className="text-xs text-muted">Text Value</span>
                      <input
                        type="text"
                        className="glass-input"
                        value={activeElement.text || ''}
                        onChange={(e) => handleUpdateElement(activeElement.id, { 
                          text: e.target.value,
                          width: Math.max(80, e.target.value.length * (activeElement.fontSize || 14) * 0.6)
                        })}
                      />
                    </div>

                    {/* Font Family selector */}
                    <div className="flex-col gap-sm">
                      <span className="text-xs text-muted">Font Family</span>
                      <select
                        className="glass-input"
                        value={activeElement.fontFamily || 'Inter'}
                        onChange={(e) => handleUpdateElement(activeElement.id, { fontFamily: e.target.value })}
                        style={{ fontFamily: activeElement.fontFamily }}
                      >
                        {FONT_PRESETS.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </select>
                    </div>

                    {/* Typography Font Color */}
                    <div className="flex-col gap-sm">
                      <span className="text-xs text-muted">Fill Color</span>
                      <div className="flex-row items-center gap-sm">
                        <input
                          type="color"
                          value={activeElement.fill || '#ffffff'}
                          onChange={(e) => handleUpdateElement(activeElement.id, { fill: e.target.value })}
                          style={{
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                          }}
                        />
                        <span className="text-xs font-mono">{activeElement.fill}</span>
                      </div>
                    </div>

                    {/* Font size slider */}
                    <div className="flex-col gap-sm">
                      <div className="flex-row justify-between text-xs text-muted">
                        <span>Font Size</span>
                        <span>{activeElement.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={activeElement.fontSize || 24}
                        onChange={(e) => {
                          const size = parseInt(e.target.value);
                          handleUpdateElement(activeElement.id, { 
                            fontSize: size,
                            width: (activeElement.text || '').length * size * 0.6,
                            height: size * 1.2
                          });
                        }}
                        style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                      />
                    </div>

                    {/* Letter spacing slider */}
                    <div className="flex-col gap-sm">
                      <div className="flex-row justify-between text-xs text-muted">
                        <span>Letter Spacing</span>
                        <span>{activeElement.letterSpacing || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="15"
                        value={activeElement.letterSpacing || 0}
                        onChange={(e) => handleUpdateElement(activeElement.id, { letterSpacing: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                      />
                    </div>
                  </>
                )}

                {/* SHAPE PROPERTIES */}
                {activeElement.type === 'shape' && (
                  <>
                    {/* Fill Color */}
                    <div className="flex-col gap-sm">
                      <span className="text-xs text-muted">สีเติม (Fill)</span>
                      <div className="flex-row items-center gap-sm">
                        <input
                          type="color"
                          value={activeElement.shapeFill === 'none' ? '#8b5cf6' : (activeElement.shapeFill || '#8b5cf6')}
                          onChange={(e) => handleUpdateElement(activeElement.id, { shapeFill: e.target.value })}
                          style={{ border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateElement(activeElement.id, { shapeFill: 'none' })}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          ไม่มีสีเติม
                        </button>
                        <span className="text-xs font-mono">{activeElement.shapeFill}</span>
                      </div>
                    </div>

                    {/* Stroke Color */}
                    <div className="flex-col gap-sm">
                      <span className="text-xs text-muted">สีเส้นขอบ (Stroke)</span>
                      <div className="flex-row items-center gap-sm">
                        <input
                          type="color"
                          value={activeElement.shapeStroke || '#8b5cf6'}
                          onChange={(e) => handleUpdateElement(activeElement.id, { shapeStroke: e.target.value })}
                          style={{ border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer' }}
                        />
                        <span className="text-xs font-mono">{activeElement.shapeStroke}</span>
                      </div>
                    </div>

                    {/* Stroke Width */}
                    <div className="flex-col gap-sm">
                      <div className="flex-row justify-between text-xs text-muted">
                        <span>ความหนาเส้น</span>
                        <span>{activeElement.shapeStrokeWidth ?? 3}px</span>
                      </div>
                      <input
                        type="range" min="0" max="20" step="0.5"
                        value={activeElement.shapeStrokeWidth ?? 3}
                        onChange={(e) => handleUpdateElement(activeElement.id, { shapeStrokeWidth: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                      />
                    </div>

                    {/* Opacity */}
                    <div className="flex-col gap-sm">
                      <div className="flex-row justify-between text-xs text-muted">
                        <span>ความโปร่งใส</span>
                        <span>{Math.round((activeElement.shapeOpacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={activeElement.shapeOpacity ?? 1}
                        onChange={(e) => handleUpdateElement(activeElement.id, { shapeOpacity: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                      />
                    </div>

                    {/* Width & Height */}
                    <div className="flex-col gap-sm">
                      <div className="flex-row justify-between text-xs text-muted">
                        <span>ขนาด (กว้าง)</span>
                        <span>{Math.round(activeElement.width)}px</span>
                      </div>
                      <input
                        type="range" min="10" max="300"
                        value={activeElement.width}
                        onChange={(e) => handleUpdateElement(activeElement.id, { width: parseInt(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                      />
                    </div>
                    {activeElement.shapeType !== 'line' && (
                      <div className="flex-col gap-sm">
                        <div className="flex-row justify-between text-xs text-muted">
                          <span>ขนาด (สูง)</span>
                          <span>{Math.round(activeElement.height)}px</span>
                        </div>
                        <input
                          type="range" min="10" max="300"
                          value={activeElement.height}
                          onChange={(e) => handleUpdateElement(activeElement.id, { height: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Shared Rotation Control */}
                <div className="flex-col gap-sm">
                  <div className="flex-row justify-between text-xs text-muted">
                    <span>Rotation Angle</span>
                    <span>{activeElement.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={activeElement.rotation}
                    onChange={(e) => handleUpdateElement(activeElement.id, { rotation: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  className="btn-danger w-full mt-sm"
                  onClick={() => handleUpdateElement(activeElement.id, { id: 'DELETE_FLAG' })}
                >
                  Remove Element
                </button>
              </div>
            </div>
          )}

          {/* Active Panel Properties */}
          {(() => {
            const selectedPanel = editorState.selectedPanel;
            if (!selectedPanel || activeElement) return null;
            const panelDesign = currentDesign.panels[selectedPanel];
            return (
              <div className="flex-col gap-sm">
                <span className="text-xs font-semibold text-muted">
                  Styling Panel: <strong className="gradient-text">{selectedPanel.toUpperCase()}</strong>
                </span>
                <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Panel Color */}
                  <div className="flex-col gap-sm">
                    <span className="text-xs text-muted">Fabric Base Color</span>
                    <div className="flex-row items-center gap-sm">
                      <input
                        type="color"
                        value={panelDesign.color}
                        onChange={(e) => handleUpdatePanel(selectedPanel, { color: e.target.value })}
                        style={{
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: 'transparent'
                        }}
                      />
                      <span className="text-xs font-mono">{panelDesign.color}</span>
                      
                      {selectedPanel === 'collar' && (
                        <button 
                          className="btn-secondary" 
                          onClick={handleResetCollarColor} 
                          style={{ padding: '4px 8px', fontSize: '10px', marginLeft: 'auto' }}
                        >
                          Reset Collar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If Panel has pattern, show alignment options */}
                  {panelDesign.patternUrl ? (
                    <>
                      <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px 0 0' }}>
                        <span className="text-xs font-semibold text-muted">Pattern Placement Settings</span>
                      </div>

                      {/* Pattern Scale */}
                      <div className="flex-col gap-sm">
                        <div className="flex-row justify-between text-xs text-muted">
                          <span>Pattern Zoom</span>
                          <span>{Math.round(panelDesign.patternScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="3.0"
                          step="0.05"
                          value={panelDesign.patternScale}
                          onChange={(e) => handleUpdatePanel(selectedPanel, { patternScale: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                        />
                      </div>

                      {/* Offset X */}
                      <div className="flex-col gap-sm">
                        <div className="flex-row justify-between text-xs text-muted">
                          <span>Align X Offset</span>
                          <span>{panelDesign.patternX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          value={panelDesign.patternX}
                          onChange={(e) => handleUpdatePanel(selectedPanel, { patternX: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                        />
                      </div>

                      {/* Offset Y */}
                      <div className="flex-col gap-sm">
                        <div className="flex-row justify-between text-xs text-muted">
                          <span>Align Y Offset</span>
                          <span>{panelDesign.patternY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          value={panelDesign.patternY}
                          onChange={(e) => handleUpdatePanel(selectedPanel, { patternY: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                        />
                      </div>

                      {/* Delete Pattern */}
                      <button
                        type="button"
                        className="btn-danger w-full mt-sm"
                        onClick={() => handleClearPattern(selectedPanel)}
                      >
                        Remove Background Pattern
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted text-center" style={{ padding: '8px 0' }}>
                      No background pattern applied. Use the AI Creator in the left panel to generate one.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Active Layer elements overview list */}
          <div className="flex-col gap-sm">
            <span className="text-xs font-semibold text-muted flex-row items-center gap-sm">
              <Layers size={14} /> Layers Stack
            </span>
            <div className="glass-panel" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {currentDesign.elements.length === 0 ? (
                <span className="text-xs text-muted text-center" style={{ padding: '12px 0' }}>
                  No elements added yet.
                </span>
              ) : (
                currentDesign.elements.map((el) => (
                  <div
                    key={el.id}
                    className={`layer-item ${editorState.selectedElementId === el.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditorState((prev) => ({ ...prev, selectedElementId: el.id }));
                    }}
                  >
                    <span className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {el.type === 'text' ? <Type size={12} /> : <Layers size={12} />}
                      {el.type === 'text' ? `Text: "${el.text?.substring(0, 10)}..."` : 'Graphic Image'}
                    </span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateElement(el.id, { id: 'DELETE_FLAG' });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Illustrator Vector Export Card */}
          <div className="mt-md" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <ExportPanel editorState={editorState} />
          </div>
        </div>
      </aside>
      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveImage}
        isSaving={isSaving}
      />
    </div>
  );
}
