import { useState } from 'react';
import { syntaxHighlightJSON } from '../lib/syntaxHighlight';

const SAMPLES = {
  stats: {
    endpoint: 'GET /api/v1/stats',
    time: '4ms',
    comment: '// Realtime Server Stats & System Health',
    json: {
      status: 'success',
      data: {
        server_time: '2026-08-06T14:07:00.000Z',
        uptime_formatted: '4d 12h 30m',
        node_version: 'v22.23.2',
        cpus: 4,
        load_average_1m: '0.15',
        memory: { rss_mb: '48.20', heap_used_mb: '28.10', heap_total_mb: '35.40' },
        status: 'online',
      },
    },
  },
  otakudesu: {
    endpoint: 'GET /api/v1/otakudesu/home',
    time: '18ms',
    comment: '// Anime Ongoing & Nonce Decrypted Stream',
    json: {
      status: 'success',
      data: {
        ongoing: [
          {
            title: 'Tomb Raider King Sub Indo',
            episode: 'Episode 5',
            slug: 'tomb-raider-king-sub-indo',
            thumb: 'https://otakudesu.blog/upload/tomb.jpg',
          },
        ],
      },
    },
  },
  pinterest: {
    endpoint: 'GET /api/v1/pinterest?url=https://pin.it/...',
    time: '25ms',
    comment: '// Pinterest Image (736x) & Video Extractor',
    json: {
      status: 'success',
      data: {
        title: 'Aesthetic Wallpaper HD',
        media: [
          { type: 'image', quality: '736x', url: 'https://i.pinimg.com/736x/ab/cd/ef.jpg' },
        ],
      },
    },
  },
  kci: {
    endpoint: 'GET /api/v1/kci/schedules?stationId=BOO',
    time: '14ms',
    comment: '// Realtime KRL Commuter Line Schedule',
    json: {
      status: 'success',
      stationId: 'BOO',
      data: [
        {
          train_id: '1009',
          line: 'COMMUTER LINE BOGOR',
          route: 'BOGOR-MANGGARAI',
          departure_time: '06:02:00',
        },
      ],
    },
  },
};

export default function HeroCodeWindow() {
  const [activeTab, setActiveTab] = useState('stats');
  const sample = SAMPLES[activeTab];
  const lines = syntaxHighlightJSON(sample.json).split('\n');

  return (
    <div className="relative mt-4 lg:mt-0">
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Tab switcher header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/80 px-3 py-2 text-xs overflow-x-auto no-scrollbar">
          <div className="flex gap-1 shrink-0">
            {['stats', 'otakudesu', 'pinterest', 'kci'].map((tabKey) => {
              const labels = {
                stats: 'Server Stats',
                otakudesu: 'Otakudesu',
                pinterest: 'Pinterest',
                kci: 'KRL Commuter',
              };
              const active = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`rounded px-2.5 py-1 transition font-semibold text-xs whitespace-nowrap ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {labels[tabKey]}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="status-dot-active mr-1" /> Ready
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 truncate font-mono text-[11px] sm:text-xs">
            <i className="fa-solid fa-code text-slate-400 shrink-0" /> 
            <span className="truncate text-slate-700 dark:text-slate-300">{sample.endpoint}</span>
          </div>
          <span className="shrink-0 rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
            200 OK • {sample.time}
          </span>
        </div>

        {/* Code View */}
        <div className="max-h-64 sm:max-h-80 overflow-auto p-3.5 sm:p-4 font-mono text-xs leading-relaxed bg-slate-900 dark:bg-[#0b0f17]">
          <div className="text-slate-400 dark:text-slate-500 italic token-comment mb-1">{sample.comment}</div>
          <pre
            className="whitespace-pre text-slate-100 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
          />
        </div>
      </div>
    </div>
  );
}

