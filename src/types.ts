export type TShirtView = 'front' | 'back';

export type TShirtPanel = 'body' | 'left-sleeve' | 'right-sleeve' | 'collar';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle' | 'star';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  letterSpacing?: number;
  fontWeight?: string;
  // Image specific
  url?: string;
  // Shape specific
  shapeType?: ShapeType;
  shapeFill?: string;
  shapeStroke?: string;
  shapeStrokeWidth?: number;
  shapeOpacity?: number;
}

export interface PanelDesign {
  color: string;
  patternUrl: string | null;
  patternScale: number;
  patternX: number;
  patternY: number;
}

export interface SideDesign {
  elements: CanvasElement[];
  panels: Record<TShirtPanel, PanelDesign>;
}

export interface EditorState {
  view: TShirtView;
  front: SideDesign;
  back: SideDesign;
  selectedElementId: string | null;
  selectedPanel: TShirtPanel | null;
  activeTool: 'select' | 'rectangle' | 'circle' | 'line' | 'triangle' | 'star';
}
