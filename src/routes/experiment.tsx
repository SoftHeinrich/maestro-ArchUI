// src/routes/experiment_form.tsx
import React, { useEffect, useState } from "react";

import { postRequest } from "./util";
import { TextForm } from "../components/forms";
import { Button } from "../components/button";
import { useNavigate } from 'react-router-dom';
function StartExperiment({ label, onClick }) {
  const [mtrNo, setMtrNo] = useState("");
  const forms = [
    {
      label: "Mtr. No",
      password: false,
    }
  ].map((form) => (
    <TextForm
      key={form.label}
      label={form.label}
      value={mtrNo}
      onChange={(e) => setMtrNo(e.target.value)}
      password={form.password}
    />
  ));

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold">{label}</p>
      {forms}
      <div className="flex justify-end">
        <Button label={label} onClick={() => onClick(mtrNo)} />
      </div>
    </div>
  );
}

// ExperimentForm Component

function ExperimentForm({ setTaskData }) {
  let [loginInfo, setLoginInfo] = useState(()=>{
    if(localStorage.getItem("matriculationNumber")) return `Tasks For: ${localStorage.getItem("matriculationNumber")}`
    else
    return "No Tasks yet"});

  useEffect(() => {
    const storedTaskData = localStorage.getItem("taskData");
    const storedMatriculationNumber = localStorage.getItem("matriculationNumber");

    if (storedTaskData && storedMatriculationNumber) {
      // Fetch updated tasks info from the server
      getTasksInfo(storedMatriculationNumber, JSON.parse(storedTaskData));
    }
  }, []);

  function getTasksInfo(mtrNo, currentData = null) {
    let body = {
      "MtrNo": mtrNo,
    };
    postRequest(
      "/tasks",
      body,
      (data) => {
        if (JSON.stringify(data) !== JSON.stringify(currentData)) {
          setLoginInfo(`Tasks For: ${mtrNo}`);
          alert("Task Fetched Successfully");
          setTaskData(data);
          // Save data in local storage
          localStorage.setItem("taskData", JSON.stringify(data));
          localStorage.setItem("matriculationNumber", mtrNo);
          console.log(data);
        }
      }
    );
  }

  return (
    <>
      <p className="text-2xl justify-center flex mb-4">{loginInfo}</p>
      <StartExperiment label="Set Mtr.No" onClick={(mtrNo) => getTasksInfo(mtrNo)} />
    </>
  );
}

// export default ExperimentForm;


function ShowExperiment({ taskData }) {
  const navigate = useNavigate();

  function handleAttempt(questionKey, taskId) {
    navigate(`/archui/experiment-search/${taskId}/${questionKey}`);
  }

  if (!taskData) {
    return <p>No Task Data Available</p>;
  }

  return (
    <div className="space-y-4">
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
        <hr />

      {taskData.map((task, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-2xl font-bold">Task: {task.taskName}</h3>
          <p>{task.description.split('\n').map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}</p>
          {/* <p>{task.task_details.split('\n').map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}</p> */}
          


          <h4 className="text-xl font-bold">Questions:</h4>
          {Object.entries(task.questions).map(([key, question]) => (
            <div key={key} className="p-4 rounded-md mb-2 relative">
              <p className="font-bold">{question.type} Question:</p>
              <p>{question.description.split('\n').map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}</p>
              {/* <p>Design Decision: {Object.keys(question.design_decision).join(", ")}</p> */}
              <div className="absolute top-0 right-0">
                {task.solutions && task.solutions[key] && task.solutions[key].length >= 2 ? (
                  <span className="text-green-500 font-bold">Solved</span>
                  
                ) : (
                  <>
                    <Button label="Attempt" onClick={() => handleAttempt(key, task.taskName)} />
                    
                  </>
                )}
                <span className="text-gray-500 ml-2">solved: {task.solutions && task.solutions[key] ? task.solutions[key].length : 0}/2</span>
              </div>
            </div>
          ))}
        <hr />

        </div>
      ))}
      
    </div>
  );
}

function Experiment() {
  let [taskData, setTaskData] = useState(() => {
    const savedTaskData = localStorage.getItem("taskData");
    return savedTaskData ? JSON.parse(savedTaskData) : null;
  });

  return (
    <div className="container mx-auto w-fit">
      <p className="text-4xl font-bold justify-center flex mb-4">Experiment</p>
      <ExperimentForm setTaskData={setTaskData} />
      <ShowExperiment taskData={taskData} />
    </div>
  );
}

export default Experiment;
