"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 px-4">
      <div className="w-16 h-16 rounded-full bg-sacred-gold/10 flex items-center justify-center">
        <span className="text-2xl">🕉</span>
      </div>
      <h2 className="text-2xl font-serif text-sacred-text">Something went awry</h2>
      <p className="text-sacred-muted text-sm max-w-md text-center italic">
        Even the strongest trees bend in the wind. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-sacred-gold text-white rounded-full text-sm font-bold hover:bg-sacred-gold/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
