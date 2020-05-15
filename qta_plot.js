function qta(target_data, initial_data) {
    var time_step = 0.005;
    var target_num = target_data.Height.length;
    var total_dur = target_data.Duration.reduce((a, b) => a + b, 0);
    var sample_num = Math.floor(total_dur / time_step);
    var target_idx = 0;
    var target_pos = 0.0;
    var t = 0.0;
    var f0_data = {
        Time: [],
        F0: [],
    };
    // for now only implementing 3rd order
    // initial coefficients for first syl
    var c1 = initial_data.pitch_start - target_data.Height[target_idx];
    var c2 = 0 + c1 * target_data.Lambda[target_idx] - target_data.Slope[target_idx];
    var c3 = (0 + 2 * c2 * target_data.Lambda[target_idx] - c1*Math.pow(target_data.Lambda[target_idx],2)) / 2;
    // for loop for each sample point to calculate f0_data
    for (i = 0; i < sample_num; i++) {
        var t_s = i * time_step;
        if ((t_s > target_pos + target_data.Duration[target_idx]) && target_idx < target_num) {
            // calculate derivatives of previous syllable
            t = target_data.Duration[target_idx];
            let f0_pre = f0_data.F0[i - 1];
            let vel_pre = -(target_data.Lambda[target_idx]) *
                (c3 * Math.pow(t, 2) + c2 * t + c1) *
                Math.exp(-target_data.Lambda[target_idx] * t) +
                (2 * c3 * t + c2) *
                Math.exp(-target_data.Lambda[target_idx] * t) +
                target_data.Slope[target_idx];
            let acc_pre = Math.pow(target_data.Lambda[target_idx], 2) *
                (c3 * Math.pow(t, 2) + c2 * t + c1) *
                Math.exp(-target_data.Lambda[target_idx] * t) -
                2 * target_data.Lambda[target_idx] * (2 * c3 * t + c2) *
                Math.exp(-target_data.Lambda[target_idx] * t) +
                2 * c3 * Math.exp(-target_data.Lambda[target_idx] * t);
            // go to the next syllable
            target_pos = target_pos + target_data.Duration[target_idx];
            target_idx++;
            // calculate coefficients for the next target based on derivatives above
            c1 = f0_pre - target_data.Height[target_idx];
            c2 = vel_pre + c1*target_data.Lambda[target_idx] - target_data.Slope[target_idx];
            c3 = (acc_pre + 2*c2*target_data.Lambda[target_idx] - c1*Math.pow(target_data.Lambda[target_idx],2))/2;
        }
        // calculate current f0
        t = t_s - target_pos;
        f0_data.Time.push(t_s);
        switch (initial_data.order) {
            case 2:
                var f0 = (target_data.Slope[target_idx]*t + target_data.Height[target_idx]) +
                    (c1 + c2*t)*Math.exp(-target_data.Lambda[target_idx]*t);
                break;
            default:
                var f0 = (target_data.Slope[target_idx]*t + target_data.Height[target_idx]) +
            (c1 + c2*t + c3*Math.pow(t,2))*Math.exp(-target_data.Lambda[target_idx]*t);
                break;
        }
        f0_data.F0.push(f0);
    }
    console.log(f0_data);
    return f0_data;
}