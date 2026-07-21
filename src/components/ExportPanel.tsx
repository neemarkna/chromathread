import React from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import type { EditorState, TShirtPanel } from '../types';
import { PANEL_PATHS } from './TShirtMockup';

interface ExportPanelProps {
  editorState: EditorState;
}

// Convert image URL to Base64 Data URL to allow Illustrator to display embedded graphics offline
async function convertUrlToBase64(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('CORS or fetch error converting to base64, using raw URL instead:', error);
    return url; // fallback to original url
  }
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ editorState }) => {
  const [exporting, setExporting] = React.useState(false);
  const [progress, setProgress] = React.useState('');

  const handleExportSVG = async () => {
    setExporting(true);
    setProgress('Converting design graphics to Base64 vector-embeds...');

    const { view, front, back } = editorState;
    const currentDesign = view === 'front' ? front : back;

    try {
      // 1. Process and convert all active panel patterns to base64 data URIs
      const processedPanels = { ...currentDesign.panels };
      const panelKeys = Object.keys(processedPanels) as TShirtPanel[];
      
      for (const key of panelKeys) {
        const panel = processedPanels[key];
        if (panel.patternUrl) {
          setProgress(`Converting ${key} pattern...`);
          const base64Pattern = await convertUrlToBase64(panel.patternUrl);
          processedPanels[key] = {
            ...panel,
            patternUrl: base64Pattern,
          };
        }
      }

      // 2. Process and convert all floating image elements to base64 data URIs
      setProgress('Converting floating chest graphics...');
      const processedElements = await Promise.all(
        currentDesign.elements.map(async (elem) => {
          if (elem.type === 'image' && elem.url) {
            const base64Img = await convertUrlToBase64(elem.url);
            return { ...elem, url: base64Img };
          }
          return elem;
        })
      );

      setProgress('Generating layered SVG XML structural nodes...');

      // 3. Construct SVG definitions XML
      const fontList = Array.from(new Set(
        processedElements
          .filter((el) => el.type === 'text' && el.fontFamily)
          .map((el) => el.fontFamily)
      ));

      let fontsImport = '';
      if (fontList.length > 0) {
        const fontQuery = fontList.map((f) => f?.replace(/ /g, '+')).join('&family=');
        fontsImport = `@import url('https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap');`;
      }

      let patternsDefsXml = '';
      Object.entries(processedPanels).forEach(([panelKey, design]) => {
        if (!design.patternUrl) return;
        patternsDefsXml += `
    <pattern 
      id="pattern-${panelKey}-${view}" 
      width="${120 * design.patternScale}" 
      height="${120 * design.patternScale}" 
      patternUnits="userSpaceOnUse"
      patternTransform="translate(${design.patternX}, ${design.patternY})"
    >
      <image 
        href="${design.patternUrl}" 
        width="${120 * design.patternScale}" 
        height="${120 * design.patternScale}" 
        preserveAspectRatio="xMidYMid slice" 
      />
    </pattern>`;
      });

      // 4. Construct Canvas Elements SVG Layer
      let elementsXml = '';
      processedElements.forEach((el) => {
        if (el.type === 'text') {
          elementsXml += `
    <g transform="rotate(${el.rotation}, ${el.x}, ${el.y})">
      <text 
        x="${el.x}" 
        y="${el.y}" 
        font-family="${el.fontFamily || 'Inter'}" 
        font-size="${el.fontSize || 24}" 
        fill="${el.fill || '#ffffff'}" 
        font-weight="${el.fontWeight || 'normal'}"
        letter-spacing="${el.letterSpacing || 0}"
        text-anchor="middle" 
        dominant-baseline="middle"
      >${el.text}</text>
    </g>`;
        } else if (el.type === 'image' && el.url) {
          elementsXml += `
    <g transform="rotate(${el.rotation}, ${el.x}, ${el.y})">
      <image 
        href="${el.url}" 
        x="${el.x - el.width / 2}" 
        y="${el.y - el.height / 2}" 
        width="${el.width}" 
        height="${el.height}" 
        preserveAspectRatio="xMidYMid meet" 
      />
    </g>`;
        }
      });

      // 5. Construct Solid Color panel paths
      let solidPanelsXml = '';
      let patternPanelsXml = '';
      
      Object.entries(PANEL_PATHS[view]).forEach(([panelKey, pInfo]) => {
        const panelId = panelKey as TShirtPanel;
        const design = processedPanels[panelId];
        
        solidPanelsXml += `
      <path id="solid-${panelId}" d="${pInfo.d}" fill="${design.color}" />`;
        
        if (design.patternUrl) {
          patternPanelsXml += `
      <path id="pattern-${panelId}" d="${pInfo.d}" fill="url(#pattern-${panelId}-${view})" />`;
        }
      });

      // 6. Complete standard SVG assembly with labeled layer groups for Illustrator
      const finalSvgXml = `<?xml version="1.0" encoding="utf-8"?>
<svg 
  version="1.1" 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  x="0px" 
  y="0px" 
  viewBox="0 0 500 500" 
  xml:space="preserve"
>
  <defs>
    <style type="text/css">
      ${fontsImport}
      .shading-layer { mix-blend-mode: multiply; }
      .texture-layer { mix-blend-mode: overlay; }
    </style>
    
    <linearGradient id="inner-collar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0d" />
      <stop offset="100%" stop-color="#1e1e24" />
    </linearGradient>

    <linearGradient id="shading-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="15%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
      <stop offset="85%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
    </linearGradient>

    <pattern id="fabric-texture" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M0 4 L4 0 M0 0 L4 4" stroke="#ffffff" stroke-width="0.5" opacity="0.04" />
    </pattern>

    <clipPath id="clip-tshirt-all">
      <path d="${PANEL_PATHS[view]['body'].d}" />
      <path d="${PANEL_PATHS[view]['left-sleeve'].d}" />
      <path d="${PANEL_PATHS[view]['right-sleeve'].d}" />
      <path d="${PANEL_PATHS[view]['collar'].d}" />
    </clipPath>
    
    ${patternsDefsXml}
  </defs>

  <!-- LAYER 1: BASE SHIRT SOLID COLOR -->
  <g id="Layer_1_Base_Colors">
    ${view === 'front' ? '<path d="M 200,90 Q 250,120 300,90 Q 250,85 200,90 Z" fill="url(#inner-collar-grad)" />' : ''}
    ${solidPanelsXml}
  </g>

  <!-- LAYER 2: SHIRT PRINT PATTERNS -->
  <g id="Layer_2_Patterns">
    ${patternPanelsXml}
  </g>

  <!-- LAYER 3: PLACED GRAPHICS & TEXT (Clipped inside T-Shirt outline) -->
  <g id="Layer_3_Design_Elements" clip-path="url(#clip-tshirt-all)">
    ${elementsXml}
  </g>

  <!-- LAYER 4: 3D SHADING & FABRIC folds (Can be hidden in Illustrator for clean flat print) -->
  <g id="Layer_4_Mockup_Shading" clip-path="url(#clip-tshirt-all)" opacity="0.9" style="pointer-events: none;">
    <!-- Cylindrical lighting -->
    <path d="${PANEL_PATHS[view]['body'].d}" fill="url(#shading-grad)" class="shading-layer" />
    <path d="${PANEL_PATHS[view]['left-sleeve'].d}" fill="url(#shading-grad)" class="shading-layer" opacity="0.5" />
    <path d="${PANEL_PATHS[view]['right-sleeve'].d}" fill="url(#shading-grad)" class="shading-layer" opacity="0.5" />
    
    <!-- Fabric grid texture -->
    <rect width="500" height="500" fill="url(#fabric-texture)" class="texture-layer" />
    
    <!-- 3D fold lines -->
    <path d="M 252,105 Q 248,260 250,420" stroke="black" stroke-width="2.5" fill="none" opacity="0.08" />
    <path d="M 252,105 Q 248,260 250,420" stroke="white" stroke-width="1" fill="none" opacity="0.04" />
    <path d="M 150,110 Q 140,160 120,200" stroke="black" stroke-width="2" fill="none" opacity="0.08" />
    <path d="M 350,110 Q 360,160 380,200" stroke="black" stroke-width="2" fill="none" opacity="0.08" />
    <path d="M 175,200 Q 210,230 190,260" stroke="black" stroke-width="3" fill="none" opacity="0.1" />
    <path d="M 175,200 Q 210,230 190,260" stroke="white" stroke-width="1" fill="none" opacity="0.05" />
    <path d="M 325,200 Q 290,230 310,260" stroke="black" stroke-width="3" fill="none" opacity="0.1" />
    <path d="M 325,200 Q 290,230 310,260" stroke="white" stroke-width="1" fill="none" opacity="0.05" />
    <path d="M 180,410 Q 220,418 250,405" stroke="black" stroke-width="2" fill="none" opacity="0.07" />
    <path d="M 245,412 Q 285,420 320,408" stroke="black" stroke-width="2" fill="none" opacity="0.07" />
  </g>
</svg>`;

      // 7. Trigger download
      const blob = new Blob([finalSvgXml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chromathread_${view}_design_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export SVG failed:', err);
      alert('Could not package SVG. Try removing some high-resolution patterns.');
    } finally {
      setExporting(false);
      setProgress('');
    }
  };

  return (
    <div className="flex-col gap-sm">
      <h3 className="text-sm font-semibold text-muted" style={{ margin: '0 0 4px' }}>Export Design Files</h3>
      <div className="flex-col gap-sm">
        <button
          type="button"
          className="btn-primary w-full py-md"
          onClick={handleExportSVG}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span style={{ fontSize: '12px' }}>{progress}</span>
            </>
          ) : (
            <>
              <Download size={18} />
              Download Illustrator SVG
            </>
          )}
        </button>

        <span className="text-xs text-muted" style={{ display: 'flex', gap: '6px', lineHeight: '1.4' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          This SVG contains separate, layered vector outlines, colors, vector text, and high-res embedded graphics. You can hide the 3D Shading layer in Illustrator for a flat print file.
        </span>
      </div>
    </div>
  );
};
