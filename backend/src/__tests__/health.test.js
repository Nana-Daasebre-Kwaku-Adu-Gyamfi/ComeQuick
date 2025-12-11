import request from 'supertest';
import app from '../app.js';

describe('Health Check Endpoint', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

