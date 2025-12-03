import api from "./apiInstance";

export const getAllResources = async () => {
  try {
    const response = await api.get("/resources?skip=0&limit=9999");
    return response.data;
  } catch (error) {
    console.error("Error fetching all resources:", error);
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

export const getResourcesWithPagination = async (skip = 0, limit = 5) => {
  try {
    const response = await api.get(`/resources/?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
};

export const addResources = async (newResource) => {
  try {
    const response = await api.post("/resources/", newResource);
    return response.data;
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
};

export const deleteResource = async (id) => {
  try {
    await api.delete(`/resources/${id}`);
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};
