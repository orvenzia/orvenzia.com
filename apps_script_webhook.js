/**
 * Google Apps Script Web App for Orvenzia Lead Intake
 * Setup:
 * 1) Apps Script > New project
 * 2) Paste this code, save, Deploy > New deployment > type "Web app"
 * 3) Execute as: Me, Who has access: Anyone
 * 4) Copy the Web App URL and set it in leadtracker.js (LEAD_WEBHOOK_URL)
 */
function doPost(e){
  try{
    var data = JSON.parse(e.postData.contents);
    var ss = getSheet_();
    var row = [
      new Date(),
      data.event || '',
      data.page || '',
      data.ref || '',
      JSON.stringify(data.utm || {}),
      data.company || '',
      data.name || '',
      data.title || '',
      data.phone || '',
      data.email || '',
      data.score_pct || '',
      data.ua || '',
      data.locale || '',
      JSON.stringify(data)
    ];
    ss.appendRow(row);
    // Email notify
    var subject = "[Orvenzia Lead] " + (data.event || 'event');
    var body =
      "Event: " + (data.event||'') + "\\n" +
      "Page: " + (data.page||'') + "\\n" +
      "Company: " + (data.company||'') + "\\n" +
      "Name: " + (data.name||'') + "\\n" +
      "Title: " + (data.title||'') + "\\n" +
      "Phone: " + (data.phone||'') + "\\n" +
      "Email: " + (data.email||'') + "\\n" +
      "Score: " + (data.score_pct||'') + "\\n" +
      "UTM: " + JSON.stringify(data.utm||{}) + "\\n" +
      "Referrer: " + (data.ref||'') + "\\n" +
      "UA: " + (data.ua||'') + "\\n" +
      "Raw: " + JSON.stringify(data,null,2);
    MailApp.sendEmail("support@orvenzia.com", subject, body);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
function getSheet_(){
  var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty("SHEET_ID"));
  var sh = ss.getSheetByName("Leads") || ss.insertSheet("Leads");
  if(sh.getLastRow() === 0){
    sh.appendRow(["Timestamp","Event","Page","Referrer","UTM","Company","Name","Title","Phone","Email","Score","UserAgent","Locale","Raw"]);
  }
  return sh;
}
