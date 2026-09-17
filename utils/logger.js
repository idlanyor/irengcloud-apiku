const logger = {
  info: (msg, tag = 'INFO') => console.log(`[${new Date().toISOString()}] [${tag}] ${msg}`),
  error: (msg, tag = 'ERROR') => console.error(`[${new Date().toISOString()}] [${tag}] ${msg}`),
};

export default logger;
