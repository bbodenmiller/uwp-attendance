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
                        //checkinButtonClickHandler();
                        $("#greetingOutput").text($("#secureID").val());
                        $("#secureID").val("");
                    }
                });
                //#endregion

                //#region manual check-in handlers
                $("#checkinButton").click(function () {
                    checkinButtonClickHandler();
                });

                // if enter key selected on #personID input
                $("#personID").keydown(function (e) {
                    if (e.keyCode == 13) {
                        checkinButtonClickHandler();
                    }
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

    function checkinButtonClickHandler(eventInfo) {
        var person = $("#personID").val();
        var greetingString = "Hello, " + person + "!";
        $("#greetingOutput").text(greetingString);
        $("#personID").val("");
        $("#secureID").focus();
    }

    app.start();
}());
