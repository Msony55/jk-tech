import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CommonService {
  async triggerIngestionMockAPI(uniqueFileId: string) {
    try {
      const response = await axios.post(`http://localhost:3000/ingestion/trigger/${uniqueFileId}`);
      
      if (response.status === 200) {
        console.log(`Ingestion triggered for file ID: ${uniqueFileId}`);
      } else {
        console.error(`Ingestion failed for file ID: ${uniqueFileId}`);
      }
    } catch (error) {
      console.error('Error triggering ingestion API:', error);
    }
  }
}
