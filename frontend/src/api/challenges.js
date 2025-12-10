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
};

export const submitCode = async (
  challengeId,
  sourceCode,
  languageId,
  stdin,
  expectedOutput,
  user_id,
  time
) => {
  try {
    const response = await api.post("/submit-code", {
      challenge_id: challengeId,
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
      expected_output: expectedOutput,
      user_id: user_id,
      time: time,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting code:", error);
    throw error;
  }
};

export const getChallengesWithPagination = async (skip = 0, limit = 5) => {
  try {
    const response = await api.get(`/challenges/?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw error;
  }
};

export const addChallenge = async (newChallenge) => {
  try {
    const response = await api.post("/challenges/", newChallenge);
    return response.data;
  } catch (error) {
    console.error("Error adding challenge:", error);
    throw error;
  }
};

export const deleteChallenge = async (id) => {
  try {
    await api.delete(`/challenges/${id}`);
  } catch (error) {
    console.error("Error deleting challenge:", error);
    throw error;
  }
};

export const getAllChallenges = async (userId) => {
  try {
    const url = userId
      ? `/challenges?skip=0&limit=99999&user_id=${userId}`
      : `/challenges?skip=0&limit=99999`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching all challenges:", error);
    throw error;
  }
};
