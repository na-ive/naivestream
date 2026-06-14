import { getAdminStats } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const metrics = [
    { label: 'Total Anime', value: stats.totalAnime, color: 'text-secondary' },
    { label: 'Total Episodes', value: stats.totalEpisodes, color: 'text-foreground' },
    { label: 'Total Characters', value: stats.totalCharacters, color: 'text-foreground' },
    { label: 'Total Voice Actors', value: stats.totalVoiceActors, color: 'text-foreground' },
  ];

  const warnings = [
    { label: 'Missing MAL ID', value: stats.missingMalId },
    { label: 'Missing AniList ID', value: stats.missingAnilistId },
  ];

  return (
    <div className="min-h-full p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="border-b border-border pb-6">
          <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter text-secondary">
            Command Center
          </h1>
          <p className="text-muted-text uppercase tracking-widest text-sm mt-2">
            System Overview & Metrics
          </p>
        </header>

        {/* Metrics Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">Global Databanks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-card border border-border p-6 hover:border-secondary transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <p className="text-xs text-muted-text font-bold uppercase tracking-widest mb-2">{metric.label}</p>
                  <p className={`text-4xl font-serif font-black ${metric.color}`}>
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-secondary/30" />
              </div>
            ))}
          </div>
        </section>

        {/* Warnings */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-red-500">System Anomalies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {warnings.map((warning, idx) => (
              <div key={idx} className="bg-red-500/5 border border-red-500/20 p-6 flex justify-between items-center">
                <span className="text-sm font-bold text-red-500 uppercase tracking-widest">{warning.label}</span>
                <span className="text-2xl font-mono font-black text-red-500">{warning.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
