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

    var clearGreetingOutputTimer;

    function resetInputs() {
        $("#personID").val("");
        $("#secureID").val("");
        $("#secureID").focus();
    }

    function greetingOutput(string) {
        //remove timer to clear last set greeting
        clearTimeout(clearGreetingOutputTimer);

        //set greeting
        $("#greetingOutput").text(string);

        //set timer to clear greeting
        clearGreetingOutputTimer = setTimeout(function () {
            $("#greetingOutput").text("");
        }, 5000);
    }

    function welcomeGreeting(name) {
        var greetingString = "Hello, " + name + "!";
        greetingOutput(greetingString);
        resetInputs();
    }

    function errorGreeting() {
        var errorString = "An error has occurred, please try again";
        greetingOutput(errorString);
        resetInputs();
    }

    function errorFileIOGreeting() {
        var errorString = "A file IO error has occurred, please try again";
        greetingOutput(errorString);
        resetInputs();
    }

    function updateCheckedInCount() {
        checkedInCount()
            .then(function (count) {
                $("#checkedInCount").text(count);
            });
    }

    function startCheckIn() {
        $("progress").show();
        $("#secureID").prop('readonly', true);
        $("#personID").prop('readonly', true);
    }

    function endCheckIn() {
        $("progress").hide();
        $("#secureID").prop('readonly', false);
        $("#personID").prop('readonly', false);
    }

    function checkInBadgeHandler() {
        startCheckIn();
        var secureID = $("#secureID").val();
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
                            endCheckIn();
                            updateCheckedInCount();
                            welcomeGreeting(name);
                        }, function () {
                            endCheckIn();
                            errorFileIOGreeting();
                        });
                });
        } else {
            endCheckIn();
            errorGreeting();
        }
    }

    function checkInButtonClickHandler(eventInfo) {
        startCheckIn();
        var personID = $("#personID").val();
        if (personID && $.isNumeric(personID)) { //if valid, e.g. non-blank
            getPersonDetailsByPersonID(personID)
                .then(function (person) {
                    var name = "Unknown";

                    if (person && person.name) {
                        name = person.name;
                    }

                    saveCheckIn(personID)
                        .then(function () {
                            endCheckIn();
                            updateCheckedInCount();
                            welcomeGreeting(name);
                        }, function () {
                            endCheckIn();
                            errorFileIOGreeting();
                        });
                });
        } else {
            endCheckIn();
            errorGreeting();
        }
    }

    app.start();
}());