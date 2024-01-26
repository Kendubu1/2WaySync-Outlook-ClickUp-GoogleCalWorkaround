function myFunction() {
    // Constants for Calendar IDs and Cancellation Prefix
    const sourceCalendarId = '<your-source-calID>@import.calendar.google.com';
    const targetCalendarId = '<your-target-calID>@group.calendar.google.com';
    const canceledPrefix = "Canceled: ";

    // Define date range
    var now = new Date();
    var twoWeeksFromNow = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));

    // Fetch events from calendars
    var sourceEvents = getCalendarEvents(sourceCalendarId, now, twoWeeksFromNow);
    var targetEvents = getCalendarEvents(targetCalendarId, now, twoWeeksFromNow);

    // Fetch stored record of synced events
    var syncedEventsRecord = getSyncedEventsRecord();

    // Check and remove deleted or canceled events
    checkAndRemoveDeletedOrCanceledEvents(targetEvents, syncedEventsRecord, targetCalendarId, canceledPrefix);

    // Map to store target event details for duplication, cancellation, and movement check
    var targetEventsMap = createEventsMap(targetEvents);

    // Initialize counters
    var addedEventsCounter = 0, skippedEventsCounter = 0, allDayEventsSkipped = 0, canceledEventsSkipped = 0;

    // Loop through source events
    sourceEvents.forEach(event => {
        var eventTitle = event.getTitle();
        if (event.isAllDayEvent() || eventTitle.startsWith(canceledPrefix)) {
            allDayEventsSkipped += event.isAllDayEvent() ? 1 : 0;
            canceledEventsSkipped += eventTitle.startsWith(canceledPrefix) ? 1 : 0;
            return;
        }

        var eventKey = generateEventKey(event);
        if (syncedEventsRecord[event.getId()]) {
            // Event has been moved or changed
            if (targetEventsMap.has(syncedEventsRecord[event.getId()])) {
                var targetEvent = CalendarApp.getCalendarById(targetCalendarId).getEventById(syncedEventsRecord[event.getId()]);
                if (targetEvent) {
                    targetEvent.setTime(event.getStartTime(), event.getEndTime());
                    targetEvent.setTitle(eventTitle);
                }
            }
        } else if (!targetEventsMap.has(eventKey)) {
            try {
                // Add new event to target calendar
                var newEvent = CalendarApp.getCalendarById(targetCalendarId)
                                           .createEvent(eventTitle, event.getStartTime(), event.getEndTime(), event.getDescription());
                addedEventsCounter++;
                // Update the record with the new event ID
                syncedEventsRecord[event.getId()] = newEvent.getId();
            } catch (e) {
                Logger.log("Error adding event: " + e.message);
            }
        } else {
            skippedEventsCounter++;
        }
    });

    // Update the record after syncing
    updateSyncedEventsRecord(syncedEventsRecord);

    // Logging results
    Logger.log("Total Source Calendar Events: " + sourceEvents.length);
    Logger.log("All Day Events Skipped: " + allDayEventsSkipped);
    Logger.log("Canceled Events Skipped: " + canceledEventsSkipped);
    Logger.log("Skipped Events: " + skippedEventsCounter);
    Logger.log("Added Events: " + addedEventsCounter);
}

function getCalendarEvents(calendarId, startTime, endTime) {
    return CalendarApp.getCalendarById(calendarId).getEvents(startTime, endTime);
}

function createEventsMap(events) {
    var map = new Map();
    events.forEach(event => {
        map.set(generateEventKey(event), event.getId());
    });
    return map;
}

function generateEventKey(event) {
    return event.getTitle().trim() + event.getStartTime().toISOString() + event.getEndTime().toISOString();
}

function checkAndRemoveDeletedOrCanceledEvents(targetEvents, syncedEventsRecord, targetCalendarId, canceledPrefix) {
    var targetCalendar = CalendarApp.getCalendarById(targetCalendarId);
    Object.values(syncedEventsRecord).forEach(recordedEventId => {
        var event = targetCalendar.getEventById(recordedEventId);
        if (event && (event.getTitle().startsWith(canceledPrefix) || !targetEvents.some(e => e.getId() === recordedEventId))) {
            try {
                event.deleteEvent();
                // Remove the event ID from the record
                delete syncedEventsRecord[Object.keys(syncedEventsRecord).find(key => syncedEventsRecord[key] === recordedEventId)];
            } catch (e) {
                Logger.log("Error removing canceled or deleted event: " + e.message);
            }
        }
    });
}

// Placeholder functions for getting and updating the synced events record
function getSyncedEventsRecord() {
    // Example implementation using Properties Service
    var record = PropertiesService.getScriptProperties().getProperty('syncedEvents');
    return record ? JSON.parse(record) : {};
}

function updateSyncedEventsRecord(record) {
    // Example implementation using Properties Service
    PropertiesService.getScriptProperties().setProperty('syncedEvents', JSON.stringify(record));
}
