BABY REGISTRY SITE LOCATED at https://rmbabyregistry.me

Note for Future Use: Google Apps Script with/ Anyone Can Run Access must be listed for rsvp.js to work properly and structured such that the data is pasted in cells A2:E100:

```
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
```

Codebase Also Makes Use of a Script which Reads Info in a GSheet with Headers Marked as Follows: 
A, B, C, D, E, F, G
Item, Name,	Link,	Image,	Price,	Purchased,	Category,	Amazon Title
where the E columns must list either TRUE or FALSE based on whether the item has been purchased, one may also use checkboxes

```
function updatePurchasedFromEmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const threads = GmailApp.search('from:registry-update@amazon.ca newer_than:7d');
  const messages = GmailApp.getMessagesForThreads(threads).flat();

  const items = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat(); // Display name
  const amazonTitles = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1).getValues().flat(); // Amazon Title

  messages.forEach(msg => {
    const body = msg.getPlainBody().toLowerCase();

    amazonTitles.forEach((amazonTitle, index) => {
      if (!amazonTitle) return;

      const cleanedBody = body.replace(/\s+/g, ' ').trim();
      const cleanedTitle = amazonTitle.toLowerCase().replace(/\s+/g, ' ').trim();

      // Strict exact match (not just includes)
      const isExactMatch = cleanedBody.split('\n').some(line => line.trim() === cleanedTitle);

      if (isExactMatch) {
        sheet.getRange(index + 2, 5).setValue("TRUE");
      }
    });
  });
}
```

The user then sets a time-based trigger, I set it to trigger once per hour.
