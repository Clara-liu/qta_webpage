function getFormData() {
    // initialise datasets for core function
    var inputValues = {
        Height: [],
        Slope: [],
        Duration: [],
        Lambda: [],
    };
    var initialSettings = {
        pitch_start:0,
        bounds:[],
        order:0
    };
    initialSettings.pitch_start = parseFloat(document.getElementById("start_pitch").value);
    initialSettings.bounds.push(parseFloat(document.getElementById("lower_bound").value));
    initialSettings.bounds.push(parseFloat(document.getElementById("upper_bound").value));
    initialSettings.order = parseFloat(document.getElementById("order").value);
    if (initialSettings.pitch_start<initialSettings.bounds[0] || initialSettings.pitch_start>initialSettings.bounds[1]){
        alert("Starting pitch must be within lower and upper bounds!");
        return;
    }
    var tones = document.getElementById("tone_sequence").value;
    var durations = document.getElementById("duration_sequence").value;
    var lambdas = document.getElementById("lambda_sequence").value;
    if (tones.length!= durations.length || tones.length!= lambdas.length){
        alert("Sequence length between tones/durations/strengths must be equal!");
        return;
    }
    // record pitch targets specifications
    for (t=0; t<tones.length; t++){
        switch(tones[t]){
            case "H":
                var height = parseFloat(document.getElementById("h_height").value);
                var slope = parseFloat(document.getElementById("h_slope").value);
                break;
            case "R":
                var height = parseFloat(document.getElementById("r_height").value);
                var slope = parseFloat(document.getElementById("r_slope").value);
                break;
            case "L":
                var height = parseFloat(document.getElementById("l_height").value);
                var slope = parseFloat(document.getElementById("l_slope").value);
                break;
            case "F":
                var height = parseFloat(document.getElementById("f_height").value);
                var slope = parseFloat(document.getElementById("f_slope").value);
                break;
            case "N":
                var height = parseFloat(document.getElementById("n_height").value);
                var slope = parseFloat(document.getElementById("n_slope").value);
                break;
            default:
                alert("Please input a valid tone specification!");
                return;
        }
        inputValues.Height.push(height);
        inputValues.Slope.push(slope);
    }
    // record duration specifications
    for (d=0;d<durations.length;d++){
        switch (durations[d]) {
            case "s":
                var duration = parseFloat(document.getElementById("short").value);
                break;
            case "n":
                var duration = parseFloat(document.getElementById("normal").value);
                break;
            case "l":
                var duration = parseFloat(document.getElementById("long").value);
                break;
            default:
                alert("Please input a valid duration specification!");
                return;
        }
        inputValues.Duration.push(duration);
    }
    // record lambda specifications
    for (l=0;l<lambdas.length;l++){
        switch (lambdas[l]) {
            case "w":
                var lambda = parseFloat(document.getElementById("weak").value);
                break;
            case "n":
                var lambda = parseFloat(document.getElementById("neutral").value);
                break;
            case "s":
                var lambda = parseFloat(document.getElementById("strong").value);
                break;
            default:
                alert("Please input a valid strength specification!");
                return;
        }
        inputValues.Lambda.push(lambda);
    }
    // check whether pitch targets are within limit range
    for (v=0; v<inputValues.Height.length; v++){
        if (inputValues.Height[v] < initialSettings.bounds[0] || inputValues.Height[v] > initialSettings.bounds[1]){
            alert("Target heights must be within lower and upper bounds!");
            return;
        }
    }
    qta(inputValues, initialSettings);
}