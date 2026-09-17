import os from 'os';

export function createStatsService() {
  const startTime = Date.now();

  return {
    getStats() {
      const uptimeSeconds = Math.floor(process.uptime());
      const memoryUsage = process.memoryUsage();
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const loadAvg = os.loadavg();

      return {
        server_time: new Date().toISOString(),
        uptime_seconds: uptimeSeconds,
        uptime_formatted: formatUptime(uptimeSeconds),
        node_version: process.version,
        platform: process.platform,
        architecture: process.arch,
        cpus: os.cpus().length,
        load_average_1m: loadAvg[0].toFixed(2),
        memory: {
          rss_mb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
          heap_used_mb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          heap_total_mb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          system_total_mb: (totalMem / 1024 / 1024).toFixed(2),
          system_free_mb: (freeMem / 1024 / 1024).toFixed(2),
        },
        environment: process.env.NODE_ENV || 'production',
        status: 'online',
      };
    },
  };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}
