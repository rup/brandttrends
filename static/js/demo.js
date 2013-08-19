


Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color, max, min) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L"],        
    rowHeight = 25,
    columnWidth = w / wv;
        
    var txt = {
        'font': '7px', 
        fill: '#afafaf'
    };
        
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);                        
    }
        
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
        
    var c = max - min;
    var s = c / 6;
        
    var t1 = max - s,
    t2 = max - s*3,
    t3 = max - s*5;
        
    var tf = function(s) { 
        //return s;
        s = s/1000;
        s = Math.round(s*10)/10;
        s += 'k';
        return s;
    };
        
    //this.text(15, 25, tf(t1)).attr(txt).toBack();
        
    //this.text(15, 75, tf(t2)).attr(txt).toBack();
        
    //this.text(15, 125, tf(t3)).attr(txt).toBack();                        
        
    return this.path(path.join(",")).attr({
        stroke: color
    });
};
    
var ChartAppView = Backbone.View.extend({
    //曲线总数
    Data: null,
    Days: 0,
    allValues: null,
    //初始值
    options: {
        el: 'graphs-view-body',            
        type: 'abs',        
        width: 680,
        height: 200,
        leftgutter: 25,
        rightgutter: 20,
        topgutter: 10,
        bottomgutter: 30,
        lineType: 'L'
    },
    //初始化
    initialize: function(options){
        _.extend(options, this.options);
        $(this.options.el).show();
            
        this.Data = [];           
        this.allValues = [];
    },
    
    //获取数据长度
    getDataCount: function() {
        return this.Data.length;
    },
    
    //获取天数(即X轴坐标点数目)
    getDays: function() {
        return this.Days;
    },

    //        
    drawInit: function() {            
        this.r = Raphael(this.options.el, this.options.width, this.options.height);
            
        //绘制背景表格            
        this.r.drawGrid(
            0,
            0,
            this.options.width,
            this.options.height,
            0, 
            7,                
            "#efefef",
            this.getMaxValue(),
            this.getMinValue()
        );
                    
        //绘制Y轴
        this.drawX();
        this.drawY();
    },
    
    //
    drawX: function(){
        this.r.text(20, 30, 'text').attr({'font': '7px', fill: '#afafaf'});
    },
    
    //
    drawY: function() {
        
    },
        
    //
    drawLines: function() {
        var i,_i,
        len=this.getDataCount(),
        _len=this.getDays();
        var max = this.getMaxValue(),
        min = this.getMinValue();
        var X = (this.options.width - this.options.leftgutter-this.options.rightgutter) / (_len-1),
        Y = (this.options.height - this.options.bottomgutter - this.options.topgutter) / (max-min);
          
        var dot = [];
        for(i=0; i<len; i++) {
            var path = this.r.path().attr({
                stroke: this.Data[i].Color, 
                "stroke-width": 2, 
                "stroke-linejoin": "round"
            });
                
            var p;
            dot[i] = [];
            for(_i=0; _i<_len; _i++) {
                var x,y;
                x = Math.round(this.options.leftgutter + X * _i);
                y = Math.round(this.options.height - this.options.bottomgutter - Y * (this.Data[i].Data[_i].value-min));
                
                if (_i==0) {
                    p = ["M", x, y, this.options.lineType, x, y];
                }
                    
                if (_i!=0 && _i < _len-1) {
                    if(this.options.lineType == "C"){
                        var Y0 = Math.round(this.options.height - this.options.bottomgutter - Y * this.Data[i].Data[_i-1].value),
                        X0 = Math.round(X * (i - .5)),
                        Y2 = Math.round(this.options.height - this.options.bottomgutter - Y * this.Data[i].Data[_i+1].value),
                        X2 = Math.round(X * (i + 1.5));
                        var u = getAnchors(X0, Y0, x, y, X2, Y2);
                        p = p.concat([u.x1, u.y1, x, y, u.x2, u.y2]);
                    }else{
                        p = p.concat([x,y]);
                    }
                }
                //if(_i > 0) {
                dot[i].push(this.r.circle(x, y, 3).attr({
                    fill: this.Data[i].Color, 
                    stroke: "#2a2a2a", 
                    "stroke-width": 1
                }));
                //}                    
            }
                
            p = p.concat([x, y, x, y]);
            path.attr({
                path: p
            });                                               
        }                                               
    },
        
    //曲线数目
    getDataCount: function() {
        return this.Data.length;
    },
        
    //数据天数
    getDays: function() {
        return this.options.days;
    },
        
    //所有数据最大值
    getMaxValue: function() {                                   
        return Math.max.apply(Math, this.allValues);
    },
        
    //所有数据最小值
    getMinValue: function() {                        
        return Math.min.apply(Math, this.allValues);
    },
        
    //获取所有数据
    getValues: function(data) {
        var _A = new Array(), i, len, _i, _len;
           
        for (i=0, len=data.length; i<len; i++) {
            if(typeof data[i].Data != 'undefined') {
                for (_i=0, _len=data[i].Data.length; _i<_len; _i++) {
                    if(typeof data[i].Data[_i].value != 'undefined') {
                        _A.push(data[i].Data[_i].value);
                    }
                }
            }
        }           
                        
        return _A;
    },
        
    draw: function() {
        if (!this.Data || this.Data.length < 1) return;                        
        
        //绘画初始化
        this.drawInit();
            
        this.drawLines();
                        
    },
               
    setData: function(data) {                  
        
        this.Data = data;
            
        this.allValues = this.allValues.concat(this.getValues(data));
    },
    
    //画布
    clear: function() {
        this.r.clear();
    },
    
    setDays: function(days) {
        this.options.days = days;
    }
});



Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr({stroke: color});
};

$(function () {
    $("#data").css({
        position: "absolute",
        left: "-9999em",
        top: "-9999em"
    });
});

window.onload = function () {
    function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
        var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;
        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);
        return {
            x1: p2x - dx1,
            y1: p2y + dy1,
            x2: p2x + dx2,
            y2: p2y + dy2
        };
    }
    // Grab the data
    var labels = [],
        data = [];
    $("#data tfoot th").each(function () {
        labels.push($(this).html());
    });
    $("#data tbody td").each(function () {
        data.push($(this).html());
    });
    
    // Draw
    var width = 800,
        height = 250,
        leftgutter = 30,
        bottomgutter = 20,
        topgutter = 20,
        colorhue = .6 || Math.random(),
        color = "hsl(" + [colorhue, .5, .5] + ")",
        r = Raphael("holder", width, height),
        txt = {font: '12px Helvetica, Arial', fill: "#fff"},
        txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
        txt2 = {font: '12px Helvetica, Arial', fill: "#000"},
        X = (width - leftgutter) / labels.length,
        max = Math.max.apply(Math, data),
        Y = (height - bottomgutter - topgutter) / max;
    r.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, width - leftgutter - X, height - topgutter - bottomgutter, 10, 10, "#000");
    var path = r.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"}),
        bgp = r.path().attr({stroke: "none", opacity: .3, fill: color}),
        label = r.set(),
        lx = 0, ly = 0,
        is_label_visible = false,
        leave_timer,
        blanket = r.set();
    label.push(r.text(60, 12, "24 hits").attr(txt));
    label.push(r.text(60, 27, "22 September 2008").attr(txt1).attr({fill: color}));
    label.hide();
    var frame = r.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7}).hide();

    var p, bgpp;
    for (var i = 0, ii = labels.length; i < ii; i++) {
        var y = Math.round(height - bottomgutter - Y * data[i]),
            x = Math.round(leftgutter + X * (i + .5)),
            t = r.text(x, height - 6, labels[i]).attr(txt).toBack();
        if (!i) {
            p = ["M", x, y, "C", x, y];
            bgpp = ["M", leftgutter + X * .5, height - bottomgutter, "L", x, y, "C", x, y];
        }
        if (i && i < ii - 1) {
            var Y0 = Math.round(height - bottomgutter - Y * data[i - 1]),
                X0 = Math.round(leftgutter + X * (i - .5)),
                Y2 = Math.round(height - bottomgutter - Y * data[i + 1]),
                X2 = Math.round(leftgutter + X * (i + 1.5));
            var a = getAnchors(X0, Y0, x, y, X2, Y2);
            p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
            bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
        }
        var dot = r.circle(x, y, 4).attr({fill: "#333", stroke: color, "stroke-width": 2});
        blanket.push(r.rect(leftgutter + X * i, 0, X, height - bottomgutter).attr({stroke: "none", fill: "#fff", opacity: 0}));
        var rect = blanket[blanket.length - 1];
        (function (x, y, data, lbl, dot) {
            var timer, i = 0;
            rect.hover(function () {
                clearTimeout(leave_timer);
                var side = "right";
                if (x + frame.getBBox().width > width) {
                    side = "left";
                }
                var ppp = r.popup(x, y, label, side, 1),
                    anim = Raphael.animation({
                        path: ppp.path,
                        transform: ["t", ppp.dx, ppp.dy]
                    }, 200 * is_label_visible);
                lx = label[0].transform()[0][1] + ppp.dx;
                ly = label[0].transform()[0][2] + ppp.dy;
                frame.show().stop().animate(anim);
                label[0].attr({text: data + " hit" + (data == 1 ? "" : "s")}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
                label[1].attr({text: lbl + " September 2008"}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
                dot.attr("r", 6);
                is_label_visible = true;
            }, function () {
                dot.attr("r", 4);
                leave_timer = setTimeout(function () {
                    frame.hide();
                    label[0].hide();
                    label[1].hide();
                    is_label_visible = false;
                }, 1);
            });
        })(x, y, data[i], labels[i], dot);
    }
    p = p.concat([x, y, x, y]);
    bgpp = bgpp.concat([x, y, x, y, "L", x, height - bottomgutter, "z"]);
    path.attr({path: p});
    bgp.attr({path: bgpp});
    frame.toFront();
    label[0].toFront();
    label[1].toFront();
    blanket.toFront();
};