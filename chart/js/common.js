var txt = {font: '12px Helvetica, Arial', fill: "#fff"},
    txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
    txt2 = {font: '12px Helvetica, Arial', fill: "#000"},
    txt3 = {font: '10px Helvetica, Arial', fill: "#999"};

var chart = function(){
        var self = this;
        this.cloneData={};
        this.type = "abs";
        this.data = {};
        this.width = 800;
        this.height = 300;
        this.leftgutter = 40;
        this.rightgutter = 40;
        this.bottomgutter = 60;
        this.topgutter = 20;
        this.color = ["#3f72bf","#43B97B","#BB4458","#BA7530","#9044BB","#ACB943"];
        this.lineType = "L";                                                                    //直线“L”，曲线“C”
        this.r = Raphael("holder", this.width, this.height);
};

chart.prototype.setUrl = function(url){

    /*
    $.ajax({
        url:url,
        success:function(responseData){

            this.data = responseData;
        },
        dataType:'json'
    });
    */
    this.data = {"series":[
        [{date:"2012/6/3",value:30},{date:"2012/6/4",value:-41},{date:"2012/6/5",value:14},{date:"2012/6/6",value:51},{date:"2012/6/7",value:30},{date:"2012/6/8",value:31}],
        [{date:"2012/6/3",value:20},{date:"2012/6/4",value:-31},{date:"2012/6/5",value:14},{date:"2012/6/6",value:51},{date:"2012/6/7",value:30},{date:"2012/6/8",value:31}]
    ]};
    this.drawData();
};

chart.prototype.drawData = function(data){
    var self = this;
    //reset
    this.r.clear();

    this.sliceDate();

    var seriesLen = this.data["series"].length;
    var dataLen   = this.cloneData["series"][0].length;
    var X = (this.width - this.leftgutter-this.rightgutter) / (dataLen-1);


    var cloneDataSeries = this.cloneData["series"];


    //change value to %
    if(this.type=="per"){
        for(var a = 0; a< seriesLen; a++){
            var firstData = cloneDataSeries[a][0]["value"];
            for(var b = 0; b< cloneDataSeries[a].length; b++){
                var pNum = (cloneDataSeries[a][b]["value"]-firstData)/firstData*100;
                pNum = Math.round(pNum*100)/100;
                cloneDataSeries[a][b]=(cloneDataSeries[a][b]);
                cloneDataSeries[a][b]["value"]=pNum;                  //key
            }
        }
    }
    //alert(this.data["series"][0][0]["value"])

    //get max & min value
    var allData=[];
    for(var i = 0; i< seriesLen; i++){
        for(var k=0;k< dataLen;k++){
            allData = allData.concat(cloneDataSeries[i][k]["value"]);
        }
    }

    var    max = Math.max.apply(this, allData);
    var    min = Math.min.apply(this, allData);
    var    Y = (this.height - this.bottomgutter - this.topgutter) / (max-min);

    //draw grid
    this.r.drawGrid(this.leftgutter, this.topgutter + 0.5, this.width - this.leftgutter-this.rightgutter, this.height - this.topgutter - this.bottomgutter, 0, 5,max,min, "#666",this.type,this.width);

    var    label = this.r.set(),
        lx = 0, ly = 0,
        blanket = this.r.set(),
        dot = this.r.set();

    //draw Y-coor
    for (var i = 0, ii = dataLen; i < ii; i++){
        var x = Math.round(this.leftgutter + X * (i)),
            t = this.r.text(x, this.height - 7, cloneDataSeries[0][i]["date"]).attr(txt3);
    }

    //draw lines & dots
    dot=[];            //dot lines
    for(var k = 0; k< seriesLen; k++){
        var path = this.r.path().attr({stroke: this.color[k], "stroke-width": 4, "stroke-linejoin": "round"});
        var p;
        dot[k]=[];          //dots
        for (var i = 0, ii = dataLen; i < ii; i++){
            var y = Math.round(this.height - this.bottomgutter - Y * (cloneDataSeries[k][i]["value"]-min)),
                x = Math.round(this.leftgutter + X * (i));

            if (i==0) {
                p = ["M", x, y, this.lineType, x, y];

            }
            if (i!=0 && i < ii - 1) {
                if(this.lineType == "C"){
                    var Y0 = Math.round(this.height - this.bottomgutter - Y * cloneDataSeries[k][i - 1]["value"]),
                        X0 = Math.round(this.leftgutter + X * (i - .5)),
                        Y2 = Math.round(this.height - this.bottomgutter - Y * cloneDataSeries[k][i + 1]["value"]),
                        X2 = Math.round(this.leftgutter + X * (i + 1.5));
                    var u = getAnchors(X0, Y0, x, y, X2, Y2);
                    p = p.concat([u.x1, u.y1, x, y, u.x2, u.y2]);
                }else{
                    p = p.concat([x,y]);
                }

            }
            dot[k].push(this.r.circle(x, y, 5).attr({fill: this.color[k], stroke: "#2a2a2a", "stroke-width": 1}));
        }

        p = p.concat([x, y, x, y]);
        path.attr({path: p});
    }

    //draw blankets
    $.each(cloneDataSeries[0],function(i){
        blanket.push(self.r.rect(self.leftgutter + X * (i-0.5),  0,  X,  self.height).attr({stroke: "none", fill: "#fff", opacity: 0}));
    });
    blanket.toFront();

    //hover events
    $.each(blanket,function(i){
        blanket[i].hover(function () {
            var text = cloneDataSeries[0][i]["date"]+":";
            for(var k = 0; k< seriesLen; k++){
                if(self.type=="per"){
                    text += (cloneDataSeries[k][i]["value"])+"% ";
                }else{
                    text += " " + (cloneDataSeries[k][i]["value"]);
                }
                $.each(blanket,function(e){
                    dot[k][e].attr("r", 5);
                });
                dot[k][i].attr("r", 7);
            }
            $("#txt").html(text);
            $("#lettersOnGraph li").removeClass("on");
            if(i==5){  $("#lettersOnGraph li").eq(0).addClass("on");}
            if(i==3){  $("#lettersOnGraph li").eq(1).addClass("on");}

        }, function () {

        });
        blanket[i].click(function(){
            alert(i)
        });
    });
};

chart.prototype.sliceDate=function(){
    var self = this;
    var startDate = $("#startDate .date").val();
    var endDate = $("#endDate .date").val();

    var len;
    var margin;
    var msPerDay = 24 * 60 * 60 * 1000;
    var firstDate=this.data.series[0][0]["date"];
    firstDate = new Date(firstDate);
    var start = new Date(startDate);
    var end = new Date(endDate);

    firstDate = firstDate.getTime();
    start = start.getTime();
    end = end.getTime();
    margin = (start-firstDate)/msPerDay;
    len = (end-start)/msPerDay;

    this.cloneData = this.data.clone();
    //this.cloneData = jQuery.extend(true, {}, this.data);

    $.each(this.data.series,function(g){
        self.cloneData["series"][g] = self.cloneData["series"][g].slice(margin,(margin+len+1));
    });
};

$(function (){
    $("#startDate").datepicker({
        defaultDate: "2012/6/3",
        dateFormat: "yy/mm/dd",
        beforeShow: function(input, inst) {

            console.log(input.value)
        },
        beforeShowDay: function(date) {
            return [true,""]
        },
        onSelect: function(dateText, inst) {
            $(this).find("input.date").val(dateText);
            chart1.setUrl();
        }
    });

    $("#endDate").datepicker({
        defaultDate: "2012/6/8",
        dateFormat: "yy/mm/dd",
        beforeShow: function(input, inst) {
            console.log(input.value)
        },
        onSelect: function(dateText, inst) {
            $(this).find("input.date").val(dateText);
            chart1.setUrl();
        },
        beforeShowDay: function(date) {
            return [true,""]
        }
    });



    // init inputText
    var startDefaultDate = $("#startDate").datepicker( "getDate" );
    startDefaultDate = formatDate(startDefaultDate);
    $("#startDate").find("input.date").val(startDefaultDate);

    var endDefaultDate = $("#endDate").datepicker( "getDate" );
    endDefaultDate = formatDate(endDefaultDate);
    $("#endDate").find("input.date").val(endDefaultDate);

    $("#lettersOnGraph li").eq(0).css("left","730px");
    $("#lettersOnGraph li").eq(1).css("left","470px");



    $("#change").click(function(){
        var newData = [{date:"2012/6/3",value:96},{date:"2012/6/4",value:20},{date:"2012/6/5",value:0},{date:"2012/6/6",value:55},{date:"2012/6/7",value:40},{date:"2012/6/8",value:50}];
        chart1.data.series[2]=newData;
        chart1.type = "abs";
        chart1.setUrl();
    });
    $("#percentage").click(function(){
        chart1.type = "per";
        chart1.setUrl();
    });
    $("#absolute").click(function(){
        chart1.type = "abs";
        chart1.setUrl();
    });

        var chart1 = new chart();
            chart1.setUrl();
        });


Raphael.fn.drawGrid = function (x, y, w, h, wv, hv,max,min, color,type) {

    color = color || "#000";
    var
    //path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L"],
        rowHeight = h / (hv+2),
        rowValue = Math.round( (max-min)*100/(hv+2) )/100,
        columnWidth = w / wv;

    for (var i = 0; i < hv+1; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + (i+1) * rowHeight) + .5, "H", Math.round(x + w) + .5]);
        var val = type == "per" ? Math.round( (max-rowValue*(i+1))*100 )/100 +"%" : Math.round( (max-rowValue*(i+1))*100 )/100;
        this.text( 20, Math.round(y + (i+1) * rowHeight) + .5,val).attr(txt3);
        this.text( 60+w, Math.round(y + (i+1) * rowHeight) + .5,val).attr(txt3);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    this.path(path.join(",")).attr({stroke: color,"stroke-dasharray":"--.","stroke-width":1,"stroke-linecap":"butt"});
};

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

function countDays(date,n) {
    var newDay = new Date(date);
    newDay = newDay.getTime();
    var msPerDay = 24 * 60 * 60 * 1000;
    newDay = newDay + msPerDay * n;
    newDay = new Date(newDay);
    newDay = newDay.getFullYear().toString() +"/"+ zerofill((newDay.getMonth() + 1)) + "/"+zerofill(newDay.getDate());
    return newDay;
}

function zerofill(s) {
    var s = parseFloat(s.toString().replace(/(^[\s0]+)|(\s+$)/g, ''));
    s = isNaN(s) ? 0 : s;
    return (s < 10 ? '0': '') + s.toString();
}

function getNow() {
    var today = new Date();
    var year = today.getFullYear().toString();
    var month = zerofill(today.getMonth() + 1);
    var day = zerofill(today.getDate());
    return year + "/"+month +"/"+ day;
}

function formatDate(date) {
    var today = new Date(date);
    var year = today.getFullYear().toString();
    var month = zerofill(today.getMonth() + 1);
    var day = zerofill(today.getDate());
    return year + "/"+month +"/"+ day;
}

Object.prototype.clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i == 'clone') continue;
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].clone();
        } else newObj[i] = this[i]
    } return newObj;
};