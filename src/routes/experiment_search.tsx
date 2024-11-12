// src/routes/experiment_search.tsx
import React, { useState } from "react";

type SearchResult = {
  id: number;
  title: string;
};

type Ratings = {
  [key: number]: string;
};

function ExperimentSearch() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [ratings, setRatings] = useState<Ratings>({});
  const task = localStorage.getItem("selectedTask");
  const matriculationNumber = localStorage.getItem("matriculationNumber");

  const handleSearch = async () => {
    // Simulate search engine switching mechanism
    const engine = Math.random() > 0.5 ? "Engine A" : "Engine B";
    // Perform search based on engine (implementation not shown)
    const results = await performSearch(searchQuery, engine);
    setSearchResults(results);
  };

  const handleRatingChange = (resultId: number, rating: string) => {
    setRatings({ ...ratings, [resultId]: rating });
  };

  const handleSubmitRatings = () => {
    const experimentData = {
      matriculationNumber,
      task,
      searchQuery,
      ratings,
    };
    // Save experiment data (could be to local storage or send to backend)
    console.log("Experiment Data:", experimentData);
  };

  return (
    <div>
      <h2>Experiment Search for Task: {task}</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {searchResults.map((result) => (
          <div key={result.id}>
            <p>{result.title}</p>
            <label>Rate this result:</label>
            <select
              value={ratings[result.id] || ""}
              onChange={(e) => handleRatingChange(result.id, e.target.value)}
            >
              <option value="">Rate</option>
              <option value="0">0 - Not Relevant</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 - Very Relevant</option>
            </select>
          </div>
        ))}
      </div>
      <button onClick={handleSubmitRatings}>Submit Ratings</button>
    </div>
  );
}

async function performSearch(query: string, engine: string): Promise<SearchResult[]> {
  // Simulate search function
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: `Result 1 from ${engine}` },
        { id: 2, title: `Result 2 from ${engine}` },
        { id: 3, title: `Result 3 from ${engine}` },
      ]);
    }, 1000);
  });
}

export default ExperimentSearch;
