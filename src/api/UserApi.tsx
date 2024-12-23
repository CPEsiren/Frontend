import axios from "axios";
import { IUser } from "../interface/InterfaceCollection";

const getUserData = async (): Promise<IUser[]> => {
  try {
    const response = await axios.get<IUser[]>("http://localhost:3000/getUser");
    return response.data;
  } catch (error) {
    console.error("Error fetching User data:", error);
    throw new Error("Failed to fetch User data. Please try again later.");
  }
};

export { getUserData };
