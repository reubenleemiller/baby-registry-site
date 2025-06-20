BABY REGISTRY SITE LOCATED at https://rmbabyregistry.me

Note for Future Use: Google Apps Script with/ Anyone Can Run Access must be listed for rsvp.js to work properly and structured such that the data is pasted in cells A2:E100:

function doGet() {
  return ContentService.createTextOutput("✅ Web App is active and ready for POST submissions.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById('Sheet_ID_Here')
      .getSheetByName('Sheet_Name_Here');

    const data = e.parameter;

    const rangeStartRow = 2;
    const rangeEndRow = 100;
    const columns = 5;

    const values = sheet.getRange(rangeStartRow, 1, rangeEndRow - rangeStartRow + 1, columns).getDisplayValues();

    let rowIndex = -1;
    let debugLog = [];

    for (let i = 0; i < values.length; i++) {
      const row = values[i].map(cell => String(cell).trim());

      // Treat checkbox column (D / index 3) as ignorable if FALSE
      const isMeaningful = row.some((cell, idx) => {
        if (idx === 3 && cell.toUpperCase() === "FALSE") return false;
        return cell !== "";
      });

      debugLog.push(`Row ${rangeStartRow + i}: [${row.join(", ")}] → ${isMeaningful ? "not empty" : "empty"}`);

      if (!isMeaningful) {
        rowIndex = i;
        break;
      }
    }

    Logger.log("Row inspection:");
    Logger.log(debugLog.join("\n"));

    if (rowIndex === -1) {
      return createResponse({
        result: 'Error',
        message: 'RSVP list is full (A2:E100).'
      });
    }

    const targetRow = rangeStartRow + rowIndex;
    const rowData = [
      data.Name || '',
      data.Email || '',
      data.Phone || '',
      true,
      parseInt(data.Guests || "1", 10) // default to 1 if empty
    ];

    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

    Logger.log(`✅ Inserted RSVP at row ${targetRow}: ${JSON.stringify(rowData)}`);

    return createResponse({
      result: 'Success',
      row: targetRow
    });

  } catch (err) {
    Logger.log(`❌ Error in doPost: ${err.message}`);
    return createResponse({
      result: 'Error',
      message: err.message || 'Unknown error'
    });
  }
}

function createResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

