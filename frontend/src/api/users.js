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

export const getAllUsersOrderedByPoints = async () => {
  try {
    const response = await api.get("/usersOrderedByPoints/?skip=0&limit=99999");
    return response.data;
  } catch (error) {
    console.error("Error fetching users ordered by points:", error);
    throw error;
  }
};
