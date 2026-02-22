"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold mb-2">Brak polaczenia</h1>
      <p className="text-muted-foreground max-w-md">
        Nie masz dostepu do internetu. Dane z ostatniej sesji moga byc
        dostepne w trybie offline. Polacz sie z siecia, zeby zobaczyc
        aktualne dane.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Sprobuj ponownie
      </button>
    </div>
  );
}
