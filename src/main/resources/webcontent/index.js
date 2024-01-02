document.getElementById('myButton').addEventListener('click', function() {
    // Every button can use requestData(option) to request data from HAnS-Viz
    // Send message to JCEF
    requestData("buttonClicked")
    requestData("refresh")
});

function requestData(option) {
    window.java({
        request: option,
        persistent: false,
        success: function(response) {
            // response should contain JSON
            handleData(option, response);
        },
        failure: function(error_code, error_message) {
            console.log(error_code, error_message);
        }
    })
}

function handleData(option, response) {
    switch(option) {
        case "refresh":
            // handle refresh data
            break;
        case "tanglingdegree":
            // handle tangling degree data
            break;
    }
}