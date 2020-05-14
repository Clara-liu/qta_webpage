function qta(target_data, initial_data){
    var time_step = 0.005;
    var target_num = target_data.Height.length;
    var total_dur = target_data.Duration.reduce((a,b)=> a+b,0);
    var sample_num = Math.floor(total_dur/time_step);
    var grand_time = 0;
    var f0_data = {
        Time:[],
        F0:[],
        Velocity:[],
        Acceleration: [],
    };
    // for loop for each target to calculate f0_data
}