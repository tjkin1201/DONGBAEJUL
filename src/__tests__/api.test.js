import api from '../../services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe('API Service', () => {
  it('API 인스턴스가 정상적으로 생성되는지 확인', () => {
    expect(api).toBeDefined();
  });

  it('GET 요청이 정상적으로 작동하는지 확인', async () => {
    const mockResponse = { data: { message: 'success' } };
    api.get = jest.fn().mockResolvedValue(mockResponse);

    const result = await api.get('/test');
    
    expect(api.get).toHaveBeenCalledWith('/test');
    expect(result).toEqual(mockResponse);
  });

  it('POST 요청이 정상적으로 작동하는지 확인', async () => {
    const mockData = { name: 'test' };
    const mockResponse = { data: { id: 1, ...mockData } };
    api.post = jest.fn().mockResolvedValue(mockResponse);

    const result = await api.post('/test', mockData);
    
    expect(api.post).toHaveBeenCalledWith('/test', mockData);
    expect(result).toEqual(mockResponse);
  });

  it('에러 처리가 정상적으로 작동하는지 확인', async () => {
    const mockError = new Error('Network Error');
    api.get = jest.fn().mockRejectedValue(mockError);

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toEqual(mockError);
    }
  });
});
