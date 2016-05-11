'use strict';

var applicationData = Windows.Storage.ApplicationData.current;
var localFolder = applicationData.localFolder;
var filename = "checkins.csv";
var dataFilename = "data.csv";

function getPersonDetails(locator) {
    return localFolder.createFileAsync(dataFilename, Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.readLinesAsync(file)
                .then(function (lines) {
                    for (var i = 0; i < lines.length; i++) {
                        if (lines[i].substring(0, locator.length) === locator || lines[i].substr(-locator.length) === locator) {
                            //found person details
                            //return person details
                            var temp = lines[i].split(",");
                            var person = {};
                            person.personID = temp[0];
                            person.name = temp[1];
                            person.secureID = temp[2];

                            return person;
                        }
                    }

                    return;
                });
        });
}

function getPersonDetailsByPersonID(personID) {
    var locator = personID + ",";

    return getPersonDetails(locator);
}

function getPersonDetailsBySecureID(secureID) {
    var locator = "," + secureID;

    return getPersonDetails(locator);
}

function checkedInStatus(personID, secureID) {
    if (personID) {
        personID = personID + ",";
    }
    if (secureID) {
        secureID = "," + secureID;
    }

    return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.readLinesAsync(file)
                .then(function (lines) {
                    for (var i = 0; i < lines.length; i++) {
                        if ((personID && lines[i].substring(0, personID.length) === personID) || (secureID && lines[i].substr(-secureID.length) === secureID)) {
                            return true;
                        }
                    }

                    return false;
                });
        });
}

function saveCheckIn(personID, secureID) {
    //if already checked in don't save again
    return checkedInStatus(personID, secureID).then(function (isCheckedIn) {
        if (isCheckedIn) {
            return;
        } else {
            var personInfo = personID + ",";

            if (secureID) {
                personInfo += secureID;
            }

            return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists)
                .then(function (file) {
                    return Windows.Storage.FileIO.appendTextAsync(file, personInfo + "\n");
                });
        }
    });
}

function checkedInCount() {
    return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file)
                .then(function (fileContents) {
                    fileContents = fileContents.toLowerCase();
                    if (fileContents.substr(-1) !== "\n" && fileContents) {
                        fileContents += "\n";
                    }
                    return countOccurrences(fileContents, "\n");
                });
        });
}