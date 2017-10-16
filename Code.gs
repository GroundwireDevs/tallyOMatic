// Function that creates a date object for yesterday
function subDaysFromDate(date,d){
  // d = number of day to subtract and date = start date
  var result = new Date(date.getTime()-d*(24*3600*1000));
  return result
}

// Function to handle various date jobs, in this case to return date number, month name or month number, depending on the request
function dateMaker(x) {
  var yesterdayDate = subDaysFromDate(new Date(),1);
  var monthNumber = yesterdayDate.getMonth();
  var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
  var month = months[monthNumber];
  var dateNumber = yesterdayDate.getDate();
  var year = yesterdayDate.getFullYear();
  // Conditional return the data which is requested
  if (x === 'number') {
   return dateNumber; 
  } else if (x === 'monthName') {
   return month; 
  } else if (x === 'monthNumber') {
    return monthNumber;
  }
}

// Function to match yesterday with a sheet and column
function findYesterdaysColumn() {
  // Assigns spreadsheet to variable and sets it to active
  var ss = SpreadsheetApp.openById("SS_URL");
  SpreadsheetApp.setActiveSpreadsheet(ss);
  // Grabs yesterday's month name
  var month = dateMaker('monthName');
  // Sets active sheet to yesterday's month
  SpreadsheetApp.setActiveSheet(ss.getSheetByName(month));
  // Grabs yesterday's date number
  var dateNumber = dateMaker('number');
  // Assigns the range of the 31 possible columns to a variable
  var values = SpreadsheetApp.getActiveSheet().getRange("B2:AF2").getValues();
  // Creates an array with the names of the 31 possible column  
  var columns = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF"]
  // Iterates through each of the columns' row 2 looking for the date number and the cell's value to match
  for (var inc = 0; inc <= 31; inc++) {
    if (values[0][inc] == dateNumber) {
      // If the values match, returns the applicable column name from the columns array
      return columns[inc.toFixed(0)];
    }
  }
  }

// Function to match a coach's name with a row
function findCoachRow(id) {
  // Assigns spreadsheet to variable and sets it to active
  var ss = SpreadsheetApp.openById("SS_URL");
  SpreadsheetApp.setActiveSpreadsheet(ss);
  // Grabs yesterday's month name
  var month = dateMaker('monthName');
  // Sets active sheet to yesterday's month
  SpreadsheetApp.setActiveSheet(ss.getSheetByName(month));
  // Assigns the range of 400 possible rows to a variable
  var values = SpreadsheetApp.getActiveSheet().getRange("AJ1:AJ400").getValues();
  // Iterates through each of the 400 rows looking for the coach's name
  for (var inc = 0; inc <= 400; inc++) {
    if (values[inc] == id) {
      // Adds 1 to the inc so that the row matches up
      inc = inc + 1;
      return inc;
}
}
}

// Returns an auth_token based on an user's email and password for Echo
function echoAuth() {
  var payload = {
     'email' : 'ECHO_EMAIL',
     'password' : 'ECHO_PASSWORD'
  };
   var options = {
   'method' : 'post',
     'payload' : payload
 };
  var response = UrlFetchApp.fetch('https://groundwire.echoglobal.org/sessions.json', options);
  var dataJSON = JSON.parse(response.getContentText()); // Converts the response data into JSON and saves it to the dataJSON variable
  token = dataJSON.auth_token;
  return token;
}

// Function to fetch JSON data from Echo
  function echoFetch(url) {
    var token = echoAuth();
    url = url + "&auth_token=" + token;

    var options = {
      'method' : 'get',
      'contentType': 'application/json'
 };
  var response = UrlFetchApp.fetch(url, options);
  var dataJSON = JSON.parse(response.getContentText()); // Converts the response data into JSON and saves it to the dataJSON variable
    return dataJSON
  }

// Function to find the next empty coach row

function nextCoachRow() {
  // Assigns spreadsheet to variable and sets it to active
  var ss = SpreadsheetApp.openById("SS_URL");
  SpreadsheetApp.setActiveSpreadsheet(ss);
  // Grabs yesterday's month name
  var month = dateMaker('monthName');
  // Sets active sheet to yesterday's month
  SpreadsheetApp.setActiveSheet(ss.getSheetByName(month));
  
  for (var x = 4; x <= 1000; x++) {
    if (SpreadsheetApp.getActiveSheet().getRange("A"+ x).isBlank() == true) {
      return x;
  }
  }
}

// Primary function to tally the spreadsheet based on whether or not a coach took one chat or more yesterday.
function echoImport() {
  // Assigns spreadsheet to variable and sets it to active
  var ss = SpreadsheetApp.openById("SS_URL");
  SpreadsheetApp.setActiveSpreadsheet(ss);
  // Grabs yesterday's month name
  var month = dateMaker('monthName');
  // Sets active sheet to yesterday's month
  SpreadsheetApp.setActiveSheet(ss.getSheetByName(month));
  // Sets yesterday's row to a variable
  var yesterdaysColumn = findYesterdaysColumn();
  // Creates date information for today and yesterday. Needed for the URL.
  var todayDate = new Date();
  var todayMonthNumberPre = todayDate.getMonth();
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  var todayMonthNumber = months[todayMonthNumberPre];
  var todayDateNumber = todayDate.getDate();
  var todayYear = todayDate.getFullYear();
  var yesterdayDate = subDaysFromDate(new Date(),1);
  var yesterdayMonthNumberPre = yesterdayDate.getMonth();
  var yesterdayMonthNumber = months[yesterdayMonthNumberPre];
  var yesterdayDateNumber = yesterdayDate.getDate();
  var yesterdayYear = yesterdayDate.getFullYear();
  
  // Fetches the outcomes_by_user JSON data
  var dataJSON = echoFetch('https://groundwire.echoglobal.org/report/users/outcomes_by_user.json?endDate=%22' + todayYear + '-' + todayMonthNumber + '-' + todayDateNumber + 'T00:00:00.000Z%22&show_average=false&startDate=%22' + yesterdayYear + '-' + yesterdayMonthNumber + '-' + yesterdayDateNumber + 'T00:00:00.000Z%22&threshold=15');
  // Set the number of users who logged in yesterday
  var length = echoFetch('https://groundwire.echoglobal.org/report/users/outcomes_by_user.json?endDate=%22' + todayYear + '-' + todayMonthNumber + '-' + todayDateNumber + 'T00:00:00.000Z%22&show_average=false&startDate=%22' + yesterdayYear + '-' + yesterdayMonthNumber + '-' + yesterdayDateNumber + 'T00:00:00.000Z%22&threshold=15').dataset.length;
  // TODO Forgot why this needs to be subtracted
  length = length - 1;
  var errorRow = 2;
  // Iterates through each coach, setting their applicable cell to the total number of chats they took
  for (var j = 0; j <= length; j++) {
    // Grabs the coach's row, based on their ID
    row = findCoachRow(dataJSON.dataset[j].id);
    // If the row isn't found, it will record their name in column AK, a new row for each missing coach
    if (row == undefined) {
     var nextRow = nextCoachRow();
     var lastRow = nextRow - 1;
     ss.insertRowAfter(lastRow);
     SpreadsheetApp.getActiveSheet().getRange("A" + nextRow).setValue(dataJSON.dataset[j].name);
     SpreadsheetApp.getActiveSheet().getRange("AJ" + nextRow).setValue(dataJSON.dataset[j].id);
     row = nextRow;
    }
      // Sets the initial value of chats (0)
      var value = 0;
      // Goes through each of the chat dispositions, if it can't find that datapoint, it will set a boolean variable to false (not currently used). If the datapoint exists, it will add its value to the value variable
      if (dataJSON.dataset[j].spiritual_conversation == undefined) {
       var spiritual_conversation = false
       } else {
         var value = value + dataJSON.dataset[j].spiritual_conversation;
       }
      if (dataJSON.dataset[j].other == undefined) {
       var other = false
      } else {
         var value = value + dataJSON.dataset[j].other;
       }
      if (dataJSON.dataset[j].no_response == undefined) {
       var no_response = false
      } else {
         var value = value + dataJSON.dataset[j].no_response;
       }
      if (dataJSON.dataset[j].professionof_faith == undefined) {
       var professionof_faith = false
      } else {
         var value = value + dataJSON.dataset[j].professionof_faith;
       }
      if (dataJSON.dataset[j].gospel_presentation == undefined) {
       var gospel_presentation = false
      } else {
         var value = value + dataJSON.dataset[j].gospel_presentation;
       }
    // Sets the final value of value into the coach's row in yesterday's column
    SpreadsheetApp.getActiveSheet().getRange(yesterdaysColumn + row).setValue(value);
    }
  }
