export default () => ({
  port: parseInt(process.env.PORT || '3002', 10),
  moveoCore: {
    apiUrl: process.env.MOVEO_CORE_API_URL || 'http://localhost:3000',
  },
  telemetryService: {
    apiUrl: process.env.TELEMETRY_SERVICE_API_URL || 'http://localhost:3003',
  },
});

