'use strict';

function saveCheckin(personID, secureID) {
    var personInfo = personID;

    if (secureID) {
        personInfo += ", " + secureID;
    }

    //todo: if already checked in don't save again

    var applicationData = Windows.Storage.ApplicationData.current;
    var localFolder = applicationData.localFolder;
    var filename = "checkins.csv";

    return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.openIfExists)
        .then(function (file) {
            return Windows.Storage.FileIO.appendTextAsync(file, personInfo + "\n");
        }).done();
}