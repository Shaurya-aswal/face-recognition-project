Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "http://127.0.0.1:5000/classify_image",  // ✅ Flask API
        autoProcessQueue: false,
        maxFiles: 1,
        acceptedFiles: "image/*",
        addRemoveLinks: true,
        dictDefaultMessage: "Drop or click to upload a face image"
    });

    dz.on("addedfile", function (file) {
        if (dz.files[1]) dz.removeFile(dz.files[0]);
    });

    $("#submitBtn").on("click", function () {
        if (dz.files.length === 0) {
            alert("Please upload an image first.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = function () {
            const base64Image = reader.result;

            console.log("📤 Sending image to server...");

            $.ajax({
                type: "POST",
                url: "http://127.0.0.1:5000/classify_image",
                data: JSON.stringify({ image_data: base64Image }),
                contentType: "application/json",
                success: function (response) {
                    console.log("✅ Success:", response);
                    displayResult(response);
                },
                error: function (err) {
                    console.error("❌ Upload failed", err.responseText);
                    $("#error").show();
                    $("#resultHolder").hide();
                    $("#divClassTable").hide();
                }
            });
        };

        reader.readAsDataURL(dz.files[0]);
    });
}

function displayResult(data) {
    if (!data || data.length === 0) {
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
