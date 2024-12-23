import axios from "axios";
import { IDevice } from "../interface/InterfaceCollection";

const getDeviceData = async (): Promise<IDevice[]> => {
  try {
    const response = await axios.get<IDevice[]>("http://localhost:3000/host");
    return response.data;
  } catch (error) {
    console.error("Error fetching device data:", error);
    throw new Error("Failed to fetch device data. Please try again later.");
  }
};

export { getDeviceData };
