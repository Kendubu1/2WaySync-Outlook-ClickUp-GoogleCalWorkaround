function myFunction() {
// Determines calendars the user can access by name & ID
var calendars = CalendarApp.getAllCalendars();
Logger.log('This user owns or is subscribed to %s calendars.',
    calendars.length);
      for(var calendar in calendars) {
          Logger.log(calendars[calendar].getName() +" "+ calendars[calendar].getId());
 
  }


const targetarrr = [];
var addedEventsCounter = 0;
var skippedEventsCounter = 0;
var allDayEventsSkipped = 0;
var targetCalendarEventsInitalCount = 0;
var now = new Date();
var twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); //days * hours * mins * secs * millisecs

var TargetCalendar = CalendarApp.getCalendarById('<target>@group.calendar.google.com');
var TargetCalendarEvents = TargetCalendar.getEvents(now, twoWeeksFromNow);

var SourceCalendar = CalendarApp.getCalendarById('<source>@import.calendar.google.com');
var SourceCalendarEvents = SourceCalendar.getEvents(now, twoWeeksFromNow);


  Logger.log("==========================");
  //Get all events for the next two weeks

  // Logger.log("Source Calendar Set"+ SourceCalendarEvents);
  // Logger.log("=========Source Above===========");
  // //Get the Target Calendar Object & the Events
  // Logger.log("Target Calendar Set"+ TargetCalendarEvents);
  // Logger.log("============target==============");

// if (TargetCalendarEvents.length === 0)
//     { 
//       console.log("Target Calendar is empty!");
//       console.log("Adding first event from source Calendar");
//       TargetCalendar.createEvent(SourceCalendarEvents[0].getTitle(),SourceCalendarEvents[0].getStartTime(),SourceCalendarEvents[0].getEndTime(),SourceCalendarEvents[0].getDescription());
//       var TargetCalendarEvents = TargetCalendar.getEvents(now, twoWeeksFromNow);

//     }

//     else {
  

  for (var targetevent in TargetCalendarEvents) {
      var targeteventname = TargetCalendarEvents[targetevent].getTitle();
      var targeteventstart = TargetCalendarEvents[targetevent].getStartTime();
      var targeteventend = TargetCalendarEvents[targetevent].getEndTime();
      targetarrr.push(targeteventname.trim()+targeteventstart.toTimeString()+targeteventend.toTimeString());
     // Logger.log("target"+ targetevent+targeteventname+targeteventstart+targeteventend);
        // Logger.log("> target index: "+targetevent);
        // Logger.log(targetarrr.length);

      // if (eventname.trim() === targeteventname.trim() && eventstart.toTimeString() === targeteventstart.toTimeString() && eventend.toTimeString() ===targeteventend.toTimeString() ){
      //   Logger.log("Duplicate Event Skipped");
      // } 
      // else{
      //         Logger.log("Event added to Target Calendar: "+eventname);
      //         Logger.log("Event added to Target Calendar: "+eventname);
      //         TargetCalendar.createEvent(eventname,eventstart,eventend,eventdesc);
      // }
    }

//}

  //Loop through each event in other calendar & create in target Calendar
  for (var event in SourceCalendarEvents) {
    if (SourceCalendarEvents[event].isAllDayEvent() === true) {
      allDayEventsSkipped ++;
    }
    else {
          var eventname = SourceCalendarEvents[event].getTitle();
    //var eventname = raweventname.trim();
    var eventstart = SourceCalendarEvents[event].getStartTime();
    var eventend = SourceCalendarEvents[event].getEndTime();
    var eventdesc = SourceCalendarEvents[event].getDescription();
    // var alldaystart = SourceCalendarEvents[event].getAllDayStartDate();
    // var alldayend = SourceCalendarEvents[event].getAllDayEndDate();
    // check if cal is empty
    // Logger.log("SOURCE EVENT Index: "+ event);
    // Logger.log("Source Cal Event to Check: "+ eventname+eventstart+eventend);
     var checker = eventname.trim()+eventstart.toTimeString()+eventend.toTimeString();
    //Logger.log("checkervalue "+checker);
    
    //check existing events to avoid duplicate entires
    //  if (eventname.trim() === targeteventname.trim() && eventstart.toTimeString() === targeteventstart.toTimeString() && eventend.toTimeString() ===targeteventend.toTimeString() ){
     if (targetarrr.includes(checker) ){

        Logger.log("Duplicate Event Skipped");
        skippedEventsCounter ++;
      } 
      else{
              Logger.log("Event added to Target Calendar: "+eventname);
              TargetCalendar.createEvent(eventname,eventstart,eventend,eventdesc);
              addedEventsCounter ++;
      }

    }
    
  
  }
    Logger.log("Total Source Calendar Events:" + SourceCalendarEvents.length);
    Logger.log("Inital Target Calendar Events Count:" + targetCalendarEventsInitalCount);
    Logger.log("All Day Events Skipped:" + allDayEventsSkipped);
    Logger.log("Total Target Calendar Events:" + TargetCalendarEvents.length);
    Logger.log("Skipped Events:" + skippedEventsCounter);
    Logger.log("Added Events:" + addedEventsCounter);


}

