import React from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { AILoader } from "../ui";

interface VisualReferenceProps {
  imageUrl?: string;
  onGenerate: () => void;
  loadingAI: boolean;
  hasTitle: boolean;
}

export function VisualReference({ imageUrl, onGenerate, loadingAI, hasTitle }: VisualReferenceProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 h-fit bg-white border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-zinc-800 flex items-center">
          <ImageIcon className="w-4 h-4 mr-2 text-yellow-500" />
          Visual Reference
        </h4>
        <button 
          onClick={onGenerate}
          disabled={loadingAI || !hasTitle}
          className="text-xs text-zinc-600 hover:text-zinc-900 font-bold hover:underline disabled:opacity-50 flex items-center bg-zinc-50 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200"
        >
          {loadingAI && <span className="mr-1.5"><AILoader /></span>}
          Generate Mockup
        </button>
      </div>
      <div className="aspect-video bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center overflow-hidden relative group transition-all shadow-inner">
        {imageUrl ? (
          <>
            <img src={imageUrl} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Ref" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-end p-4">
              <a href={imageUrl} download="mockup.png" className="opacity-0 group-hover:opacity-100 bg-white p-3 rounded-xl shadow-lg hover:scale-110 transition-all border border-zinc-100">
                <ImageIcon className="w-5 h-5 text-zinc-800"/>
              </a>
            </div>
          </>
        ) : (
          <div className="text-center p-10">
            {loadingAI ? (
                <div className="flex flex-col items-center animate-pulse">
                     <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-yellow-500 animate-spin-slow" />
                     </div>
                     <p className="text-sm text-zinc-500 font-bold">AI is imagining the UI...</p>
                </div>
            ) : (
                <>
                    <ImageIcon className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                    <p className="text-xs text-zinc-400 max-w-[200px] mx-auto leading-relaxed font-medium">Generate a visual reference to help testers understand the expected UI.</p>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
