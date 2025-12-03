export const submitCode = async (challengeId, sourceCode) => {
    const payload = {
      source_code: sourceCode,
      challenge_id: challengeId,
    };
  
    console.log("Payload sent to API:", payload);
    
    const response = await axios.post("http://localhost:8000/submit-code", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    return response.data;
  };
  