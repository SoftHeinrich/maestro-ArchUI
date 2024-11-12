// src/routes/experiment_form.tsx
import React, { useState } from "react";
import { postRequest } from "./util";
import { TextForm } from "../components/forms";
import { Button } from "../components/button";

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

function ExperimentForm({ setTaskData }) {
  let [loginInfo, setLoginInfo] = useState("No Tasks yet");

  function getTasksInfo(mtrNo) {
    let body = {
      "MtrNo": mtrNo,
    };
    postRequest(
      "/tasks",
      body,
      (data) => {
        setLoginInfo(`Tasks For: ${mtrNo}`);
        alert("Task Fetched Successfully");
        setTaskData(data);
        // Save data in local storage
        localStorage.setItem("taskData", JSON.stringify(data));
        localStorage.setItem("matriculationNumber", mtrNo);
        console.log(data);
      }
    );
  }

  return (
    <>
      <p className="text-2xl justify-center flex mb-4">{loginInfo}</p>
      <StartExperiment label="Set Mtr.No" onClick={getTasksInfo} />
    </>
  );
}

function ShowExperiment({ taskData }) {
  if (!taskData) {
    return <p>No Task Data Available</p>;
  }

  return (
    <div className="space-y-4">
      {taskData.map((task, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-2xl font-bold">Task: {task.taskName}</h3>
          {/* <p>{task.description}</p> */}
          <p>{task.description.split('\n').map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}</p>
          <p>{task.task_details.split('\n').map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}</p>
          <h4 className="text-xl font-bold">Questions:</h4>
          {Object.entries(task.questions).map(([key, question]) => (
            <div key={key} className=" p-4 rounded-md mb-2">
              <p className="font-bold">{question.type} Question:</p>
              <p>{question.description}</p>
              {/* <p>Design Decision: {Object.keys(question.design_decision).join(", ")}</p> */}
            </div>
          ))}
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
