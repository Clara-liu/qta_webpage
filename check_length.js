function checkLength(original_data, order){
    // get the indexes of the long syllables
    var modified_data = JSON.parse(JSON.stringify(original_data));
    var long_idx = modified_data.Duration.reduce(function(a, v, i){if (v>0.2) a.push(i); return a;},[]);
    // adjust heights for dynamic targets
    for (a = 0; a<modified_data.Height.length; a++) {
        if (!(long_idx.includes(a))){
            modified_data.Height[a] = modified_data.Height[a] - modified_data.Slope[a]*modified_data.Duration[a];
        }
    }
    if (long_idx.length>0) {
        var modify = true;
        // default initial lambda by order
        if (order == 3){
            var default_lambda = 20;
        }
        else{
            var default_lambda = 6.5*order;
        }
        // get week lambda value
        var weak_lambda = prompt("Please specify the initial lambda for the syllables over 200ms:", default_lambda.toString());
        weak_lambda = parseFloat(weak_lambda);
        // defining splitting ratio
        var split_ratio = 0.5;
        // modify lambda and duration
        // also modify target heights for splitting dynamic targets
        for (s = long_idx.length - 1; s >= 0; s--) {
            modified_data.Slope.splice(long_idx[s], 0, modified_data.Slope[long_idx[s]]);
            let later_dur = (modified_data.Duration[long_idx[s]]*(1-split_ratio));
            modified_data.Duration[long_idx[s]] = later_dur;
            let initial_dur = (modified_data.Duration[long_idx[s]]/(1-split_ratio))*split_ratio;
            let original_dur = later_dur+initial_dur;
            let original_height = modified_data.Height[long_idx[s]]
            modified_data.Height[long_idx[s]] = original_height - (modified_data.Slope[long_idx[s]]*later_dur);
            modified_data.Height.splice(long_idx[s], 0, original_height - (modified_data.Slope[long_idx[s]]*original_dur));
            modified_data.Duration.splice(long_idx[s], 0, initial_dur);
            modified_data.Lambda.splice(long_idx[s], 0, weak_lambda);
        }
    }
    else{
        modify = false;
    }
    return {
        modified_data,
        modify
    }
}