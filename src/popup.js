import SFConnection from '../lib/SFConnection.js';

function populateDebugLevels(debugLevels) {
  const debugLevelSelect = document.getElementById("debugLevelId");
  debugLevelSelect.innerHTML = "";

  debugLevels.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.Id;
    option.textContent = level.DeveloperName;
    debugLevelSelect.appendChild(option);
  });
}

function populateUserRecords(userRecords) {
  const userSelect = document.getElementById("user");
  userSelect.innerHTML = "";

  userRecords.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.Id;
    option.textContent = user.Name;
    userSelect.appendChild(option);
  });
}

async function setDebugLog() {
  const userId = document.getElementById("user").value;
  const debugLevelId = document.getElementById("debugLevelId").value;
  console.log('document.getElementById("startTime").value', document.getElementById("startTime").value);
  const startTime = new Date(document.getElementById("startTime").value).toISOString();
  const endTime = new Date(document.getElementById("endTime").value).toISOString();

  if (!userId) {
    alert("Please select a User.");
    return;
  }

  if (!debugLevelId) {
    alert("Please select a debug level.");
    return;
  }
  
  const body = {
        TracedEntityId: userId,
        DebugLevelId: debugLevelId,
        StartDate: startTime,
        ExpirationDate: endTime,
        LogType: "DEVELOPER_LOG"
      };

  const response = await con.post('/services/data/v57.0/tooling/sobjects/TraceFlag', body);
  console.log('response', response);
  
  if (response.success) {
    alert("Debug log enabled!");
  } else {
    alert("Failed to enable debug log.");
  }
}

function populateDefaultDates(){
  const startTime = document.getElementById("startTime");
  let now = new Date();
  let startTimeFormatted = now.toISOString().slice(0, 16);
  startTime.value = startTimeFormatted;
  const endTime = document.getElementById("endTime");
  let endTimeDate = new Date(now.getTime() + 10 * 60 * 1000);
  let endTimeFormatted = endTimeDate.toISOString().slice(0, 16);
  endTime.value = endTimeFormatted;
}

let con = null;
async function init() {
  con = await new SFConnection().init();

  if(con){
    populateDefaultDates();
    const debugLogs = await con.get('/services/data/v57.0/tooling/query?q=SELECT+Id,+DeveloperName+FROM+DebugLevel');
    populateDebugLevels(debugLogs.records);

    const users = await con.get('/services/data/v57.0/query?q=SELECT+Id,+UserName,+Name+FROM+User+WHERE+IsActive=true');
    populateUserRecords(users.records);
  }
  
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("setDebugLog").addEventListener("click", () => {
      setDebugLog();
  });
});

init();