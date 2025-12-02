import api from "./apiInstance";

export const getChallenges = async () => {
  try {
    const response = await api.get("/challenges/");
    return response.data;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw error;
  }
};

export const getChallenge = async (id) => {
    try {
        const response = await api.get(`/challenges/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching challenge:", error);
        throw error;
    }
}

export const getChallengesWithPagination = async (skip = 0, limit = 5) => {
  try {
    const response = await api.get(`/challenges/?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw error;
  }
};
