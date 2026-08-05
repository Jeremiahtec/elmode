import LiveTelemetryCard from '../components/LiveTelemetryCard';
import HistoricalLogsTable from '../components/HistoricalLogsTable';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-neutral-950 p-10 py-16">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none fixed"></div>
      
      <div className="z-10 flex flex-col items-center w-full max-w-5xl">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-white font-sans">
            ELMODE
          </h1>
          <p className="text-neutral-500 uppercase tracking-widest text-xs font-semibold">
            Predictive Diagnostics Array
          </p>
        </div>
        
        <LiveTelemetryCard />
        <HistoricalLogsTable />
      </div>
    </main>
  );
}