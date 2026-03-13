import { VidFlowClient } from '../client';

describe('VidFlowClient', () => {
  let client: VidFlowClient;

  beforeEach(() => {
    client = new VidFlowClient({
      baseUrl: 'https://api.vidflow.app',
      apiKey: 'test-api-key',
    });
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = new VidFlowClient({
        baseUrl: 'https://api.vidflow.app',
      });
      const config = defaultClient.getConfig();

      expect(config.baseUrl).toBe('https://api.vidflow.app');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
      expect(config.version).toBe('v1');
    });

    it('should create client with custom config', () => {
      const config = client.getConfig();

      expect(config.baseUrl).toBe('https://api.vidflow.app');
      expect(config.apiKey).toBe('test-api-key');
      expect(config.timeout).toBe(30000);
    });
  });

  describe('getConfig', () => {
    it('should return config with all properties', () => {
      const config = client.getConfig();

      expect(config.baseUrl).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.retries).toBeDefined();
      expect(config.version).toBeDefined();
    });
  });

  describe('setAuthToken', () => {
    it('should set authorization header', () => {
      expect(() => client.setAuthToken('test-token')).not.toThrow();
    });

    it('should clear authorization header', () => {
      client.setAuthToken('test-token');

      expect(() => client.clearAuthToken()).not.toThrow();
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await client.sleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });
});
