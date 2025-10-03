export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MyNextRead API',
    version: '1.0.0'
  });
}
