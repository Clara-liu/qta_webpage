function checkLength(original_data, order){
    // get the indexes of the long syllables
    var modified_data = JSON.parse(JSON.stringify(original_data));
    var len_threshold = 0.2;
    var long_idx = modified_data.Duration.reduce(function(a, v, i){if (v>len_threshold) a.push(i); return a;},[]);
    // adjust heights for dynamic targets (not the ones need splitting)
    for (a = 0; a<modified_data.Height.length; a++) {
        if (!(long_idx.includes(a))){
            modified_data.Height[a] = modified_data.Height[a] - modified_data.Slope[a]*modified_data.Duration[a];
        }
    }
    // resetting parameters due to splitting
    if (long_idx.length>0) {
        // might come in handy later
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
            // insert initial slope target (same as second stage target)
            modified_data.Slope.splice(long_idx[s], 0, modified_data.Slope[long_idx[s]]);
            // calculate second stage duration
            let later_dur = (modified_data.Duration[long_idx[s]]*(1-split_ratio));
            // modify second stage duration
            modified_data.Duration[long_idx[s]] = later_dur;
            // calculate initial stage duration
            let initial_dur = (modified_data.Duration[long_idx[s]]/(1-split_ratio))*split_ratio;
            // calculate entire syllable duration
            let original_dur = later_dur+initial_dur;
            // record original target height
            let original_height = modified_data.Height[long_idx[s]]
            // calculate and modify second stage target height based on second duration
            modified_data.Height[long_idx[s]] = original_height - (modified_data.Slope[long_idx[s]]*later_dur);
            // calculate and insert initial stage height based on original duration
            modified_data.Height.splice(long_idx[s], 0, original_height - (modified_data.Slope[long_idx[s]]*original_dur));
            // insert initial stage duration
            modified_data.Duration.splice(long_idx[s], 0, initial_dur);
            // insert initial lambda
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