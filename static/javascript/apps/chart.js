//(function($) {
    
    var ChartAppView = Backbone.View.extend({
        //句柄
        r: null,
        
        //数据
        Data: null,
        Days: 0,
        
        //所有值
        allValues: null,
        
        //默认值
        options: {
            el: 'graphs-view-body',            
            type: 'abs',            
            width: 680, 
            height: 200,
            leftgutter: 25, //L R T B
            rightgutter: 20,
            topgutter: 10,
            bottomgutter: 30,
            lineType: 'L'
        },
        
        //初始化
        initialize: function(options){            
            _.extend(options, this.options);
           
            this.Data = [];           
            this.allValues = [];
            this.Days = 0;
            
        },
        
        getDays: function() {
            //alert(this.Data[0].Data.length);return 0;
            return  Math.min(this.Days, this.Data[0].Data.length);
        },
        
        //设置数据
        setData: function(data) {
            this.Data = data.Data;
            this.allValues = this.allValues.concat(this.getAllValues(this.Data));
            
            this.Days = data.Days;
            
            //console.info(this.Data);
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
        getAllValues: function(data) {
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
        
        //Y轴数据/1000
        kNumber: function(s) {
        	//if (s < 1000) return Math.round(s);
            s = s/1000;
            /*
            if (s < 1) {
            	s =  Math.round(s*10);
            	s = s * 100;
            } else {
            	s = Math.round(s*10)/10;
            	s += 'k';	
            }
            */
            s = Math.round(s*10)/10;
            s += 'k';	
            return s;
        },
        
        //绘制
        draw: function(data) {
            
            if(typeof data.Data == 'undefined' || data.Data.length < 1) return;
            if(typeof data.Days == 'undefined' || data.Days < 1) return;
            
            this.initialize(this.options);
            
            this.r = Raphael(this.options.el, this.options.width, this.options.height);
            
            this.clear();
            this.setData(data);
            
            this.drawGrid();
            
            this.drawX();
            
            this.drawY();
            
            this.drawGraph();
            
            this.drawDone();
        },                
        
        //绘制背景网格
        drawGrid: function() {            
            var x=0,y=0,
                width = this.options.width,
                height = this.options.height,
                lines = 7,
                lineColor = '#efefef',
                rowHeight = 25;             
                                               
            var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L"];
            
            for (var i = 1; i < lines; i++) {
                path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + width) + .5]);                        
            }
            
            this.r.path(path.join(",")).attr({
                stroke: lineColor
            });
        },
        
        //绘制X轴
        drawX: function() {
            var x,
                y=this.options.height-10,                                 
                i, len = this.getDays(),
                txt = {'font-size': '11px', fill: '#afafaf'},
                date;
            
        	var maxLen = 10, space, step=1, day;
        
        	space = (this.options.width - this.options.leftgutter - this.options.rightgutter) / len;
        	if(len > maxLen) {
            	step = (len / maxLen) < 1.5 ? 2 : 3;
        	}
        	var i=0;
        	do {
            	x = Math.round(25 + this.options.leftgutter + space*i);
            
            
            	day = this.Data[0].Data[i].date;             
            	this.r.text(x, y, day).attr(txt);
            	i+=step;
        	} while(i<len);			
        },
        
        //绘制Y轴
        drawY: function() {
            var txt = {'font-size': '11px', fill: '#afafaf'},
                max = this.getMaxValue(),
                min = this.getMinValue();
            
            var c = max - min;
            var s = c / 6;

            var t1 = max - s,
                t2 = max - s*3,
                t3 = max - s*5;
            
            this.r.text(30, 25, this.kNumber(t1)).attr(txt);
            this.r.text(30, 75, this.kNumber(t2)).attr(txt);
            this.r.text(30, 125, this.kNumber(t3)).attr(txt);
        },
        
        //绘制曲线图
        drawGraph: function() {
            var i,_i,
                len=this.Data.length,
                _len=this.getDays();
            var max = this.getMaxValue(),
                min = this.getMinValue();
            var X = (this.options.width - this.options.leftgutter-this.options.rightgutter) / (_len-1),
                Y = (this.options.height - this.options.bottomgutter - this.options.topgutter) / (max-min);

            var dot = [], blanket = this.r.set();
            for(i=0; i<len; i++) {
                var path = this.r.path().attr({
                    stroke: this.Data[i].Color, 
                    "stroke-width": 4, 
                    "stroke-linejoin": "round"
                });
				
                var p;
                dot[i] = [];
                for(_i=0; _i<_len; _i++) {
                    var x,y, value;
					value = typeof this.Data[i].Data[_i] == 'undefined' || this.Data[i].Data[_i].value == 'undefined' ? 0 : this.Data[i].Data[_i].value;
                    x = Math.round(this.options.leftgutter + X * _i);
                    y = Math.round(this.options.height - this.options.bottomgutter - Y * (value-min));

                    if (_i==0) {
                        p = ["M", x, y, this.options.lineType, x, y];
                    }

                    if (_i!=0 && _i < _len-1) {
                        if(this.options.lineType == "C"){
                            var Y0 = Math.round(this.options.height - this.options.bottomgutter - Y * value),
                            X0 = Math.round(X * (i - .5)),
                            Y2 = Math.round(this.options.height - this.options.bottomgutter - Y * value),
                            X2 = Math.round(X * (i + 1.5));
                            var u = getAnchors(X0, Y0, x, y, X2, Y2);
                            p = p.concat([u.x1, u.y1, x, y, u.x2, u.y2]);
                        }else{
                            p = p.concat([x,y]);
                        }
                    }
                    //if(_i > 0) {
                    dot[i].push(this.r.circle(x, y, 4).attr({
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
            
            var blan;
			for(_i=0; _i <_len; _i++) {
				blan = this.r.rect(this.options.leftgutter + X * (_i),  0,  X,  this.options.height).attr({stroke: "none", fill: "#fff", opacity: 0});								
				blanket.push(blan);			
			}		
			blanket.toFront();
			
			var klass = this, el = $('#preview-chart-value');
			//console.info(klass.Data);return;
			$.each(blanket, function(i){		
				var ii, len = klass.Data.length, html, value, day, color, typename;	
				blanket[i].hover(function(){
					html = '';
					// 取得当前的天数
					try {
						day = klass.Data[0].Data[i].date;
					} catch(e) {
						day = '';
					}
															
					for (ii=0; ii<len; ii++) {
						value = 0;						
						try {
							value = klass.Data[ii].Data[i].value;
							if (value > 1000) value = typeof PreviewApp != 'undefined' ? PreviewApp.Fn.fmoney(value) : value;
						} catch(e) {
							//
							value = 0;
						}
						
						color = typeof klass.Data[ii] != 'undefined' ? klass.Data[ii].Color : '';
						typename = $('.metrics-picker a.on').text();
						html += '<span style="color:'+color+'">' + value + '&nbsp;' + typename + '</span>';
						$.each(blanket,function(e){
	                    	dot[ii][e].attr("r", 4);
	                	});
	                	dot[ii][i].attr("r", 6); 
					}
					
					html += '<span class="date">'+day+'</span>';
					
					
					el.html(html).show();
					
				}, function(){
					el.hide();
				});
				
				blanket[i].click(function(){
					var day = klass.Days[i] || 0;
					if(day !== 0) {
						//
						Graphs.appView.eventStream.gotoDay(day);
					}
				})
			});		
        },
        
        drawDone: function() {
            $('.loading').remove();
        },
        
        //清除画布
        clear: function() {                        
            if (this.r != null && this.r != undefined) {
               try {
                    this.r.clear();
                } catch(e) {
                    //
                } 
            }            
        }
        
    });
            
//})(jQuery);


