Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/", // Not used, handled manually
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop or click to upload a face image",
        autoProcessQueue: false,
        acceptedFiles: "image/*"
    });

    dz.on("addedfile", function (file) {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]); // Only keep one file
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;

        console.log("Sending image to server...");
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:5000/classify_image',
            data: JSON.stringify({ image_data: imageData }),
            contentType: 'application/json',
            success: function (data) {
                console.log("✅ Success:", data);
                displayResult(data);
            },
            error: function (err) {
                console.error("❌ Upload failed", err.responseText);
                $("#error").show();
                $("#resultHolder").hide();
                $("#divClassTable").hide();
            }
        });
    });

    $("#submitBtn").on("click", function () {
        dz.processQueue();
    });
}

function displayResult(data) {
    if (!data || data.length == 0) {
        $("#error").show();
        $("#resultHolder").hide();
        $("#divClassTable").hide();
        return;
    }

    let match = null;
    let bestScore = -1;

    for (let i = 0; i < data.length; ++i) {
        let maxScore = Math.max(...data[i].class_probability);
        if (maxScore > bestScore) {
            match = data[i];
            bestScore = maxScore;
        }
    }

    if (match) {
        $("#error").hide();
        $("#resultHolder").show();
        $("#divClassTable").show();
        $("#resultHolder").html($(`[data-player="${match.class}"]`).html());

        let classDict = match.class_dictionary;
        for (let person in classDict) {
            let idx = classDict[person];
            let score = match.class_probability[idx];
            $(`#score_${person}`).html(score + " %");
        }
    }
}

$(document).ready(function () {
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    init();
});
