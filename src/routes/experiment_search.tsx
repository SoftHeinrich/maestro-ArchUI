// src/routes/experiment_search.tsx
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
// Types for SearchResult and Ratings

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

  const handleSearch = () => {
    const task = taskData?.find((t: any) => t["taskName"] === taskId);
    const question = task?.questions[questionKey];
    
    const tmp = task?.rerank_engine ? {
      existence: question?.design_decision?.existence ?? null,
      executive: question?.design_decision?.executive ?? null,
      property: question?.design_decision?.property ?? null,
    } : {
      existence: null,
      executive: null,
      property: null,
    };
    postRequestSearchEngine(
      "/search",
      {
        database_url: getDatabaseURL(),
        model_id: selectedModel.modelId,
        version_id: selectedModel.versionId,
        repos_and_projects: { Apache: ["HDFS"] }, // Assuming predefined repo and project
        query: searchQuery,
        num_results: 10,
        predictions: tmp,
      },
      (data) => setSearchResults([...data["payload"]])
    );
  };

  const handleRatingChange = (index: number, resultId: number, rating: string) => {
    setRatings({ ...ratings, [index]: { issue_id: resultId, rating } });
    console.log(ratings);
  };

  const handleSubmitRatings = () => {
    if (Object.keys(ratings).length === searchResults.length) {
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
  
      postRequest("/submit-ratings", experimentData, (response) => {
        if (response.success) {
          alert("Ratings submitted successfully");
          // navigate(`/archui/experiment`);
        } else {
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
        <p>{task?.task_details.split('\n').map((line: string, idx: number) => (
          <React.Fragment key={idx}>{line}<br /></React.Fragment>
        ))}</p>
      </div>

      <div className="border border-gray-500 rounded-lg p-4 mt-4 space-y-4">
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
      </div>

      {/* <div className="border border-gray-500 rounded-lg p-4 mt-4 space-y-4"> */}
        {searchResults.length !== 0 ? (
          <p className="flex justify-center text-2xl font-bold">Search results</p>
        ) : null}

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
              <p className="italic mt-2 text-green-500">
                Issue ID: {result["issue_id"]}
              </p>
              <p className="italic text-green-500">Label: {label.join(", ")}</p>
              <p className="italic text-green-500">
                Score: {result["hit_score"]}
              </p>
              <p className="mt-2">
                {result["description"].split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>{line}<br /></React.Fragment>
                ))}
              </p>
              <Attachments attachments={result["attachments"]}></Attachments>
              {result["comments"].length!=0 && (
                <Accordion
                  title="Comments"
                  answer={<Comments comments={result["comments"]} />}
                />
              )}
              {result["comments"].length==0 && (
                <div
              className="rounded-lg border border-gray-500 p-4 mt-4">
                <p> No comments for this issue</p>
                </div>
              )}
              <div className="flex justify-between space-x-4">
              <label className="block mt-4">Rate this result:</label>
              <RadioButtonForm
              label={"Lekert Scale"}
              options={Object.entries(task?.lekert_scale).map(([value, label]) => ({
                label: label,
                value: parseInt(value)
              }))}
              selectedValue={ratings[idx]?.rating}
              onChange={(value)=> handleRatingChange(idx, result["issue_id"], value)}
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
