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
  const startTime = new Date(document.getElementById("startTime").value);
  const endTime = new Date(document.getElementById("endTime").value);

  if (!userId) {
    alert("Please select a User.");
    return;
  }

  //check existing logs
  const traceFlagResponse = await con.get('/services/data/v57.0/tooling/query?q=SELECT+Id+FROM+TraceFlag+WHERE+TracedEntityId=\''+userId+'\'+AND+DebugLevelId=\''+debugLevelId+'\'');
  
  let traceFlag = null;
  if(traceFlagResponse?.records?.length > 0){
    traceFlag = traceFlagResponse.records[0];
  }

  if (!debugLevelId) {
    alert("Please select a debug level.");
    return;
  }

  if (startTime >= endTime) {
    alert("Start time must be earlier than end time.");
    return;
  }

  if(traceFlag){
    const body = {
      StartDate: startTime.toISOString(),
      ExpirationDate: endTime.toISOString()
    };

    try {
      const response = await con.patch('/services/data/v57.0/tooling/sobjects/TraceFlag/'+traceFlag.Id, body);
      if (response === 'success'){
        alert("Debug log updated successful!");
      }
    } catch (error) {
      console.error('error',error);
      alert(error)
    }

  } else{
    const body = {
      TracedEntityId: userId,
      DebugLevelId: debugLevelId,
      StartDate: startTime.toISOString(),
      ExpirationDate: endTime.toISOString(),
      LogType: "DEVELOPER_LOG"
    };

    try {
      const response = await con.post('/services/data/v57.0/tooling/sobjects/TraceFlag', body);
      if (response.success) {
        alert("Debug log created!");
      }
    } catch (error) {
      console.error('error',error);
      alert(error)
    }

  }

  

}

function populateDefaultDates() {
  const now = new Date();
  const localStartTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('startTime').value = localStartTime;
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
  const localEndTime = new Date(tenMinutesLater.getTime() - tenMinutesLater.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('endTime').value = localEndTime;
}

let con = null;
async function init() {
  con = await new SFConnection().init();

  if (con) {
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