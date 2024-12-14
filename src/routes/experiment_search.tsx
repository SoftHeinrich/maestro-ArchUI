import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postRequestSearchEngine, getDatabaseURL, postRequest } from "./util";
import { Button } from "../components/button";
import { MagnifyingGlassIcon } from "../icons";
import Attachments from "../components/Attachments";
import Accordion from "../components/Accordion";
import Comments from "../components/comments";
import { useNavigate } from 'react-router-dom';
import {
  TextAreaForm,
  RadioButtonForm
} from "../components/forms";

type SearchResult = {
  issue_id: number;
  issue_key: string;
  summary: string;
  description: string;
  attachments: any;
  comments: any;
  existence: string | null;
  executive: string | null;
  property: string | null;
  new_score: number;
};

type Rating = {
  issue_id: number | string;
  rating: string;
};

type Ratings = {
  [key: number]: Rating;
};

function ExperimentSearch() {
  const navigate = useNavigate();

  const { taskId, questionKey } = useParams();
  const taskData = JSON.parse(localStorage.getItem("taskData") || "null");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [ratings, setRatings] = useState<Ratings>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const matriculationNumber = localStorage.getItem("matriculationNumber");

  const selectedModel = {
    modelId: "648ee4526b3fde4b1b33e099",
    versionId: "648f1f6f6b3fde4b1b3429cf",
  };

  useEffect(() => {
    if (taskData && taskId && questionKey) {
      console.log(`Experiment Search initialized for Task: ${taskId}, Question: ${questionKey}`);
    }
  }, [taskData, taskId, questionKey]);

  const logEvent = (logMessage: string,level: string="info") => {
    const logData = {
      level: level,
      message: `Task: ${taskId}, Question: ${questionKey}, MtrNo: ${matriculationNumber}, ${logMessage}`,
      timestamp: new Date().toISOString(),
    };
    postRequest("/logs", logData, (response) => {
      console.log("Log submitted:", response);
    });
  };

  const handleSearch = () => {
    if (!searchQuery) {
      alert("Please enter a search query");
      return;
    }
  
    setIsLoading(true);
    setError("");
    setSearchResults([]);
  
    const task = taskData?.find((t: any) => t["taskName"] === taskId);
    const question = task?.questions[questionKey];
  
    if (task.gpt === true) {
      const data = {
        prompt: searchQuery,
      };
      logEvent(`Search initiated with GPT-4, Query: ${searchQuery}`);
  
      postRequest("/gpt4-response", data, (data) => {
        if (data.answer) {
          const newQuery = data.answer;
          logEvent(`Search successful with GPT-4, Query: ${newQuery}`);
          performSearch(task, question, newQuery);
        } else {
          logEvent(`Search failed with GPT-4, Query: ${searchQuery}`,"error");

          setIsLoading(false);
          setError("An error occurred while fetching search results. Please try again.");
          console.log(data);
        }
      });
    } else {
      performSearch(task, question, searchQuery);
    }
  };
  
  const performSearch = (task, question, query) => {
    const tmp = task?.rerank_engine
      ? {
          existence: question?.design_decision?.existence ?? null,
          executive: question?.design_decision?.executive ?? null,
          property: question?.design_decision?.property ?? null,
        }
      : {
          existence: null,
          executive: null,
          property: null,
        };

    var rerankingEngine ="";
    if((tmp.executive|| tmp.existence|| tmp.property)){
      rerankingEngine = " with reranking"
    }else{
      rerankingEngine = "with normal"
    }
    // String withGPT = "with reranking"? (tmp.executive|| tmp.existence|| tmp.property) :""
    logEvent(`Search initiated ${rerankingEngine}, Query: ${searchQuery}`);

    postRequestSearchEngine(
      "/search",
      {
        database_url: getDatabaseURL(),
        model_id: selectedModel.modelId,
        version_id: selectedModel.versionId,
        repos_and_projects: { Apache: ["HDFS"] }, // Assuming predefined repo and project
        query: query,
        num_results: 10,
        predictions: tmp,
      },
      (data) => {
        setIsLoading(false);
        if (data.result === "done") {
        logEvent(`Search successful ${rerankingEngine}, Query: ${searchQuery}`);

          if (data["payload"].length === 0) {
            setError("No results found.");
          } else {
            setSearchResults([...data["payload"]]);
          }
        } else {
          logEvent(`Search failed ${rerankingEngine}, Query: ${searchQuery}`,"error");

          setError("Failed to fetch search results. Please try again.");
        }
      }
    );
  };

  const handleRatingChange = (index: number, resultId: number, rating: string) => {
    setRatings({ ...ratings, [index]: { issue_id: resultId, rating } });
    console.log(ratings);
  };

  const handleSubmitRatings = () => {
    if (Object.keys(ratings).length === searchResults.length && searchResults.length!= 0 && Object.keys(ratings).length != 0) {
      const ratingsList = Object.values(ratings).map((rating) => ({
        issue_id: rating.issue_id,
        rating: rating.rating,
      }));
  
      const experimentData = {
        matriculationNumber,
        taskId,
        questionKey,
        searchQuery,
        ratings: ratingsList,
      };

      logEvent(`Ratings submission started for ${searchQuery}`);
  
      postRequest("/submit-ratings", experimentData, (response) => {
        if (response.success) {
          logEvent(`Ratings submitted for ${searchResults.length} results: ${JSON.stringify(ratingsList)}`);

          alert("Ratings submitted successfully");
          navigate(`/archui/experiment`);
        } else {
          logEvent(`Ratings submission failed for ${searchResults.length} results: ${JSON.stringify(ratingsList)}`,"error");

          alert("Failed to submit ratings. Please try again.");
          console.log(response);
        }
      });
    } else {
      alert("Please ensure you have rated all the results available.");
    }
  };

  if (!taskData) {
    return <p>No Task Data Available</p>;
  }

  const task = taskData.find((t: any) => t["taskName"] === taskId);
  const question = task ? task.questions[questionKey] : null;

  return (
    <div className="mx-auto container pb-4">
      <h2 className="text-4xl font-bold justify-center flex mb-4">
        Task: {task?.taskName}, Question: {questionKey}
      </h2>
      <div className="border border-gray-500 rounded-lg p-4 mt-4 space-y-4">
        <p className="text-lg font-semibold">Task Description:</p>
        <p className="mb-4">{task?.description.split('\n').map((line: string, idx: number) => (
          <React.Fragment key={idx}>{line}<br /></React.Fragment>
        ))}</p>
        <p className="text-lg font-semibold">Question Description:</p>
        <p className="mb-4">{question?.description.split('\n').map((line: string, idx: number) => (
          <React.Fragment key={idx}>{line}<br /></React.Fragment>
        ))}</p>
        <hr />

        <div style={{ lineHeight: "1.8" }}>
            <p><strong>Brief Instructions:</strong></p>
            <p>For each of the following questions:</p>
            <ol style={{ listStyleType: "circle", marginLeft: "20px" }}>
              <li>Execute at least two queries or questions to find answers for each question.</li>
              <li>You can either ask questions or write keywords to search for issues.</li>
            
              <li>Evaluate the relevance of each found issue to the question based on the following Likert scale:</li>
                <ul style={{ listStyleType: "disc", marginLeft: "20px" }}>
                  <li><strong>Very relevant (5):</strong> The issue contains sufficient information to answer the entire question.</li>
                  <li><strong>Relevant (4):</strong> The issue contains information to answer part of the question.</li>
                  <li><strong>Distantly relevant (3):</strong> The issue does not contain information to answer the question, but the content of the issue is related and helps to refine the search.</li>
                  <li><strong>Less relevant (2):</strong> The issue does not contain information to answer the question, but the content of the issue can be related to the question.</li>
                  <li><strong>Not relevant (1):</strong> The issue has no relation to the question.</li>
                </ul>
                <p>Additional Instructions:</p>
                <ul style={{ listStyleType: "circle", marginLeft: "20px" }}>
                  <li>Please record textual segments (e.g., sentences) from issues that help to answer a question in the results sheet.</li>
                  <li>Also, record their issue IDs and locations.</li>
                </ul>
            </ol>
          </div>
      </div>

      <div className="border border-gray-500 rounded-lg p-4 mt-4 space-y-4">
        {task?.gpt == true && <h1>Type <b><u>Question</u></b></h1>}
        {task?.gpt == false && <h1>Type <b><u>Keywords</u></b></h1>}

        <TextAreaForm
          label="Query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <div className="flex justify-between space-x-4">
          <><div></div></>
          <Button
            label="Search"
            onClick={handleSearch}
            icon={<MagnifyingGlassIcon />}
          />
        </div>
        {isLoading && <p className="text-center mt-4">Loading search results...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>

      {searchResults.length !== 0 && (
        <p className="flex justify-center text-2xl font-bold mt-4">Search results</p>
      )}

      {searchResults.map((result, idx) => {
        let label: string[] = [];
        for (let className of ["existence", "executive", "property"]) {
          if (result[className] === "true") {
            label.push(className);
          }
        }
        if (label.length === 0) {
          if (result["existence"] === null) {
            label.push("Not classified");
          } else {
            label.push("non-architectural");
          }
        }
        return (
          <div
            className="rounded-lg border border-gray-500 p-4 mt-4"
            key={result["issue_id"]}
          >
            <p className="text-lg font-bold">
              {idx + 1}. {result["issue_key"]}: {result["summary"]}
            </p>
            {/* <p className="italic mt-2 text-green-500">
              Issue ID: {result["issue_id"]}
            </p>
            <p className="italic text-green-500">Label: {label.join(", ")}</p>
            <p className="italic text-green-500">
              Score: {result["hit_score"]}
            </p> */}
            <p className="mt-2">
              {result["description"].split('\n').map((line, idx) => (
                <React.Fragment key={idx}>{line}<br /></React.Fragment>
              ))}
            </p>
            <Attachments attachments={result["attachments"]}></Attachments>
            {result["comments"].length !== 0 && (
              <Accordion
                title="Comments"
                answer={<Comments comments={result["comments"]} />}
              />
            )}
            {result["comments"].length === 0 && (
              <div className="rounded-lg border border-gray-500 p-4 mt-4">
                <p>No comments for this issue</p>
              </div>
            )}
            <div className="flex justify-between space-x-4">
              <label className="block mt-4">Rate this result:</label>
              <RadioButtonForm
                label={"Lekert Scale"}
                options={Object.entries(task?.lekert_scale).map(([value, label]) => ({
                  label: label,
                  value: parseInt(value)
                })).sort((a, b) => b.value - a.value)}
                selectedValue={ratings[idx]?.rating}
                onChange={(value) => handleRatingChange(idx, result["issue_id"], value)}
              ></RadioButtonForm>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between space-x-4">
          <><div></div></>
          <Button label="Submit Ratings" onClick={handleSubmitRatings} className="mt-4" />
        </div>
    </div>
  );
}

export default ExperimentSearch;
