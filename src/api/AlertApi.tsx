import axios from "axios";
import { IAlert } from "../interface/InterfaceCollection";

const getAlertData = async (): Promise<IAlert[]> => {
  try {
    const response = await axios.get<IAlert[]>(
      "http://localhost:3000/getAlert"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Alert data:", error);
    throw new Error("Failed to fetch Alert data. Please try again later.");
  }
};

export { getAlertData };
