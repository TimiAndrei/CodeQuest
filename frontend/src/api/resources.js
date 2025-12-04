import api from "./apiInstance";

export const getResources = async () => {
  try {
    const response = await api.get("/resources/");
    return response.data;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};

export const getResourceById = async (id) => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw error;
  }
};
