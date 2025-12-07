import api from "./apiInstance";

export const getUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUsersOrderedByPoints = async (skip = 0, limit = 5) => {
  try {
    const response = await api.get(`/usersOrderedByPoints/?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users ordered by points:", error);
    throw error;
  }
};