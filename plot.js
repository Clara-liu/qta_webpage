function plot(df, decor){
    var trace = {
        type: "scatter",
        x: df.Time,
        y: df.F0,
        mode:"lines",
        name: "F0 (Hz)",
        line:{
            color: "rgb(55, 128, 191)",
            width: 2
        }
    };
    var layout = {
        width: 1000,
        height:450,
        paper_bgcolor: "LightSteelBlue",
        margin: {
            l: 55,
            r: 50,
            t: 40,
            b: 40
        },
        yaxis:{
            range: decor.Y_range,
            title:{
                text: "F0(Hz)",
                font:{
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        xaxis:{
            range: decor.X_range,
            title:{
                text: "Time(s)",
                font:{
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        },
        shapes:[]
    };
    // add lines for syllable boundaries and targets
    for (i=0;i<decor.Syl_mark.length;i++){
         let line = {
            type: "line",
            x0: decor.Syl_mark[i],
            y0: decor.Y_range[0],
            x1: decor.Syl_mark[i],
            y1: decor.Y_range[1],
            line: {
                color:"rgb(153, 216, 201)",
                width: 2,
                dash: "dash"
            }
        };
        layout.shapes.push(line);
    }
    for (i=0;i<decor.m.length;i++){
        let target = {
            type: "line",
            x0: decor.Syl_mark[i]- decor.Duration[i],
            y0: 0,
            x1: decor.Syl_mark[i],
            y1: 0,
            line: {
                color: "rgb(81,80,80)",
                width: 2,
                dash: "dot"
            }
        };
        target.y0 = target.x0*decor.m[i] + decor.b[i]
        target.y1 = target.x1*decor.m[i] + decor.b[i]
        layout.shapes.push(target);
    }
    if ('Weak_mark' in decor){
        for (i=0; i<decor.Weak_mark.length;i++){
            let rect = {
                type:"rect",
                xref: "x",
                yref: "y",
                x0: decor.Weak_mark[i][0],
                y0: decor.Y_range[0],
                x1:decor.Weak_mark[i][1],
                y1: decor.Y_range[1],
                fillcolor: "#d3d3d3",
                opacity: 0.25,
                line:{
                    width:0
                }
            }
            layout.shapes.push(rect);
        }
        var weak_value = 'Weak lambda: '.concat(decor.Weak_lambda);
        layout.annotations = [{
            x: decor.Syl_mark[decor.Syl_mark.length-2],
            y: decor.Y_range+1,
            xref: 'x',
            yref: 'y',
            text: weak_value,
            showarrow: false
        }]
    }
    Plotly.newPlot("plot", [trace], layout);
}