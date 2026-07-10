import { vi, describe, it, expect, beforeEach } from 'vitest';

// Use vi.hoisted so the mock object is available when vi.mock factory runs (hoisted)
const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    constructor() {
      this.get = mockRedis.get;
      this.set = mockRedis.set;
    }
  },
}));

// Import handlers after mocking
import roadmapsIndexHandler from '../../api/roadmaps/index.js';
import roadmapByIdHandler from '../../api/roadmaps/[id].js';
import progressHandler from '../../api/progress/[roadmapId].js';

// Helper to create mock request
function createMockReq(method, query = {}, body = null) {
  return { method, query, body };
}

// Helper to create mock response
function createMockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
}

describe('API: /api/roadmaps (index)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns empty array when no roadmaps exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const req = createMockReq('GET');
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns array when roadmaps exist', async () => {
      const roadmaps = [
        { id: 'test-roadmap', title: 'Test Roadmap' },
        { id: 'another', title: 'Another' },
      ];
      mockRedis.get.mockResolvedValue(roadmaps);
      const req = createMockReq('GET');
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(roadmaps);
    });
  });

  describe('POST', () => {
    it('creates roadmap with valid data', async () => {
      mockRedis.get.mockResolvedValue([]);
      mockRedis.set.mockResolvedValue('OK');
      const req = createMockReq('POST', {}, {
        title: 'My New Roadmap',
        subtitle: 'A great plan',
      });
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const created = res.json.mock.calls[0][0];
      expect(created.title).toBe('My New Roadmap');
      expect(created.subtitle).toBe('A great plan');
      expect(created.id).toBe('my-new-roadmap');
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
    });

    it('rejects missing title', async () => {
      const req = createMockReq('POST', {}, { subtitle: 'No title' });
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('title') })
      );
    });

    it('rejects empty title', async () => {
      const req = createMockReq('POST', {}, { title: '   ' });
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects title over 100 characters', async () => {
      const req = createMockReq('POST', {}, { title: 'A'.repeat(101) });
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('100') })
      );
    });

    it('auto-generates ID from title as URL-safe slug', async () => {
      mockRedis.get.mockResolvedValue([]);
      mockRedis.set.mockResolvedValue('OK');
      const req = createMockReq('POST', {}, { title: 'My Cool Roadmap! 2024' });
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const created = res.json.mock.calls[0][0];
      expect(created.id).toBe('my-cool-roadmap-2024');
    });
  });

  describe('Method Not Allowed', () => {
    it('returns 405 for unsupported methods', async () => {
      const req = createMockReq('DELETE');
      const res = createMockRes();

      await roadmapsIndexHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, POST');
    });
  });
});

describe('API: /api/roadmaps/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns roadmap by id', async () => {
      const roadmap = { id: 'test', title: 'Test Roadmap', createdAt: '2024-01-01T00:00:00.000Z' };
      mockRedis.get.mockResolvedValue(roadmap);
      const req = createMockReq('GET', { id: 'test' });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(roadmap);
    });

    it('returns 404 for missing id', async () => {
      mockRedis.get.mockResolvedValue(null);
      const req = createMockReq('GET', { id: 'nonexistent' });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('not found') })
      );
    });
  });

  describe('PUT', () => {
    it('updates existing roadmap', async () => {
      const existing = {
        id: 'test',
        title: 'Old Title',
        subtitle: 'Old subtitle',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockRedis.get.mockResolvedValueOnce(existing); // get definition
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValueOnce([existing]); // get registry

      const req = createMockReq('PUT', { id: 'test' }, { title: 'New Title' });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const updated = res.json.mock.calls[0][0];
      expect(updated.title).toBe('New Title');
      expect(updated.id).toBe('test');
    });

    it('returns 404 for non-existent roadmap', async () => {
      mockRedis.get.mockResolvedValue(null);
      const req = createMockReq('PUT', { id: 'nonexistent' }, { title: 'New' });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('preserves createdAt on update', async () => {
      const createdAt = '2024-01-01T00:00:00.000Z';
      const existing = {
        id: 'test',
        title: 'Old',
        createdAt,
        updatedAt: '2024-01-02T00:00:00.000Z',
      };
      mockRedis.get.mockResolvedValueOnce(existing);
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValueOnce([existing]);

      const req = createMockReq('PUT', { id: 'test' }, {
        title: 'Updated',
        createdAt: '2025-01-01T00:00:00.000Z', // attempt to overwrite
      });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const updated = res.json.mock.calls[0][0];
      expect(updated.createdAt).toBe(createdAt); // original preserved
    });
  });

  describe('Method Not Allowed', () => {
    it('returns 405 for unsupported methods', async () => {
      const req = createMockReq('PATCH', { id: 'test' });
      const res = createMockRes();

      await roadmapByIdHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, PUT');
    });
  });
});

describe('API: /api/progress/[roadmapId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns empty record when no progress exists', async () => {
      mockRedis.get.mockResolvedValue(null);
      const req = createMockReq('GET', { roadmapId: 'test-roadmap' });
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        roadmapId: 'test-roadmap',
        tasks: {},
        updatedAt: null,
      });
    });

    it('returns stored progress record', async () => {
      const stored = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': true, 'task-2': false },
        updatedAt: '2024-06-01T12:00:00.000Z',
      };
      mockRedis.get.mockResolvedValue(stored);
      const req = createMockReq('GET', { roadmapId: 'test-roadmap' });
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stored);
    });
  });

  describe('PUT', () => {
    it('stores valid progress record', async () => {
      mockRedis.get.mockResolvedValue(null); // no existing record
      mockRedis.set.mockResolvedValue('OK');
      const body = {
        tasks: { 'task-1': true, 'task-2': false },
        updatedAt: '2024-06-01T12:00:00.000Z',
      };
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, body);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        roadmapId: 'test-roadmap',
        tasks: body.tasks,
        updatedAt: body.updatedAt,
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'progress:test-roadmap',
        expect.any(String)
      );
    });

    it('rejects missing tasks field', async () => {
      const body = { updatedAt: '2024-06-01T12:00:00.000Z' };
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, body);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('tasks') })
      );
    });

    it('rejects missing updatedAt field', async () => {
      const body = { tasks: { 'task-1': true } };
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, body);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('updatedAt') })
      );
    });

    it('returns 409 when stored record is more recent (conflict resolution)', async () => {
      const stored = {
        roadmapId: 'test-roadmap',
        tasks: { 'task-1': true },
        updatedAt: '2024-06-10T12:00:00.000Z', // more recent
      };
      mockRedis.get.mockResolvedValue(stored);

      const body = {
        tasks: { 'task-1': false },
        updatedAt: '2024-06-01T12:00:00.000Z', // older
      };
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, body);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Conflict'),
          stored,
        })
      );
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('Method Not Allowed', () => {
    it('returns 405 for unsupported methods', async () => {
      const req = createMockReq('DELETE', { roadmapId: 'test-roadmap' });
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, PUT');
    });
  });

  describe('Error responses for invalid payloads', () => {
    it('rejects empty body on PUT', async () => {
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, null);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects tasks as array instead of object', async () => {
      const body = {
        tasks: ['task-1', 'task-2'],
        updatedAt: '2024-06-01T12:00:00.000Z',
      };
      const req = createMockReq('PUT', { roadmapId: 'test-roadmap' }, body);
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('tasks') })
      );
    });

    it('rejects missing roadmapId parameter', async () => {
      const req = createMockReq('GET', {});
      const res = createMockRes();

      await progressHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
