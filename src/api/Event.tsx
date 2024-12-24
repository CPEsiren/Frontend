import axios from 'axios';
import { IEvent } from '../interface/InterfaceCollection';


const API_URL = "http://localhost:3000/event"; 

export const getEventData = async (): Promise<IEvent[]> => {
    try {
      const response = await axios.get(API_URL);
      console.log('Fetched Event Data:', response.data);  
  
      const eventData = response.data.data;
  
      if (Array.isArray(eventData)) {
        return eventData;  
      } else if (eventData && eventData._id) {
        return [eventData];  
      } else {
        console.error('Invalid event format', eventData);
        throw new Error('Invalid event format');
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      throw error;
    }
  };
  