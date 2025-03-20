import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from './common.service';
import axios from 'axios';

jest.mock('axios');

describe('CommonService', () => {
  let service: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService],
    }).compile();

    service = module.get<CommonService>(CommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('triggerIngestionMockAPI', () => {
    it('should log success when ingestion is triggered successfully (status 200)', async () => {
      const uniqueFileId = 'test-file-id';

      (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.triggerIngestionMockAPI(uniqueFileId);

      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:3000/ingestion/trigger/${uniqueFileId}`
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Ingestion triggered for file ID: ${uniqueFileId}`
      );

      consoleSpy.mockRestore();
    });

    it('should log error when ingestion fails (non-200 status)', async () => {
      const uniqueFileId = 'test-file-id';
      
      (axios.post as jest.Mock).mockResolvedValue({ status: 500 });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.triggerIngestionMockAPI(uniqueFileId);

      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:3000/ingestion/trigger/${uniqueFileId}`
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Ingestion failed for file ID: ${uniqueFileId}`
      );

      consoleSpy.mockRestore();
    });

    it('should log error when there is an exception (API call failure)', async () => {
      const uniqueFileId = 'test-file-id';

      (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.triggerIngestionMockAPI(uniqueFileId);

      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:3000/ingestion/trigger/${uniqueFileId}`
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error triggering ingestion API: Error: Network Error'
      );

      consoleSpy.mockRestore();
    });
  });
});
