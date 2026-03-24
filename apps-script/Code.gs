const SPREADSHEET_ID = "1ZUs247i9p3DkkQdyOt7jSHzksPNjW63l9roOLuGuuL4";

// IMPORTANT: Do NOT rename the functions doGet and doPost.

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // Auto-create if not exists for easy setup
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case "health":
        return jsonResponse({ status: "ok" });
      case "members":
        return jsonResponse({ data: sheetToObjects(getSheet("Members")) });
      case "metrics":
        return jsonResponse({ data: sheetToObjects(getSheet("MetricCatalog")) });
      case "submissions":
        return jsonResponse({ data: sheetToObjects(getSheet("Submissions")) });
      case "events":
        return jsonResponse({ data: sheetToObjects(getSheet("Events")) });
      case "attendance":
        return jsonResponse({ data: sheetToObjects(getSheet("Attendance")) });
      case "vp_notes":
        return jsonResponse({ data: sheetToObjects(getSheet("VPNotes")) });
      case "sanctions":
        return jsonResponse({ data: sheetToObjects(getSheet("Sanctions")) });
      case "voting_periods":
        return jsonResponse({ data: sheetToObjects(getSheet("VotingPeriods")) });
      case "audit_log":
        return jsonResponse({ data: sheetToObjects(getSheet("AuditLog")) });
      default:
        // By default return everything to local cache to avoid multiple requests
        return jsonResponse({ 
          members: sheetToObjects(getSheet("Members")),
          metrics: sheetToObjects(getSheet("MetricCatalog")),
          submissions: sheetToObjects(getSheet("Submissions")),
          events: sheetToObjects(getSheet("Events")),
          attendance: sheetToObjects(getSheet("Attendance")),
          vp_notes: sheetToObjects(getSheet("VPNotes")),
          sanctions: sheetToObjects(getSheet("Sanctions")),
          voting_periods: sheetToObjects(getSheet("VotingPeriods")),
          audit_log: sheetToObjects(getSheet("AuditLog")),
        });
    }
  } catch(err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    
    const action = data.action;
    const payload = data.payload;

    if (action === "submit_action") {
      return jsonResponse(insertRow("Submissions", payload));
    } else if (action === "review_submission") {
      return jsonResponse(updateRow("Submissions", "submission_id", payload.submission_id, payload));
    } else if (action === "create_event") {
      return jsonResponse(insertRow("Events", payload));
    } else if (action === "mark_attendance") {
      return jsonResponse(insertRows("Attendance", payload)); // Array payload
    } else if (action === "add_sanction") {
      return jsonResponse(insertRow("Sanctions", payload));
    } else if (action === "add_vp_note") {
      return jsonResponse(insertRow("VPNotes", payload));
    } else if (action === "log_audit") {
      return jsonResponse(insertRow("AuditLog", payload));
    } else if (action === "seed_members") {
      return jsonResponse(seedData("Members", payload.headers, payload.rows));
    } else if (action === "seed_metrics") {
      return jsonResponse(seedData("MetricCatalog", payload.headers, payload.rows));
    } else if (action === "update_member") {
      return jsonResponse(updateRow("Members", "member_id", payload.member_id, payload));
    } else if (action === "create_voting_period") {
      return jsonResponse(insertRow("VotingPeriods", payload));
    } else if (action === "upload_proof") {
      return jsonResponse(uploadFileToDrive(payload));
    } else {
      return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch(err) {
    return jsonResponse({ error: err.toString(), stack: err.stack }, 500);
  }
}

// OPTIONS method handler for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(data, code = 200) {
  const result = JSON.stringify({
    ...data,
    statusCode: code
  });
  
  return ContentService.createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getDisplayValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Basic type inference
      let val = row[index];
      if (!isNaN(val) && val !== "") val = Number(val);
      if (val === "TRUE" || val === "true") val = true;
      if (val === "FALSE" || val === "false") val = false;
      obj[header] = val;
    });
    return obj;
  });
}

function insertRow(sheetName, payload) {
  const sheet = getSheet(sheetName);
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  
  if (headers.length === 1 && !headers[0]) {
    headers = Object.keys(payload);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  const autoHeaders = Object.keys(payload);
  autoHeaders.forEach(key => {
    if (!headers.includes(key)) {
      headers.push(key);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  });

  const rowData = headers.map(h => {
    let val = payload[h];
    if (typeof val === 'boolean') return val;
    if (val === null || val === undefined) return "";
    return val;
  });
  
  sheet.appendRow(rowData);
  return { success: true, inserted: payload };
}

function insertRows(sheetName, payloadArray) {
  if (!Array.isArray(payloadArray) || payloadArray.length === 0) return { success: true, count: 0 };
  const sheet = getSheet(sheetName);
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  
  if (headers.length === 1 && !headers[0]) {
    headers = Object.keys(payloadArray[0]);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  const allKeys = new Set();
  payloadArray.forEach(p => Object.keys(p).forEach(k => allKeys.add(k)));
  allKeys.forEach(key => {
    if (!headers.includes(key)) {
      headers.push(key);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  });

  const matrix = payloadArray.map(payload => {
    return headers.map(h => {
      let val = payload[h];
      if (typeof val === 'boolean') return val;
      if (val === null || val === undefined) return "";
      return val;
    });
  });
  
  sheet.getRange(sheet.getLastRow() + 1, 1, matrix.length, headers.length).setValues(matrix);
  return { success: true, count: matrix.length };
}

function updateRow(sheetName, keyColumn, keyValue, updatePayload) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { error: "No data found" };
  
  const headers = data[0];
  const keyIndex = headers.indexOf(keyColumn);
  if (keyIndex === -1) return { error: "Key column not found" };
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] == keyValue) {
      rowIndex = i + 1; // 1-indexed for sheets
      break;
    }
  }
  
  if (rowIndex === -1) return { error: "Record not found" };
  
  Object.keys(updatePayload).forEach(key => {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(updatePayload[key]);
    }
  });
  
  return { success: true, updated: keyValue };
}

function seedData(sheetName, headers, rows) {
  const sheet = getSheet(sheetName);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows && rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  return { success: true, seededRows: rows.length };
}

function uploadFileToDrive(payload) {
  try {
    const { filename, mimeType, base64 } = payload;
    
    // Convert base64 string to a blob
    const decoded = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(decoded, mimeType, filename);
    
    // Find or create "AIESEC_RNR_Proofs" folder
    const folderName = "AIESEC_RNR_Proofs";
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
      // Make folder viewable by anyone with link
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
    
    const file = folder.createFile(blob);
    
    return { success: true, url: file.getUrl() };
  } catch (err) {
    return { error: err.toString() };
  }
}

// ----------------------------------------------------
// FUNCTION TO FORCE DRIVE APP PERMISSION
// Run this function manually once in the Google Editor
// ----------------------------------------------------
function forceDriveAuth() {
  DriveApp.createFolder("TestAuth_RnR").setTrashed(true);
}

