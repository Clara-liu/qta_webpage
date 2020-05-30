function qta(target_data, initial_data) {
    // detach from original object/variable
    var my_data = JSON.parse(JSON.stringify(target_data));
    var time_step = 0.005;
    var target_num = my_data.Height.length;
    var total_dur = my_data.Duration.reduce((a, b) => a + b, 0);
    var sample_num = Math.floor(total_dur / time_step);
    var target_idx = 0;
    var target_pos = 0.0;
    var t = 0.0;
    var f0_data = {
        Time: [],
        F0: [],
    };
    for (a = 0; a<target_num; a++) {
        my_data.Height[a] = my_data.Height[a] - my_data.Slope[a]*my_data.Duration[a];
    }
    // for now only implementing 3rd order
    // initial coefficients for first syl
    var lam = my_data.Lambda[target_idx];
    var height = my_data.Height[target_idx];
    var slope = my_data.Slope[target_idx];
    var start_pitch = initial_data.pitch_start;

    var c0 = start_pitch - height;
    var c1 = 0 + c0 * lam - slope;
    var c2 = (0 + 2 * c1 * lam - c0*Math.pow(lam,2)) / 2;
    // for loop for each sample point to calculate f0_data
    for (i = 0; i < sample_num; i++) {
        var t_s = i * time_step;
        if ((t_s > target_pos + my_data.Duration[target_idx]) && target_idx < target_num) {
            // calculate derivatives of previous syllable
            t = my_data.Duration[target_idx];
            let f0_pre = f0_data.F0[i - 1];
            let vel_pre = -(lam) *
                (c2 * Math.pow(t, 2) + c1 * t + c0) *
                Math.exp(-lam * t) +
                (2 * c2 * t + c1) *
                Math.exp(-lam * t) +
                slope;
            let acc_pre = Math.pow(lam, 2) *
                (c2 * Math.pow(t, 2) + c1 * t + c0) *
                Math.exp(-lam * t) -
                2 * lam * (2 * c2 * t + c1) *
                Math.exp(-lam * t) +
                2 * c2 * Math.exp(-lam * t);
            // go to the next syllable
            target_pos = target_pos + my_data.Duration[target_idx];
            target_idx++;
            // calculate coefficients for the next target based on derivatives above
            lam = my_data.Lambda[target_idx];
            height = my_data.Height[target_idx];
            slope = my_data.Slope[target_idx];

            c0 = f0_pre - height;
            c1 = vel_pre + c0*lam - slope;
            c2 = (acc_pre + 2*c1*lam - c0*Math.pow(lam,2))/2;
        }
        // calculate current f0
        t = t_s - target_pos;
        f0_data.Time.push(t_s);
        switch (initial_data.order) {
            case 2:
                var f0 = (slope*t + height) +
                    (c0 + c1*t)*Math.exp(-lam*t);
                break;
            default:
                var f0 = (slope*t + height) +
            (c0 + c1*t + c2*Math.pow(t,2))*Math.exp(-lam*t);
                break;
        }
        f0_data.F0.push(f0);
    }
    // extra data needed for plotting
    var plot_decor = {
        Y_range: initial_data.bounds,
        X_range: [0, total_dur],
        Syl_mark: [],
        Duration: my_data.Duration,
        m: my_data.Slope,
        b: []
    };
    my_data.Duration.reduce(function(a,b,i = 0) { return plot_decor.Syl_mark[i] = a+b; },0);
    for (i=0;i<my_data.Height.length;i++){
        if (my_data.Slope[i] == 0){
            plot_decor.b[i] = my_data.Height[i];
        }
        else{
            plot_decor.b[i] = target_data.Height[i] - plot_decor.Syl_mark[i]*my_data.Slope[i];
        }
    }
    plot(f0_data, plot_decor);
}