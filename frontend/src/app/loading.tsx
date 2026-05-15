import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-sacred-gold" size={40} />
      <p className="text-sacred-muted font-serif italic animate-pulse">Awakening the sanctuary...</p>
    </div>
  );
}
