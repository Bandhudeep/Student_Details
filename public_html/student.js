var dbBaseURL = "http://api.login2explore.com:5577";
var dbName = "SCHOOL-DB";
var relationName = "STUDENT-TABLE";
var connToken = "90934591|-31949213678897355|90956684";

$(document).ready(function () {
  $("#rollNo").focus();
});

// === Handle Roll No ===
function checkRollNo() {
  var rollNo = $("#rollNo").val();
  if (rollNo === "") {
    alert("Roll No is required.");
    $("#rollNo").focus();
    return;
  }
  var jsonObj = { id: rollNo };
  var getRequest = createGET_BY_KEYRequest(connToken, dbName, relationName, JSON.stringify(jsonObj));

  jQuery.ajaxSetup({ async: false });
  var response = executeCommandAtGivenBaseUrl(getRequest, dbBaseURL, "/api/irl");
  jQuery.ajaxSetup({ async: true });

  if (response.status === 400) {
    enableFields(true);
    $("#saveBtn, #resetBtn").prop("disabled", false);
  } else if (response.status === 200) {
    fillData(response);
    enableFields(false);
    $("#updateBtn, #resetBtn").prop("disabled", false);
  }
}

// === Enable/Disable Input Fields ===
function enableFields(enable) {
  $("#fullName, #class, #birthDate, #address, #enrollmentDate").prop("disabled", !enable);
}

// === Fill Data in Form if Record Found ===
function fillData(jsonObj) {
  var record = JSON.parse(jsonObj.data).record;
  $("#fullName").val(record.fullName);
  $("#class").val(record.class);
  $("#birthDate").val(record.birthDate);
  $("#address").val(record.address);
  $("#enrollmentDate").val(record.enrollmentDate);
  $("#rollNo").prop("disabled", true);
  localStorage.setItem("recordNumber", JSON.parse(jsonObj.data).rec_no);
}

// === Validate Inputs ===
function validateData() {
  var rollNo = $("#rollNo").val();
  var fullName = $("#fullName").val();
  var studentClass = $("#class").val();
  var birthDate = $("#birthDate").val();
  var address = $("#address").val();
  var enrollmentDate = $("#enrollmentDate").val();

  if (!rollNo || !fullName || !studentClass || !birthDate || !address || !enrollmentDate) {
    alert("All fields are required.");
    return "";
  }

  return JSON.stringify({
    id: rollNo,
    fullName: fullName,
    class: studentClass,
    birthDate: birthDate,
    address: address,
    enrollmentDate: enrollmentDate
  });
}

// === Save New Record ===
function saveData() {
  var jsonData = validateData();
  if (!jsonData) return;

  var putRequest = createPUTRequest(connToken, jsonData, dbName, relationName);

  jQuery.ajaxSetup({ async: false });
  executeCommandAtGivenBaseUrl(putRequest, dbBaseURL, "/api/iml");
  jQuery.ajaxSetup({ async: true });

  resetForm();
}

// === Update Existing Record ===
function updateData() {
  var jsonData = validateData();
  if (!jsonData) return;

  var rec_no = localStorage.getItem("recordNumber");
  var updateRequest = createUPDATERecordRequest(connToken, jsonData, dbName, relationName, rec_no);

  jQuery.ajaxSetup({ async: false });
  executeCommandAtGivenBaseUrl(updateRequest, dbBaseURL, "/api/iml");
  jQuery.ajaxSetup({ async: true });

  resetForm();
}

// === Reset Form ===
function resetForm() {
  $("#rollNo").val("").prop("disabled", false);
  $("#fullName, #class, #birthDate, #address, #enrollmentDate").val("").prop("disabled", true);
  $("#saveBtn, #updateBtn, #resetBtn").prop("disabled", true);
  $("#rollNo").focus();
}

// === JPDB Utility Functions ===
function createPUTRequest(token, jsonObj, dbName, relName) {
  return JSON.stringify({
    token: token,
    dbName: dbName,
    rel: relName,
    cmd: "PUT",
    jsonStr: jsonObj
  });
}

function createGET_BY_KEYRequest(token, dbName, relName, keyJsonStr) {
  return JSON.stringify({
    token: token,
    dbName: dbName,
    rel: relName,
    cmd: "GET_BY_KEY",
    jsonStr: keyJsonStr
  });
}

function createUPDATERecordRequest(token, jsonObj, dbName, relName, rec_no) {
  return JSON.stringify({
    token: token,
    dbName: dbName,
    rel: relName,
    cmd: "UPDATE",
    rec_no: rec_no,
    jsonStr: jsonObj
  });
}

function executeCommandAtGivenBaseUrl(requestString, baseUrl, endpointUrl) {
  var result = "";
  $.ajax({
    url: baseUrl + endpointUrl,
    type: "POST",
    data: requestString,
    contentType: "application/json",
    async: false,
    success: function (response) {
      result = response;
    },
    error: function (err) {
      result = err.responseJSON;
    }
  });
  return result;
}
