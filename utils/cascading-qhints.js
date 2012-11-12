(function () {
    // Check if a guess is empty
    function isEmpty(guess) {
        return $.trim(guess) === "" ||
                 (guess instanceof Array && $.trim(guess.join("").replace(/,/g, "")) === "");
    }

    // Processes a hint when the user clicks "Check"
    function checkHintAnswer(hint, hintValidator) {
        var pass = hintValidator();
        if (isEmpty(hintValidator.guess)) {
            return;
        }
        if (pass === true) {
            hint.find(".sol input").attr("disabled", "disabled");
            hint.find("#button-container").fadeOut();
            hint.find(".retry-message").fadeOut();
            hint.find(".continue-message").hide().slideDown();
        } else {
            hint.find("#show-answer").fadeIn();
            hint.find("#check-button")
                .effect("shake", {times: 3, distance: 5}, 80)
                .val("Try again");
            hint.find(".continue-message").fadeOut();
            hint.find(".retry-message").hide().slideDown();
        }
    }

    // Processes a hint when the user clicks "Show Answer"
    function showHintAnswer(hint, hintValidator) {
        hintValidator.showGuess(hintValidator.solution);
        checkHintAnswer(hint, hintValidator);
    }
    
    // Creates a new, modified, hint object from the raw hint object
    function createModifiedHintFrom(rawhint) {
        var hint = $("<div></div>");
        
        // Get a validator for the hint solution
        // We force multiple here so that solutions are specified with
        // class="sol" and don't take up the entire hint
        var hintValidator = Khan.answerTypes.multiple(hint, rawhint);
        
        // Mark this as a qhint for border formatting
        hint.addClass("qhint");
        // Hide and format the messages
        hint.find(".continue-message").addClass("qhint-feedback correct").hide();
        hint.find(".retry-message").addClass("qhint-feedback incorrect").hide();

        // Create the buttons
        var checkButton = $('<input type="button" class="simple-button green" id="check-button" value="Check"/>');
        var nextHintButton = $('<input type="button" class="simple-button orange" id="next-hint" value="Next Hint"/>');
        var showAnswerButton = $('<input type="button" class="simple-button orange" id="show-answer" value="Show Solution" style="display:none;">');
        
        // Bind the buttons and events to actions
        checkButton.click(function() {
            checkHintAnswer(hint, hintValidator);
        });
        // Allow the user to check their answer by hitting [ENTER]
        hint.find(".sol input:text").keyup(function(e) {
            if (e.keyCode === 13) {
                checkHintAnswer(hint, hintValidator);
            }
        });
        showAnswerButton.click(function() {
            showHintAnswer(hint, hintValidator);
        });
        nextHintButton.click(function() {
            $("#hint").click();
        });
        // Remove the Next Hint button when the next hint is used
        $(Khan).on("hintUsed allHintsUsed", function() {
            nextHintButton.fadeOut();
        });

        // Attach the buttons to the hint
        var buttonContainer = $('<div id="button-container"></div>');
        buttonContainer.append($('<span style="margin: 5px;"></span>').append(checkButton));
        // If there are more hints left, attach the Next Hint button
        if (!$("#hint").attr("disabled")) {
            buttonContainer.append($('<span style="margin: 5px;"></span>').append(nextHintButton));
        }
        buttonContainer.append($('<span style="margin: 5px; float:right;"></span>').append(showAnswerButton));
        hint.append(buttonContainer);
        return hint;
    }


    $.fn["cascading-qhints"] = function() {
        // Check if this is an unprocessed hint object
        rawhint = $(this).filter(".hint").not(".processed-hint");
        if (rawhint.length === 0) {
            return;
        }
        
        rawhint.addClass("processed-hint");

        // Is the hint a cascading-qhints hint?
        if (rawhint.find(".sol").length !== 0) {
            // If so, replace the hint with a modified hint
            rawhint.replaceWith(createModifiedHintFrom(rawhint));
        }
    };
})();
