function checkLength(original_data, order){
    // get the indexes of the long syllables
    var modified_data = JSON.parse(JSON.stringify(original_data));
    var len_threshold = 0.2;
    var trigger_threshold = 0.3;
    var long_idx = modified_data.Duration.reduce(function(a, v, i){if (v>(len_threshold+len_threshold*trigger_threshold)) a.push(i); return a;},[]);
    // adjust heights for dynamic targets (not the ones need splitting)
    for (a = 0; a<modified_data.Height.length; a++) {
        if (!(long_idx.includes(a))){
            modified_data.Height[a] = modified_data.Height[a] - modified_data.Slope[a]*modified_data.Duration[a];
        }
    }
    // resetting parameters due to splitting
    if (long_idx.length>0) {
        var modify = true;
        // show setting window for delay
        document.getElementById('delay_input').style.display = "block";
        // default initial lambda by order
        // get delay settings
        var later_dur = parseFloat(document.getElementById("second_duration").value);
        var default_lambda = document.getElementById("weak_lambda").value;
        // check delay input
        if (isNaN(later_dur) || (default_lambda!= 'default'&&isNaN(parseFloat(default_lambda)))) {
            alert("Please input valid delay settings");
            return;
        }
            // modify lambda and duration, also modify target heights for splitting dynamic targets
        // initiate modification bool array
        modified_data.Weak = new Array(modified_data.Height.length);
        for (i = 0; i<modified_data.Weak.length; i++){modified_data.Weak[i] = false;}

        for (s = long_idx.length - 1; s >= 0; s--) {
            // insert initial slope target (same as second stage target)
            modified_data.Slope.splice(long_idx[s], 0, modified_data.Slope[long_idx[s]]);
            // calculate initial stage duration
            let initial_dur = modified_data.Duration[long_idx[s]]-later_dur;
            if (initial_dur<=0){
                alert("Second stage duration should be shorter than original duration");
                return;
            }
            // modify second stage duration
            modified_data.Duration[long_idx[s]] = later_dur;
            // calculate entire syllable duration
            let original_dur = later_dur+initial_dur;
            // record original target height
            let original_height = modified_data.Height[long_idx[s]]
            // calculate default weak lambda
            if (default_lambda == 'default'){
                var weak_lambda = modified_data.Lambda[long_idx[s]]*Math.pow(later_dur/original_dur,0.9/order);
            }
            else{
                var weak_lambda = parseFloat(default_lambda);
            }
            modified_data.Weak_lambda = weak_lambda;
            // calculate and modify second stage target height based on second duration
            modified_data.Height[long_idx[s]] = original_height - (modified_data.Slope[long_idx[s]]*later_dur);
            // calculate and insert initial stage height based on original duration
            modified_data.Height.splice(long_idx[s], 0, original_height - (modified_data.Slope[long_idx[s]]*original_dur));
            // insert initial stage duration
            modified_data.Duration.splice(long_idx[s], 0, initial_dur);
            // insert initial lambda
            modified_data.Lambda.splice(long_idx[s], 0, weak_lambda);
            // insert modification inidication
            modified_data.Weak.splice(long_idx[s], 0, true)
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