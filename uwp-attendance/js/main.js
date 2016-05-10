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

    function updateCheckedInCount() {
        checkedInCount()
            .then(function (count) {
                $("#checkedInCount").text(count);
            });
    }

    function checkInBadgeHandler() {
        var secureID = $("#secureID").val();
        if (secureID && $.isNumeric(secureID)) { //if valid, e.g. non-blank
            var person = secureID; //todo: lookup person
            var personID = null; //todo: lookup personID
            saveCheckIn(personID, secureID).then(function () {
                updateCheckedInCount();
                welcomeGreeting(person);
            });
        } else {
            errorGreeting();
        }
    }

    function checkInButtonClickHandler(eventInfo) {
        var personID = $("#personID").val();
        if (personID && $.isNumeric(personID)) { //if valid, e.g. non-blank
            var person = personID; //todo: lookup person
            saveCheckIn(personID).then(function () {
                updateCheckedInCount();
                welcomeGreeting(person);
            });
        } else {
            errorGreeting();
        }
    }

    app.start();
}());