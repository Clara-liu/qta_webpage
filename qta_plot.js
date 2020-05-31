function qta(target_data, initial_data) {
    // detach from original object/variable
    var my_data = JSON.parse(JSON.stringify(target_data));
    var time_step = 0.005;
    var target_num = my_data.Height.length;
    var total_dur = my_data.Duration.reduce((a, b) => a + b, 0);
    // round to 3rd decimal place
    total_dur = total_dur.toFixed(3);
    total_dur = parseFloat(total_dur);
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
    var order = initial_data.order

    var c0 = start_pitch - height;
    var c1 = 0 + c0 * lam - slope;

    // formulate coefficients for higher orders
    if (order > 2) {
        var ci = {};
        for (k=2; k<order; k++) {
            ci[k] = 0;
            for (i=0; i<2; i++) {
                ci[k] -= (math.factorial(k) / math.factorial(k - i)) * eval('c' + eval('i').toString()) * Math.pow(-lam, (k - i));
            }
            for (i=2; i<k; i++){
                ci[k] -= (math.factorial(k) / math.factorial(k - i)) * ci[i] * Math.pow(-lam, (k - i));
            }
            ci[k] = ci[k]/math.factorial(k)
        }
    }
    
    // for loop for each sample point to calculate f0_data
    for (i = 0; i < (sample_num+1); i++) {
        var t_s = i * time_step;
        t_s = t_s.toFixed(3);
        t_s = parseFloat(t_s);
        if ((t_s > target_pos + my_data.Duration[target_idx]+0.0001) && target_idx < target_num) {
            // calculate derivatives of previous syllable
            t = my_data.Duration[target_idx];
            let f0_pre = f0_data.F0[i - 1];
            let di = {};
            for (d=1; d<order;d++){
                if (d == 1){
                    var func = '('+ slope.toString() + '*t+' + height.toString() + ')+('+c0.toString()+'+'+
                        c1.toString()+ '*t';
                    for (c=2; c<order;c++){
                        func += '+'+ ci[c].toString() + '*(t^' + c.toString()+')';
                    }
                    func += ')*math.exp(' + -lam.toString() +'*t)';

                    di[d] = math.derivative(func, 't');
                }
                else{
                    di[d] = math.derivative(di[d-1], 't');
                }
            }
            // go to the next syllable
            target_pos = target_pos + my_data.Duration[target_idx];
            target_pos = target_pos.toFixed(3);
            target_pos = parseFloat(target_pos);
            target_idx++;
            // calculate coefficients for the next target based on derivatives above
            lam = my_data.Lambda[target_idx];
            height = my_data.Height[target_idx];
            slope = my_data.Slope[target_idx];

            c0 = f0_pre - height;
            c1 = di[1].evaluate({t: t}) + c0*lam - slope;
            if (order > 2) {
                var ci = {};
                for (k=2; k<order; k++) {
                    ci[k] = di[k].evaluate({t:eval(t)});
                    for (iii=0; iii<2; iii++) {
                        ci[k] -= (math.factorial(k) / math.factorial(k - iii)) *
                            eval('c' + eval('iii').toString()) * Math.pow(-lam, (k - iii));
                    }
                    for (iii=2; iii<k; iii++){
                        ci[k] -= (math.factorial(k) / math.factorial(k - iii)) * ci[iii] * Math.pow(-lam, (k - iii));
                    }
                    ci[k] = ci[k]/math.factorial(k)
                }
            }
        }
        // calculate current f0
        t = t_s - target_pos;
        t = t.toFixed(3);
        t = parseFloat(t);
        f0_data.Time.push(t_s);
        if (order == 2) {
            var f0 = (slope * t + height) +
                (c0 + c1 * t) * Math.exp(-lam * t);
        }
        else {
            var xt = slope * t + height;
            var second_term = c0 + c1 * t;
            for (ii=2; ii<order; ii++){
                second_term += ci[ii] * Math.pow(t, ii);
            }
            second_term = second_term * Math.exp(-lam * t);
            var f0 = xt + second_term;
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
    for (i=0; i<my_data.Height.length; i++){
        if (my_data.Slope[i] == 0){
            plot_decor.b[i] = my_data.Height[i];
        }
        else{
            plot_decor.b[i] = target_data.Height[i] - plot_decor.Syl_mark[i]*my_data.Slope[i];
        }
    }
    plot(f0_data, plot_decor);
}