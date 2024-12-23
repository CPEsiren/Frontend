import axios from "axios";
import { IInterface } from "../interface/InterfaceCollection";

const getDeviceINT = async (): Promise<IInterface[]> => {
  try {
    const response = await axios.get<IInterface[]>(
      "http://localhost:3000/getInterface"
    );
    if (response.data.length > 0) {
      return response.data;
    } else {
      throw new Error("No Interfaces found");
    }
  } catch (error) {
    console.error("Error fetching Interface data:", error);
    throw new Error("Failed to fetch Interface data. Please try again later.");
  }
};

export { getDeviceINT };
