'use strict';

var applicationData = Windows.Storage.ApplicationData.current;
var localFolder = applicationData.localFolder;
var filename = "checkins.csv";

function checkedInStatus(personID, secureID) {
    if (personID) {
        personID = personID.toLowerCase() + ",";
    }
    if (secureID) {
        secureID = "," + secureID.toLowerCase() + "\n";
    }

    return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file)
                .then(function (fileContents) {
                    fileContents = fileContents.toLowerCase();
                    if ((personID && fileContents.indexOf(personID) >= 0) || (secureID && fileContents.indexOf(secureID) >= 0)) {
                        return true;
                    } else {
                        return false;
                    }
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