import React from 'react';
import type { TShirtView, TShirtPanel, CanvasElement, SideDesign } from '../types';

interface TShirtMockupProps {
  view: TShirtView;
  design: SideDesign;
  selectedElementId: string | null;
  selectedPanel: TShirtPanel | null;
  activeTool?: string;
  onSelectPanel: (panel: TShirtPanel) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onAddElementAtPos?: (x: number, y: number) => void;
}

export const PANEL_PATHS: Record<
  TShirtView,
  Record<TShirtPanel, { d: string; label: string }>
> = {
  front: {
    body: {
      d: 'M 200,90 Q 250,120 300,90 L 350,110 Q 335,160 325,200 L 325,430 Q 250,442 175,430 L 175,200 Q 165,160 150,110 Z',
      label: 'Body',
    },
    'left-sleeve': {
      d: 'M 150,110 L 100,180 L 125,210 L 175,200 Q 165,160 150,110 Z',
      label: 'Left Sleeve',
    },
    'right-sleeve': {
      d: 'M 350,110 L 400,180 L 375,210 L 325,200 Q 335,160 350,110 Z',
      label: 'Right Sleeve',
    },
    collar: {
      d: 'M 200,90 Q 250,120 300,90 L 303,87 Q 250,125 197,87 Z',
      label: 'Collar',
    },
  },
  back: {
    body: {
      d: 'M 200,90 Q 250,96 300,90 L 350,110 Q 335,160 325,200 L 325,430 Q 250,442 175,430 L 175,200 Q 165,160 150,110 Z',
      label: 'Body',
    },
    'left-sleeve': {
      d: 'M 150,110 L 100,180 L 125,210 L 175,200 Q 165,160 150,110 Z',
      label: 'Left Sleeve',
    },
    'right-sleeve': {
      d: 'M 350,110 L 400,180 L 375,210 L 325,200 Q 335,160 350,110 Z',
      label: 'Right Sleeve',
    },
    collar: {
      d: 'M 200,90 Q 250,96 300,90 L 303,87 Q 250,91 197,87 Z',
      label: 'Collar',
    },
  },
};

export const TShirtMockup: React.FC<TShirtMockupProps> = ({
  view,
  design,
  selectedElementId,
  selectedPanel,
  onSelectPanel,
  onSelectElement,
  onUpdateElement,
}) => {
  const { panels, elements } = design;

  // Track transform states for dragging and resizing
  const [dragState, setDragState] = React.useState<{
    elementId: string;
    startX: number;
    startY: number;
    startElemX: number;
    startElemY: number;
    type: 'move' | 'resize' | 'rotate';
    startWidth?: number;
    startHeight?: number;
    startRotation?: number;
    centerX?: number;
    centerY?: number;
  } | null>(null);

  const svgRef = React.useRef<SVGSVGElement>(null);

  // Mouse Move and Up event handlers
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !svgRef.current) return;

      // Get SVG coordinates
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 500 / rect.width;
      const scaleY = 500 / rect.height;
      const currentX = (e.clientX - rect.left) * scaleX;
      const currentY = (e.clientY - rect.top) * scaleY;

      const element = elements.find((el) => el.id === dragState.elementId);
      if (!element) return;

      const startSvgX = (dragState.startX - rect.left) * scaleX;
      const startSvgY = (dragState.startY - rect.top) * scaleY;

      const dx = currentX - startSvgX;
      const dy = currentY - startSvgY;

      if (dragState.type === 'move') {
        onUpdateElement(dragState.elementId, {
          x: Math.max(20, Math.min(480, dragState.startElemX + dx)),
          y: Math.max(20, Math.min(480, dragState.startElemY + dy)),
        });
      } else if (dragState.type === 'resize') {
        // Calculate new scale based on distance from center
        const cx = element.x;
        const cy = element.y;
        
        // Calculate distance from center to current cursor vs start cursor
        const startDist = Math.hypot(startSvgX - cx, startSvgY - cy);
        const currentDist = Math.hypot(currentX - cx, currentY - cy);
        const ratio = currentDist / (startDist || 1);

        const newWidth = Math.max(30, (dragState.startWidth || 100) * ratio);
        const newHeight = Math.max(15, (dragState.startHeight || 50) * ratio);

        // Auto-scale text font size along with resize
        if (element.type === 'text') {
          const fontRatio = newHeight / (dragState.startHeight || 50);
          const startFontSize = element.fontSize || 24;
          onUpdateElement(dragState.elementId, {
            width: newWidth,
            height: newHeight,
            fontSize: Math.max(10, Math.round(startFontSize * fontRatio)),
          });
        } else {
          onUpdateElement(dragState.elementId, {
            width: newWidth,
            height: newHeight,
          });
        }
      } else if (dragState.type === 'rotate') {
        // Calculate rotation angle
        const cx = element.x;
        const cy = element.y;
        const angleRad = Math.atan2(currentY - cy, currentX - cx);
        let angleDeg = (angleRad * 180) / Math.PI;
        
        // Adjust for handle initial offset (which is pointing straight up -90deg)
        angleDeg = (angleDeg + 90) % 360;
        
        onUpdateElement(dragState.elementId, {
          rotation: Math.round(angleDeg),
        });
      }
    };

    const handleMouseUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, elements, onUpdateElement]);

  const handleStartMove = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: element.x,
      startElemY: element.y,
      type: 'move',
    });
  };

  const handleStartResize = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: element.x,
      startElemY: element.y,
      startWidth: element.width,
      startHeight: element.height,
      type: 'resize',
    });
  };

  const handleStartRotate = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      startElemX: element.x,
      startElemY: element.y,
      startRotation: element.rotation,
      type: 'rotate',
    });
  };

  const handleDeleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(null);
    onUpdateElement(id, { id: 'DELETE_FLAG' }); // Signal App component to delete
  };

  // Helper: check if element is selected
  const activeElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className="tshirt-svg-container" onClick={() => { onSelectElement(null); onSelectPanel('body'); }}>
      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="tshirt-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Inner collar background shading */}
          <linearGradient id="inner-collar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#1e1e24" />
          </linearGradient>

          {/* 3D cylindrical lighting shading gradient */}
          <linearGradient id="shading-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
            <stop offset="15%" stopColor="#000" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>

          {/* Fabric structure pattern overlay */}
          <pattern id="fabric-texture" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0 4 L4 0 M0 0 L4 4" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
          </pattern>

          {/* Define Clip Paths for each panel */}
          <clipPath id="clip-body">
            <path d={PANEL_PATHS[view]['body'].d} />
          </clipPath>
          <clipPath id="clip-left-sleeve">
            <path d={PANEL_PATHS[view]['left-sleeve'].d} />
          </clipPath>
          <clipPath id="clip-right-sleeve">
            <path d={PANEL_PATHS[view]['right-sleeve'].d} />
          </clipPath>
          <clipPath id="clip-collar">
            <path d={PANEL_PATHS[view]['collar'].d} />
          </clipPath>

          {/* Combined ClipPath for all design elements to clip cleanly within the shirt outline */}
          <clipPath id="clip-tshirt-all">
            <path d={PANEL_PATHS[view]['body'].d} />
            <path d={PANEL_PATHS[view]['left-sleeve'].d} />
            <path d={PANEL_PATHS[view]['right-sleeve'].d} />
            <path d={PANEL_PATHS[view]['collar'].d} />
          </clipPath>

          {/* Render individual pattern defs */}
          {Object.entries(panels).map(([panelKey, design]) => {
            const panelId = panelKey as TShirtPanel;
            if (!design.patternUrl) return null;
            return (
              <pattern
                key={`${panelId}-${view}`}
                id={`pattern-${panelId}-${view}`}
                width={120 * design.patternScale}
                height={120 * design.patternScale}
                patternUnits="userSpaceOnUse"
                patternTransform={`translate(${design.patternX}, ${design.patternY})`}
              >
                <image
                  href={design.patternUrl}
                  width={120 * design.patternScale}
                  height={120 * design.patternScale}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            );
          })}
        </defs>

        {/* ================= BACKGROUND / INNER NECK ================= */}
        {view === 'front' && (
          <path
            d="M 200,90 Q 250,120 300,90 Q 250,85 200,90 Z"
            fill="url(#inner-collar-grad)"
          />
        )}

        {Object.entries(PANEL_PATHS[view]).map(([panelKey, pInfo]) => {
          const panelId = panelKey as TShirtPanel;
          const design = panels[panelId];

          return (
            <g key={panelId}>
              {/* Base panel color */}
              <path
                d={pInfo.d}
                fill={design.color}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPanel(panelId);
                }}
                className="shirt-panel-body"
                style={{ cursor: 'pointer' }}
              />
              
              {/* Pattern fill overlay (rendered on top of base color if url exists) */}
              {design.patternUrl && (
                <path
                  d={pInfo.d}
                  fill={`url(#pattern-${panelId}-${view})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPanel(panelId);
                  }}
                  className="shirt-panel-body"
                  style={{ cursor: 'pointer', mixBlendMode: 'normal' }}
                />
              )}
            </g>
          );
        })}

        {/* ================= DESIGN ELEMENTS LAYER (Draggable Text & Images) ================= */}
        <g clipPath="url(#clip-tshirt-all)">
          {elements.map((element) => {
            const handleElementClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              onSelectElement(element.id);
            };

            if (element.type === 'text') {
              return (
                <g
                  key={element.id}
                  transform={`rotate(${element.rotation}, ${element.x}, ${element.y})`}
                  onMouseDown={(e) => handleStartMove(e, element)}
                  onClick={handleElementClick}
                  style={{ cursor: 'move' }}
                >
                  <text
                    x={element.x}
                    y={element.y}
                    fontSize={element.fontSize}
                    fontFamily={element.fontFamily}
                    fill={element.fill}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight={element.fontWeight || 'normal'}
                    letterSpacing={element.letterSpacing || 0}
                    style={{
                      cursor: 'move',
                      userSelect: 'none',
                    }}
                  >
                    {element.text}
                  </text>
                  {/* Invisible bounding box for easier clicking */}
                  <rect
                    x={element.x - element.width / 2 - 4}
                    y={element.y - element.height / 2 - 4}
                    width={element.width + 8}
                    height={element.height + 8}
                    fill="transparent"
                    style={{ cursor: 'move' }}
                  />
                </g>
              );
            } else if (element.type === 'image') {
              return (
                <g
                  key={element.id}
                  transform={`rotate(${element.rotation}, ${element.x}, ${element.y})`}
                  onMouseDown={(e) => handleStartMove(e, element)}
                  onClick={handleElementClick}
                >
                  <image
                    href={element.url}
                    x={element.x - element.width / 2}
                    y={element.y - element.height / 2}
                    width={element.width}
                    height={element.height}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ cursor: 'move', userSelect: 'none' }}
                  />
                </g>
              );
            } else if (element.type === 'shape') {
              const shapeProps = {
                fill: element.shapeFill || 'rgba(139,92,246,0.5)',
                stroke: element.shapeStroke || '#8b5cf6',
                strokeWidth: element.shapeStrokeWidth ?? 2,
                opacity: element.shapeOpacity ?? 1,
              };
              let shapeEl: React.ReactNode = null;
              if (element.shapeType === 'rectangle') {
                shapeEl = (
                  <rect
                    x={element.x - element.width / 2}
                    y={element.y - element.height / 2}
                    width={element.width}
                    height={element.height}
                    rx={4}
                    {...shapeProps}
                  />
                );
              } else if (element.shapeType === 'circle') {
                shapeEl = (
                  <ellipse
                    cx={element.x}
                    cy={element.y}
                    rx={element.width / 2}
                    ry={element.height / 2}
                    {...shapeProps}
                  />
                );
              } else if (element.shapeType === 'line') {
                shapeEl = (
                  <line
                    x1={element.x - element.width / 2}
                    y1={element.y}
                    x2={element.x + element.width / 2}
                    y2={element.y}
                    stroke={element.shapeStroke || '#8b5cf6'}
                    strokeWidth={element.shapeStrokeWidth ?? 3}
                    strokeLinecap="round"
                  />
                );
              } else if (element.shapeType === 'triangle') {
                const hw = element.width / 2;
                const hh = element.height / 2;
                shapeEl = (
                  <polygon
                    points={`${element.x},${element.y - hh} ${element.x + hw},${element.y + hh} ${element.x - hw},${element.y + hh}`}
                    {...shapeProps}
                  />
                );
              } else if (element.shapeType === 'star') {
                // 5-point star
                const cx = element.x, cy = element.y;
                const outerR = Math.min(element.width, element.height) / 2;
                const innerR = outerR * 0.4;
                const pts: string[] = [];
                for (let i = 0; i < 10; i++) {
                  const angle = (i * Math.PI) / 5 - Math.PI / 2;
                  const r = i % 2 === 0 ? outerR : innerR;
                  pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
                }
                shapeEl = <polygon points={pts.join(' ')} {...shapeProps} />;
              }
              return (
                <g
                  key={element.id}
                  transform={`rotate(${element.rotation}, ${element.x}, ${element.y})`}
                  onMouseDown={(e) => handleStartMove(e, element)}
                  onClick={handleElementClick}
                  style={{ cursor: 'move' }}
                >
                  {shapeEl}
                </g>
              );
            }
            return null;
          })}
        </g>

        {/* ================= 3D SHADING & TEXTURE OVERLAY LAYER ================= */}
        {/* We overlay a shading gradient and a subtle fabric grid texture mapped across the entire shirt shape */}
        <g clipPath="url(#clip-tshirt-all)" style={{ pointerEvents: 'none' }}>
          {/* Shading Cylinder */}
          <path d={PANEL_PATHS[view]['body'].d} fill="url(#shading-grad)" opacity="0.9" style={{ mixBlendMode: 'multiply' }} />
          <path d={PANEL_PATHS[view]['left-sleeve'].d} fill="url(#shading-grad)" opacity="0.5" style={{ mixBlendMode: 'multiply' }} />
          <path d={PANEL_PATHS[view]['right-sleeve'].d} fill="url(#shading-grad)" opacity="0.5" style={{ mixBlendMode: 'multiply' }} />
          
          {/* Fabric Texture */}
          <path
            d={`M 100,100 H 400 V 450 H 100 Z`}
            fill="url(#fabric-texture)"
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Folds & Creases lines */}
          {/* Crease lines represented as low opacity stroke paths */}
          {/* Center line fold */}
          <path d="M 252,105 Q 248,260 250,420" stroke="black" strokeWidth="2.5" fill="none" opacity="0.08" />
          <path d="M 252,105 Q 248,260 250,420" stroke="white" strokeWidth="1" fill="none" opacity="0.04" />
          
          {/* Left sleeve fold */}
          <path d="M 150,110 Q 140,160 120,200" stroke="black" strokeWidth="2" fill="none" opacity="0.08" />
          {/* Right sleeve fold */}
          <path d="M 350,110 Q 360,160 380,200" stroke="black" strokeWidth="2" fill="none" opacity="0.08" />

          {/* Left armpit fold */}
          <path d="M 175,200 Q 210,230 190,260" stroke="black" strokeWidth="3" fill="none" opacity="0.1" />
          <path d="M 175,200 Q 210,230 190,260" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />

          {/* Right armpit fold */}
          <path d="M 325,200 Q 290,230 310,260" stroke="black" strokeWidth="3" fill="none" opacity="0.1" />
          <path d="M 325,200 Q 290,230 310,260" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />

          {/* Bottom waist folds */}
          <path d="M 180,410 Q 220,418 250,405" stroke="black" strokeWidth="2" fill="none" opacity="0.07" />
          <path d="M 245,412 Q 285,420 320,408" stroke="black" strokeWidth="2" fill="none" opacity="0.07" />
        </g>

        {/* ================= PANEL SELECTION HIGHLIGHT INDICATOR ================= */}
        {selectedPanel && (
          <path
            d={PANEL_PATHS[view][selectedPanel].d}
            fill="none"
            stroke="var(--accent-pink)"
            strokeWidth="2"
            strokeDasharray="5,3"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* ================= SELECTION BOUNDING BOX & CONTROLS ================= */}
        {activeElement && (
          <g transform={`rotate(${activeElement.rotation}, ${activeElement.x}, ${activeElement.y})`}>
            {/* Outline Box */}
            <rect
              x={activeElement.x - activeElement.width / 2}
              y={activeElement.y - activeElement.height / 2}
              width={activeElement.width}
              height={activeElement.height}
              className="element-active-outline"
            />

            {/* Top Rotate Handle Stem */}
            <line
              x1={activeElement.x}
              y1={activeElement.y - activeElement.height / 2}
              x2={activeElement.x}
              y2={activeElement.y - activeElement.height / 2 - 20}
              stroke="var(--accent-purple)"
              strokeWidth="1.5"
            />

            {/* Top Rotate Handle Circle */}
            <circle
              cx={activeElement.x}
              cy={activeElement.y - activeElement.height / 2 - 20}
              r="6"
              className="element-handle"
              onMouseDown={(e) => handleStartRotate(e, activeElement)}
            >
              <title>Rotate</title>
            </circle>

            {/* Bottom-Right Resize Handle */}
            <rect
              x={activeElement.x + activeElement.width / 2 - 5}
              y={activeElement.y + activeElement.height / 2 - 5}
              width="10"
              height="10"
              className="element-handle"
              style={{ cursor: 'se-resize' }}
              onMouseDown={(e) => handleStartResize(e, activeElement)}
            >
              <title>Resize</title>
            </rect>

            {/* Top-Right Delete Handle */}
            <g
              transform={`translate(${activeElement.x + activeElement.width / 2}, ${activeElement.y - activeElement.height / 2})`}
              onClick={(e) => handleDeleteElement(e, activeElement.id)}
              style={{ cursor: 'pointer' }}
            >
              <title>Delete</title>
              <circle cx="0" cy="0" r="8" fill="#ef4444" stroke="#fff" strokeWidth="1" />
              <line x1="-3" y1="-3" x2="3" y2="3" stroke="#fff" strokeWidth="1.5" />
              <line x1="3" y1="-3" x2="-3" y2="3" stroke="#fff" strokeWidth="1.5" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
