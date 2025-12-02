import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getResourceById } from "../../api/resources";

import "./soloresource.css";

function SoloResource() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await getResourceById(id);
        setResource(data);
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    };

    fetchResource();
  }, [id]);

  if (!resource) {
    return <div>Loading...</div>;
  }

  return (
    <div className="soloresource-details-container">
      <div className="soloresource-card">
        <h2>{resource.title}</h2>
        <p>{resource.description}</p>
      </div>
    </div>
  );
}

export default SoloResource;
