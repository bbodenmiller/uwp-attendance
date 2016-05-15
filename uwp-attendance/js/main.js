(function () {
    'use strict';

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                //#region scan badge handler
                $("#secureID").keydown(function (e) {
                    // F7 or enter key indicate end of scan
                    if (e.keyCode == 118 || e.keyCode == 13) {
                        checkInBadgeHandler();
                    }
                });
                //#endregion

                //#region manual check-in handlers
                $("#checkInButton").click(function () {
                    checkInButtonClickHandler();
                });

                // if enter key selected on #personID input
                $("#personID").keydown(function (e) {
                    if (e.keyCode == 13) {
                        checkInButtonClickHandler();
                    }
                });
                //#endregion

                updateCheckedInCount();

                //#region rotate logos
                new WinJS.Promise(function (complete, error, progress) {
                    var logos = [];
                    var logoURL;
                    var oldLogoURL;
                    logos.push("ms-appdata:///local/logo.png");
                    logos.push("ms-appdata:///local/logo2.png");
                    logos.push("ms-appdata:///local/logo3.png");

                    setInterval(function () {
                        //get random logo URL (but not same as last one)
                        oldLogoURL = logoURL;
                        do {
                            logoURL = logos[Math.floor(Math.random() * logos.length)];
                        } while (logoURL === oldLogoURL);

                        $(".logo").attr('src', logoURL);
                    }, 15000);
                });
                //#endregion
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
        // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
        // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
    };

    var checkInProcessingCount = 0;

    function resetInputs() {
        $("#personID").val("");
        $("#secureID").val("");
        $("#secureID").focus();
    }

    function startCheckIn() {
        //increment for check-in
        checkInProcessingCount++;

        $("body").append('<div id="checkIn-' + checkInProcessingCount + '">\
                <progress class="win-progress"></progress>\
            </div>');
    }

    function endCheckIn(count) {
        //set timer to clear greeting
        setTimeout(function () {
            $("#checkIn-" + count).remove();
        }, 5000);
    }

    function greetingOutput(string, count) {
        //set greeting
        $("#checkIn-" + count).html('<h2 class="win-h2 greeting">' + string + '</h2>');
        endCheckIn(count);
    }

    function welcomeGreeting(name, count) {
        var greetingString = "Hello, " + name + "!";
        greetingOutput(greetingString, count);
    }

    function errorGreeting(count) {
        var errorString = "An error has occurred, please try again";
        greetingOutput(errorString, count);
    }

    function errorFileIOGreeting(count) {
        var errorString = "A file IO error has occurred, please try again";
        greetingOutput(errorString, count);
    }

    function updateCheckedInCount() {
        getCheckedInCount()
            .then(function (count) {
                $("#checkedInCount").text(count);
            });
    }

    function preventTyping(e) {
        e.preventDefault();
        return false;
    }

    function lockInputs() {
        $("#secureID").keydown(preventTyping);
        $("#personID").keydown(preventTyping);
    }

    function unlockInputs() {
        $("#secureID").unbind('keydown', preventTyping);
        $("#personID").unbind('keydown', preventTyping);
    }

    function checkInBadgeHandler() {
        lockInputs();
        startCheckIn();
        var secureID = $("#secureID").val();
        var count = checkInProcessingCount;
        if (secureID && $.isNumeric(secureID)) { //if valid, e.g. non-blank
            getPersonDetailsBySecureID(secureID)
                .then(function (person) {
                    var personID = null;
                    var name = "Unknown";

                    if (person && person.personID) {
                        personID = person.personID;
                    }

                    if (person && person.name) {
                        name = person.name;
                    }

                    saveCheckIn(personID, secureID)
                        .then(function () {
                            welcomeGreeting(name, count);
                            updateCheckedInCount();
                        }, function () {
                            errorFileIOGreeting(count);
                        });
                });
        } else {
            errorGreeting(count);
        }
        resetInputs();
        unlockInputs();
    }

    function checkInButtonClickHandler(eventInfo) {
        lockInputs();
        startCheckIn();
        var personID = $("#personID").val();
        var count = checkInProcessingCount;
        if (personID && $.isNumeric(personID)) { //if valid, e.g. non-blank
            getPersonDetailsByPersonID(personID)
                .then(function (person) {
                    var name = "Unknown";

                    if (person && person.name) {
                        name = person.name;
                    }

                    saveCheckIn(personID)
                        .then(function () {
                            welcomeGreeting(name, count);
                            updateCheckedInCount();
                        }, function () {
                            errorFileIOGreeting(count);
                        });
                });
        } else {
            errorGreeting(count);
        }
        resetInputs();
        unlockInputs();
    }

    app.start();
}());