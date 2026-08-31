import { MousePointer, Square, RectangleHorizontal, Trash2, X, AlertCircle } from 'lucide-react';
import { useFarm, type DrawingMode } from '../context/FarmContext';

interface DrawingControlsProps {
  onCancelDraw?: () => void;
}

export default function DrawingControls({ onCancelDraw }: DrawingControlsProps) {
  const { drawingMode, setDrawingMode, activeDrawPoints, setActiveDrawPoints } = useFarm();

  const handleSetMode = (mode: DrawingMode) => {
    setDrawingMode(mode);
    setActiveDrawPoints([]);
  };

  const handleCancel = () => {
    setDrawingMode('inspect');
    setActiveDrawPoints([]);
    if (onCancelDraw) onCancelDraw();
  };

  return (
    <div className="flex flex-col gap-2 pointer-events-auto">
      {/* Floating Mode Switcher Toolbar */}
      <div className="flex items-center gap-1 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl text-white">
        <button
          type="button"
          onClick={() => handleSetMode('inspect')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            drawingMode === 'inspect'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Inspect and Select Fields"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inspect</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMode('square')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            drawingMode === 'square'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Click to place Square parcel"
        >
          <Square className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Square Parcel</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMode('rectangle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            drawingMode === 'rectangle'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Click two opposite corners for Rectangle"
        >
          <RectangleHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rectangle Parcel</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMode('delete')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            drawingMode === 'delete'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-300 hover:text-red-400 hover:bg-white/10'
          }`}
          title="Click field to delete parcel"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete Mode</span>
        </button>
      </div>

      {/* Mode Guidance Alert Banner */}
      {drawingMode !== 'inspect' && (
        <div
          className={`flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md shadow-lg border transition-all ${
            drawingMode === 'delete'
              ? 'bg-red-950/90 text-red-200 border-red-500/40'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
            <span>
              {drawingMode === 'square' &&
                'Click anywhere on satellite imagery to drop a square parcel (~150m).'}
              {drawingMode === 'rectangle' &&
                (activeDrawPoints.length === 0
                  ? 'Click 1st corner of the rectangular field boundary.'
                  : 'Click opposite corner to complete rectangle.')}
              {drawingMode === 'delete' &&
                'Click on any field polygon to delete it from the farm.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition cursor-pointer ml-2"
            title="Exit drawing mode"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
