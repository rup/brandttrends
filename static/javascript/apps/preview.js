//$(function() {
var PreviewApp = {
    
    Global: {
        API: {
            search: WebSiteUrl + '/Handler/SearchBrandForChart',
            searchBrandByName:  WebSiteUrl + '/Handler/GetBrandInfoForChart',
            getBrandDataById:  WebSiteUrl + '/Handler/GetDataForPreviewChart'
        }
    },

    Views: {},

    Controllers: {},
    
    initialize: function () {
        new PreviewApp.Views.AppView;
        
        PreviewApp.Controllers.Router =  new PreviewApp.Controllers.Routes;        
        Backbone.history.start();       
    },
    
    Fn: {}
};

PreviewApp.Fn.fmoney = function(s, n) {   
   n = n > 0 && n <= 20 ? n : 2;   
   s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";   
   var l = s.split(".")[0].split("").reverse(),   
   r = s.split(".")[1];   
   t = "";   
   for(i = 0; i < l.length; i ++ ) {   
      t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");   
   }   
   return t.split("").reverse().join("");   
}

//搜索输入框控制器
PreviewApp.Views.InputView = Backbone.View.extend({

    _el: $('.brand-inputTxt'),

    tipView: null,

    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        var _p = {
            klass: this
        };
        this._el.bind('focus', _p, this.getFocus)
                .bind('blur', _p, this.loseFocus)
                .bind('inputValue', _p, this.inputValue)
                .bind('clearValue', _p, this.clearValue)
                .bind('keyup', _p, this.keyup)
                .bind('selected', _p, this.selectedBrand)
                .bind('cancel', _p, this.cancelSelected)
                .bind('showDel', _p, this.showDel)
                .bind('hideDel', _p, this.hideDel);

        this.tipView = new PreviewApp.Views.SearchTipView();
    },

    getFocus: function (event) {
        $(this).bind('blur', event.data, event.data.klass.loseFocus);
    },

    loseFocus: function (event) {
        if ($(this).val().length < 1) {
            $(this).trigger('clearValue').trigger('cancel', {
                el: $(this)
                });
        }    
    },

    keyup: function (event) {
        if ($(this).val().length >= 1) $(this).trigger('inputValue');
        if ($(this).val().length < 1) $(this).trigger('clearValue').trigger('cancel');
    },

    //清除输入框文字
    removeTxt: function (event) {        
        event.data.el.val('').trigger('clearValue').trigger('cancel');
    },

    //输入状态
    inputValue: function (event) {
        
        $(this).trigger('showDel');
        //打开输入提示
        event.data.klass.openTipView($(this));
    },
    
    //
    clearValue: function (event) {
        $(this).trigger('hideDel');             

        //关闭输入提示
        event.data.klass.closeTipView($(this));
    },
    
    showDel: function(event) {
        $(this).parent('.brand-input')
        .find('a.del')
        .fadeIn(300)
        .bind('click', {
            el: $(this)
        }, event.data.klass.removeTxt);
    },
    
    hideDel: function(event) {
        $(this).parent('.brand-input')
        .find('a.del')
        .hide();
    },

    openTipView: function (el) {
        this.tipView.setEl(el);
        this.tipView.open();
    },

    closeTipView: function (el) {
        this.tipView.setEl(el);
        this.tipView.close();
    },
    
    //选择一个品牌
    selectedBrand: function (event) {
        if ($(this).val().length > 1) {
            //绘制品牌数据曲线                     
            PreviewApp.Controllers.Router.addId($(this).attr('BrandId'));
        }
    },

    cancelSelected: function (event) {      
        //删除品牌曲线
        PreviewApp.Controllers.Router.removeId($(this).attr('BrandId'));
    }

});

//搜索提示控制器
PreviewApp.Views.SearchTipView = Backbone.View.extend({

    apiURL: PreviewApp.Global.API.search,

    status: false,

    locked: false,

    lockedValue: '',

    _el: 0,

    initialize: function () {
        this.status = false;
        this.locked = false;
        this.lockedValue = '';
    },

    //设置
    setEl: function (el) {
        this._el = el;
    //this.initialize();
    },

    open: function () {
        if (!this._el) return;

        var klass = this,
        kd = this._el.val();

        if (this.locked && this.lockedValue == kd) return;

        if (!this.status) {
            this.status = true;

            if (kd.length < 2) {
                this.status = false;
                return;
            }
            $.getJSON(this.apiURL, {
                key: kd
            }, function (response) {
                //TODO: 更改接口，增加判断
                if(typeof response != 'undefined' && typeof response.ResultData != 'undefined') {
                    klass.showTipView(response.ResultData.Data);
                }
                //成功后刷新当前状态
                klass.status = false;
                return;
            });

        } else {
            _.delay(function () {
                klass.open();
            }, 300);
        }
    },

    close: function () {

        this.hideTipView(); //删除内容

        this.initialize(); //重新初始化
    },

    showTipView: function (brands) {

        var li = '', i, len, ids = PreviewApp.Views.chartView.getBrandIds();
		
		var id;
        for (i = 0, len = brands.length; i < len; i++) {
			id =  brands[i]['ID'];
			// 移出已选择的品牌	
			if($.inArray(parseInt(id), ids) == -1) {
				li += '<li BrandID="' + id + '">' + brands[i]['Name'] + '</li>';	
			}			         
        }

        if (li != '') {
            var outHtml = '';
            var klass = this;
            outHtml += '<ul class="search-tips-list">';
            outHtml += li;
            outHtml += '</ul>';

            this._el.parent('.brand-input')
            .find('.search-tips')
            .empty()
            .append(outHtml)
            .show()
            .find('.search-tips-list li')
            .bind('click', {
                klass: this
            }, this.selectBrand);

        }
    },

    hideTipView: function () {
        this._el.parent('.brand-input')
        .find('.search-tips')
        .empty()
        .hide();
    },

    //选择一个品牌
    selectBrand: function (events) {
        //解除绑定
        $(this).unbind('click');

        var klass = events.data.klass,
        brandName = $(this).text(),
        brandID = $(this).attr('BrandID');

        klass.hideTipView();
        klass.locked = true;
        klass.lockedValue = brandName;
        klass._el.val(brandName);
        klass._el.attr('BrandID', brandID);

        klass._el.trigger('selected');
    }

});

//绘图控制器
PreviewApp.Views.ChartView = Backbone.View.extend({

    _el: $('#graphs-view'),

    Chart: null,
    
    Colors: ['#f41515', '#e01a7c', '#d91ae0', '#7c0ccb', '#13c3d3', '#9dc522', '#c59922'],

    //数据类型
    DataType: null,

    //日期
    DataDays: typeof DataDays != "undefined" ? DataDays : 7, //默认7天

    //媒体
    DataMId: 0,

    NetWorkMapping: [],

    BrandMapping: [],

    Types: {
        'fans': 1,
        'comments': 3,
        'views': 4
    },

    processedData : null, //已处理过的数据

    //图表数据
    charts: {
        Ids: [], //chart id
        Data: [] //chart data
    },

    apiJSON: {
        //搜索品牌
        search: PreviewApp.Global.API.searchBrandByName,
        //获取品牌数据
        getData: PreviewApp.Global.API.getBrandDataById
    },

    initialize: function () {
        this.initView();
        this.bindEvents();
        this.initChart();
    },

    initView: function () {
        this._el.show()
        .find('h1').show()
        .find('#graphs-view-body').hide();
    },

    initChart: function () {
        this.Chart = new ChartAppView({
            width: 670,
            height: 180
        });

        this.DataType = $('.metrics-picker a.on').attr('DataType');
        this.Days = $('.date-selecter a.on').attr('DataDays');
    },

    bindEvents: function () {
        var _p = {
            klass: this
        };
        $('.date-selecter a').bind('click', _p, this.datePicker);
        $('.metrics-picker a').bind('click', _p, this.metricsPicker);
    },

    datePicker: function (event) {
        $(this).parent('.date-selecter').find('a').removeClass('on');
        $(this).addClass('on');
        event.data.klass.setDataDays($(this).attr('DataDays'));
        
        return false;
    },

    metricsPicker: function (event) {
        $(this).parent('.metrics-picker').find('a').removeClass('on');
        $(this).addClass('on');
        
        event.data.klass.setDataType($(this).attr('DataType'));
        return false;
    },

    //设置数据天数
    setDataDays: function (days) {        
        this.DataDays = days;
        this.refreshPlan();
    },

    //设置数据类型
    setDataType: function (type) {        
        this.DataType = type;
        //TODO:更改数据类型        
        PreviewApp.Controllers.Router.changeType(type);        
    },

    setDataMId: function (mid) {
        this.DataMId = mid;
    },

    getColors: function() {
        return this.Colors.pop();
    },
    
    setColor: function(color) {
        this.Colors.push(color);
    },   
        
    //获取chartID
    getChartID: function (BID) {
        return BID;        
    },
    
    //获取曲线媒体ID
    getMetricsID: function(MID) {
        return MID;
    },       
    
	// 返回已经添加的品牌ID
	getBrandIds: function() {
		var el = $('.brand-list .brand-inputTxt'), ids = [];
		el.each(function() {
			var id = $(this).attr('brandid');
			if(id && id != '0') {
				ids.push(parseInt(id));
			}
		});
		
		return ids;
	},
	
    //通过品牌ID获取曲线颜色
    getColorByBId: function(BId) {
        var color='#ff3333';
        $('.brand-inputTxt[BrandId]').each(function(){
            if($(this).attr('BrandId') == BId) color = $(this).attr('BrandColor');
        });
        
        return color;
    },
       
    //获取品牌ID的颜色
    getChartColorByBid: function (Bid) {
        if (this.charts.Data.length < 1) return;
        var i, len;
        for (i = 0, len = this.charts.Data.length; i < len; i++) {
            if (this.charts.Data[i].BID == Bid) {
                return this.charts.Data[i].Color;
            }
        }
    },

    //获取品牌名称
    getBrandNameByBid: function (bid) {
        if (this.BrandMapping.length < 1) return '';
        var i, len, name = '';
        $.each(this.BrandMapping, function (i, item) {
            if (item.BID == bid) name = item.BName;
        });

        return name;
    },                                         
    
    //通过品牌ID添加曲线
    addChartByIds: function(Ids) {
                 
        var klass=this, ID=[];               
        
        if(Ids.length < 1) return;
        
		for(var i=0, len=Ids.length; i<len; i++) {
			
			if(Ids[i] != '') ID.push(Ids[i]);
		}
		
        var ids = ID.join(',');                             
				                
        this.drawLoading();        
        //读取品牌数据
        $.getJSON(this.apiJSON.getData,{
             brand_id:ids
        }, function (response) {
            if(response.ErrorCode == undefined || response.ErrorCode > 0) {
                klass.error(response.ErrorCode);
                return;
            } else {
                //处理输出数据            
                klass.optChartData(response.ResultData);
                //重刷画板
                klass.refreshPlan();            
            }
            
        });
    },
    
    //错误处理
    error: function(code) {
        //TODO: 错误信息捕捉
        switch (code) {
            case 1000:
                //$(".dialog.verification, .ui-mask").show();
                break;
        }
    },
    
    //通过媒体ID添加曲线
    addChartByMId: function(MID, BID) {
        var Data = this.getMetricsData(MID, BID);        
        
        this.processedData.Data.push(Data); 
        
        this.Chart.draw(this.processedData);
    },
    
    //处理品牌数据
    optChartData: function(response) {
        if(response.BrandMapping != undefined) this.BrandMapping = response.BrandMapping;
        if(response.NetWorkMapping != undefined) this.NetWorkMapping = response.NetWorkMapping;
        if(response.Data != undefined && response.Data.length > 0) {
            
            //初始化请求数据
            this.processedData = null;
            this.charts.Data = [];
            
            var i, len, Data=response.Data, data, chartId;
            for(i=0, len=Data.length; i<len; i++) {
                data = Data[i];
                if(data.BID == undefined || data.BName == undefined || data.BData == undefined) continue;
                
                chartId = this.getChartID(data.BID);
                this.charts.Ids.push(chartId);
                
                //设置对应输入框属性
                this.setInputAttrByIndex(i, {BName: data.BName, BId: data.BID});
                
                this.charts.Data.push({
                    ID: chartId,
                    BID: data.BID,
                    BName: data.BName,
                    Color: this.getColorByBId(data.BID),
                    Data: data
                });                
                
                //TODO:记录品牌历史
                if(typeof AddBrowsingHistory != undefined){
                    try {
                        AddBrowsingHistory(data.BID, data.IID, data.BName, data.BImg);
                    } catch(e) {
                        //console.info(e);
                    }
                }
                
            }
        }
    },
    
    //通过品牌ID返回chart数据
    getChartDataByBId: function(BID) {
        var i,len, Data;
        for(i=0, len=this.charts.Data.length; i<len; i++) {
            if(this.charts.Data[i].BID == BID) return this.charts.Data[i];                            
        }
        
        return Data;
    },        
    
    //通过媒体ID获取品牌数据
    getMetricsData: function(MID, BID) {
        var Data = this.getChartDataByBId(BID);
        if(Data == undefined) return;
                
        var ChartData = {
            Color: this.getColors(),
            ID: this.getChartID(BID),
            MID: this.getMetricsID(MID),
            Data: []
        };            
            
        ChartData.Data = this.processMetricsData(MID, Data.Data.BData);                               
        
        //更改媒体名称颜色
        this.changeMetricsNameColor(MID, ChartData.Color);
        
        //console.info(ChartData);
        return this.withData(ChartData);                
    }, 
    
    //根据输入index处理输入框
    setInputAttrByIndex: function(Index, Data) {        
        var el = $($('.brand-inputTxt')[Index]);
        if(!el) return;
        
        if(Data.BName != undefined) el.val(Data.BName);
        if(Data.BId != undefined) el.attr('BrandId', Data.BId);
        el.trigger('showDel');
    },               
    
    //拼接图标数据
    withData: function(options) {
        var data = {};
        
        var defaults = {
            Color : '',
            ID: 0,
            MID: 0,
            Data: []
        }
        
        data = _.extend(defaults, options);
		
        data.Data = data.Data.slice(this.DataDays * -1);		
        return data;
    },
    
    //处理请求数据
    processData: function () {
        if (typeof this.Types[this.DataType] == 'undefined') return;

        var processedData = {}, klass = this,
            typeID = this.Types[this.DataType];
                
        processedData.Days = this.DataDays;
        processedData.Data = [];

        var data = this.charts.Data,
            i, len, D,
            _pros, _values, _getValue;

        _pros = function (data) {
            var i, len, A = [], D, _val;
            for (i = 0, len = data.length; i < len; i++) {
                D = {};
                D.date = data[i].Date;
                _val = _values(data[i].Values);

                D.value = _getValue(_val);

                A.push(D);
            }
            return A;
        };
        
        _values = function (values) {
            var i, len, val = [];
            for (i = 0, len = values.length; i < len; i++) {
                val.push(values[i].Values);                
            }
            return val;

        };

        _getValue = function (values) {
            var i, len, _i, _len, _values, value = 0;
                
            for (i = 0, len = values.length; i < len; i++) {
                _values = values[i];
                for (_i = 0, _len = _values.length; _i < _len; _i++) {
                    if (_values[_i].MGID == typeID) {                        
                        value += _values[_i].Value;
                        break;
                    }
                }
            }            
            return value;
        };

        for (i = 0, len = data.length; i < len; i++) {  
			if(typeof data[i].Data.BData != 'undefined' && data[i].Data.BData.length > 0) {
				D = this.withData({
	                Color:data[i].Color, 
	                ID: data[i].ID, 
	                Data: _pros(data[i].Data.BData), 
	                MID: this.DataMId
	                });                
	            processedData.Data.push(D);	
			}                                 
        }

        //console.info(processedData);
        return processedData;
    },
    
    //处理媒体数据
    processMetricsData: function(MID, DATA) {
        if (typeof this.Types[this.DataType] == 'undefined') return;
        
        var TypeID = this.Types[this.DataType],
        processedData=[],
        _pData, _vData;
        
        _pData = function(Data) {
            var i, len, values, _i, _len, _values, data;
            for(i=0, len=Data.length; i<len; i++) {
                
                data = {
                    date: '',
                    value: 0
                };
                                
                data.date = Data[i].Date;
                
                values = Data[i].Values;
                for(_i=0, _len=values.length; _i<_len; _i++) {
                    
                    if(MID == 0) {
                        _values = values[_i].Values;
                        data.value += _vData(_values);
                    } else if(values[_i].NWID == MID) {
                        _values = values[_i].Values;
                        data.value += _vData(_values);
                        break;
                    }
                }
                
                processedData.push(data);
            }
            
        };
        
        _vData = function(values) {
            var i, len;            
            
            for(i=0, len=values.length; i<len; i++) {                
                if(values[i].MGID == TypeID) {                    
                    return values[i].Increase;                    
                }
            }
        }
        
        _pData(DATA);
                
        return processedData;
    }, 
    
    //通过媒体ID删除曲线
    removeChartByMId: function(MID, BID) {
        var MId = this.getMetricsID(MID);
        var ID = this.getChartID(BID);
        
        if(this.processedData == undefined || this.processedData.Data.length < 1) return;
        
        this.changeMetricsNameColor(MID, '');
        
        var i, len;
        var data=[];
        for(i=0, len=this.processedData.Data.length; i<len; i++) {
            if (this.processedData.Data[i].ID == ID && this.processedData.Data[i].MID == MId) {
                this.setColor(this.processedData.Data[i].Color);
                continue;
            }
            data.push(this.processedData.Data[i]);
        }
                
        this.processedData.Data = data;
        this.Chart.draw(this.processedData);
                
    },
    
    //通过品牌ID删除曲线    
    removeChartByBId: function (BID) {
        var i, len;

        var ids = [], data = [];
        var chartID = this.getChartID(BID);

        for (i = 0, len = this.charts.Ids.length; i < len; i++) {
            if (this.charts.Ids[i] != chartID) {
                ids.push(this.charts.Ids[i]);
            }
        }

        for (i = 0, len = this.charts.Data.length; i < len; i++) {
            if (this.charts.Data[i].ID != chartID) {
                data.push(this.charts.Data[i]);
            }
        }

        this.charts.Ids = ids;
        this.charts.Data = data;

        this.refreshPlan();
    },

    //
    planInit: function () {
        //TODO: 本函数已启用
        //this._el.find('h1').hide();
        //this._el.find('#graphs-view-body')
        //.append('<div id="loading-graphs" class="loading">Loading...</div>')
        //.show();
        
    },

    //刷新绘图板
    refreshPlan: function () {
        if (!this.charts.Data || this.charts.Data.length < 1) {
            this.clearPlan();
            return;
        }

        this.processedData = this.processData();
        
        this.draw();
    },
    
    drawInit: function() {
        //清除input值
        $('.brand-inputTxt').val('').removeAttr('BrandId');
        $('.del').hide();
        $('.search-tips').empty().hide();                
    },
    
    drawLoading: function() {
        this._el.find('h1').hide();
        this._el.find('#graphs-view-body').show()
        .append('<div id="loading-graphs" class="loading">Loading...</div>')
        ;    
    },
    
    //绘制曲线
    draw: function() {
        if(this.processedData == undefined || this.processedData == null) return;        
        
        //console.info(this.charts.Data);
        //console.info(this.processedData);
        this.Chart.draw(this.processedData);
        this.drawMetrics();
    },
    
    //输出品牌媒体属性
    drawMetrics: function () {
        var el = $('#Metrics-Body'),
        BID = 0, //品牌ID 品牌数据
        BIds = [],
        Data = {},
        len = this.charts.Data.length;
        
        if(!el[0]) return;
        
        el.empty();
        
        if (len < 1) return;                
        
        //单品牌
        if (len == 1) {
            BID = this.charts.Data[0].Data.BID;
            Data = this.getOneMetrics(BID);
            this.drawOneMetrics(el, BID, Data);
            this.bindMetricsSelected(el);                                                            
            
        //多品牌
        } else {
            var _i;
            for (_i = 0; _i < len; _i++) {
                BIds.push(this.charts.Data[_i].Data.BID);
            }

            var MData = this.getMetrics(BIds);
                
            this.drawAllMetrics(el, MData);             
        }
               
    },
    //清除媒体
    clearMetrics: function() {
        $('#Metrics-Body').empty();
    },
    
    //更改媒体名称的颜色
    changeMetricsNameColor: function(MID, Color) {
        $('#Metrics-Name-' + MID).css('color', Color);
    },
    
    //绑定媒体checkbox选择事件
    bindMetricsSelected : function(el) {
        var _p = {
            klass:this, 
            el:el
        };
        el.find('input.Metrics-List')
        .bind('click', _p, this.selectMetrics)
        .bind('selected', _p, this.selectedMetrics)
        .bind('unSelected', _p, this.unSelectedMetrics);
    },
    
    //绑定媒体checkbox点击事件
    selectMetrics: function(event) {                
        if($(this).attr('checked')) {
            $(this).attr('checked', 'checked');
            $(this).trigger('selected');
        } else {
            $(this).removeAttr('checked');            
            $(this).trigger('unSelected');
        }
        
        //保留最后一个checkbox
        var css = '.'+$(this).attr('class'),
        filter = css+'[checked]';
            
        if(event.data.el.find(filter).length == 1) {
            event.data.el.find(css+'[checked]').attr({
                'disabled':'disabled', 
                'checked':'checked'
            });
        } else {
            event.data.el.find(css+'[disabled]').removeAttr('disabled');
        }
        return true;
    },
    
    //媒体checkbox选中事件
    selectedMetrics: function(event) {
        var MId = $(this).val(), 
        BId = $(this).attr('BrandId');
            
        event.data.klass.addChartByMId(MId, BId);        
    },
    
    //媒体checkbox取消选中事件
    unSelectedMetrics: function(event) {
        var MId = $(this).val(),
        BId = $(this).attr('BrandId');
        
        event.data.klass.removeChartByMId(MId, BId);        
    },

    //输出多个品牌的媒体数据
    drawAllMetrics: function (el, data) {
        var html, makeHtml, klass = this, dateArea = this.getDateArea();
		
        makeHtml = function (data) {
            var html = '', color = '', BrandName;
            $.each(data, function (i, item) {
            	var l = item.leftValue, r = item.rightValue, p = r - l, f, total = item.value;
            	
            	if (p == r) {
                	f = '100';
                } else if (p == 0){
                	f = '0';
                } else {
                	f = Math.round(p / l * 100 * 100) / 100;	
                }
                
                if (l > 1000) l = PreviewApp.Fn.fmoney(l);                
                if (r > 1000) r = PreviewApp.Fn.fmoney(r);
                if (total > 1000) total = PreviewApp.Fn.fmoney(total);
                if (p > 1000) p = PreviewApp.Fn.fmoney(p);
            	
                html += '<tr>';
                color = klass.getChartColorByBid(item.BID);
                BrandName = klass.getBrandNameByBid(item.BID);
                html += '<td class="agl"><font style="color:' + color + '">' + BrandName + '</font></td>';
                html += '<td class="agr">' + l + '</td>';
                html += '<td class="agr">' + r + '</td>';				
                html += '<td class="agr">' + p + '</td>';							
                html += '<td class="agr">' + f + '%</td>';
                html += '<td class="agr">' + total + '</td>';

                html += '</tr>';
            });

            return html;
        };

        html = makeHtml(data);

        $('#Data-Name').text('品牌名称');
        $('#Data-StartDate').text(dateArea.StartDate);
        $('#Data-EndDate').text(dateArea.EndDate);
        
        el.html(html);
    },

    //获取多个品牌的媒体数据
    getMetrics: function (ids) {    	
        //TODO: 
        if (typeof this.Types[this.DataType] == 'undefined') return;
        typeID = this.Types[this.DataType];
        
        var chartsData = this.charts.Data;
        var brandData = function(bid) {
        	var i, len=chartsData.length;
            for (i=0; i<len; i++) {
                if (chartsData[i].BID == bid) {
                    return chartsData[i].Data.BData;
                }
            }
        };
        
        var halfDays = this.DataDays, days = halfDays * 2;                
        var getDataValue = function(brandData) {        	
        	var value = {
        		BID: 0,
                BrandName: '',
                leftValue: 0,
                rightValue: 0,
                value: 0
            };
            
            brandData = brandData.slice(days * -1);
            
            var i = days, val, data = _.clone(brandData);
            
            while (i) {     
            	val = 0;       	            	
            	if (data.length > 0) {            		
            		val = getValue(data.pop());            		            		            		
            	} else {
            		break;
            	}
            	
            	value.value += val;            	
            	if (i >= halfDays) {
            		value.rightValue += val;            				
            	} else {
            		value.leftValue += val;	
            	}
            	
            	i--;
            };
                       
            return value;
        };
                
        var getValue = function(data) {
        	var value = 0, values = data.Values;
			
			var i=0, len = values.length, val;
			for (i=0; i<len; i++) {				
				val = (function(values) {					
					var total = 0, i, len;
					for (i=0, len=values.length; i<len; i++) {
						if (values[i].MGID == typeID) {
							total += values[i].Increase;
						}
					}
					return total;
				})(values[i].Values);
				
				value += val;	
			}			
			return value;
			
       };
        
        var MData = [];        
        var i,len=ids.length;
        for (i=0; i<len; i++) {
        	var bData = brandData(ids[i]);        	
        	if (bData) {
        		
        		var value = getDataValue(bData);        		        		
        		value.BID = ids[i];
	            value.BrandName = '';
	            MData.push(value);	
        	}
        }
       // console.info(MData);
        return MData;
        
    },

	getDateArea: function() {
		var getNextDate, getDateTime, getDate, formatDate, chartFormatDate;                	    
	    getDateTime = function(date) {
	    	var S = new Date(date);
        	return S.getTime();
	    };
	    
	    getDate = function(timer) {
	    	var date;
	        if(typeof timer == 'undefined') {
	            date = new Date();
	        } else {
	            date = new Date(timer);
	        } 	              
	        return formatDate(date);
	    };
	    
	    formatDate = function(date)	{	    	
	    	var year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
	    		    	
	        if(parseInt(month) < 10) {
	            month = '0' + month;
	        }
	        if(parseInt(day) < 10) {
	            day = '0' + day;
	        }
	        
	        return year + '-' + month + '-' + day;
	    };
	    
	    chartFormatDate = function(date) {
	    	date = date.split('-');
	        if(date.length < 2) return false;
	        var month=date[1], day=date[2];
	        
	        return month + '/' + day;
	    };
	    
	    getNextDate = function(date, step) {	    	        
	        var timer = getDateTime(date) + 1000 * 60 * 60 * 24 * step;	        
	        var date = getDate(timer);
	        
	        return chartFormatDate(date);
	    };
	    
	    var HalfLen = this.DataDays, StartDate = '', EndDate = '';                
        		
		var date1Start, date1End, date2Start, date2End;
		
		var date = new Date(), startDay = formatDate(date);
		
		date1Start = getNextDate(startDay, HalfLen * 2 * -1 -1);			
		date1End = getNextDate(startDay, HalfLen * -1 -2);			
		date2Start = getNextDate(startDay, HalfLen * -1 -1);
		date2End = getNextDate(startDay, -2);
		
		StartDate = date1Start + ' - ' + date1End;
		EndDate = date2Start + ' - ' + date2End;
		
		return {StartDate: StartDate, EndDate: EndDate};
	},

    //单品牌的媒体属性
    drawOneMetrics: function (el, BID, Data) { 
        var klass = this, NT, dateArea = this.getDateArea();
        
        NT = Data.NT != undefined ? Data.NT : [];
       
        var html = '', makeHtml;
        if (NT.length < 1) return;

        makeHtml = function (Data) {
            var i, len;
            $('#Data-Name').text('媒体参数');
            $('#Data-StartDate').text(dateArea.StartDate);
            $('#Data-EndDate').text(dateArea.EndDate);

            var color = '';
            if (BID != 0) color = klass.getChartColorByBid(BID);
			
			if (Data.length >= 6) Data = Data.slice(0, 6);
						
            for (i = 0, len = Data.length; i < len; i++) {            	               
                var data = Data[i], f, p, l=data.leftValue, r=data.rightValue, total=data.value;
                
                html += '<tr>';
                if (data.NWID == 0) {
                    html += '<td class="agl"><input type="checkbox" value="0" name="metrics-list" checked="checked") class="Metrics-List" BrandId="'+BID+'" disabled="disabled"/> <font style="color:' + color + '" id="Metrics-Name-'+data.NWID+'">' + data.NWName + '</font></td>';
                } else {
                    html += '<td class="agl"><input type="checkbox" value="' + data.NWID + '" name="metrics-list" class="Metrics-List" BrandId="'+BID+'" /> <font id="Metrics-Name-'+data.NWID+'">' + data.NWName + '</font></td>';
                }
				
				p = r - l;
                                                
                if (p == r) {
                	f = '100';
                } else if (p == 0){
                	f = '0';
                } else {
                	f = Math.round(p / l * 100 * 100) / 100;	
                }
                
                if (l > 1000) l = PreviewApp.Fn.fmoney(l);                
                if (r > 1000) r = PreviewApp.Fn.fmoney(r);
                if (total > 1000) total = PreviewApp.Fn.fmoney(total);
                if (p > 1000) p = PreviewApp.Fn.fmoney(p);
                								
                html += '<td class="agr">' + l + '</td>';
                html += '<td class="agr">' + r + '</td>';
                html += '<td class="agr">' + p + '</td>';
                html += '<td class="agr">' + f + '%</td>';
                html += '<td class="agr">' + total + '</td>';

                html += '</tr>';
            }
        };        

        var i, len, makeData = [], LeftValue = 0, RightValue = 0, TotalValue = 0;

        var total = {
            NWID: 0,
            NWName: '全部(参数)',
            leftValue: LeftValue,
            rightValue: RightValue,
            value: TotalValue
        };

        makeData.push(total);

        $.each(NT, function (i, item) {
            if (item.value > 0) {
                LeftValue += item.leftValue;
                RightValue += item.rightValue;
                TotalValue += item.value;
                makeData.push(item);
            }
        });

        makeData[0].leftValue = LeftValue;
        makeData[0].rightValue = RightValue;
        makeData[0].value = TotalValue;

        makeHtml(makeData);
        el.html(html);
    },        

    //获取单品牌的媒体数据
    getOneMetrics: function (bid) {
        var klass = this, typeID, NT = this.NetWorkMapping;
            		
        if (typeof this.Types[this.DataType] == 'undefined') return;
        typeID = this.Types[this.DataType];
        
        var chartsData = this.charts.Data;
        var brandData = function(bid) {
        	var i, len=chartsData.length;
            for (i=0; i<len; i++) {
                if (chartsData[i].BID == bid) {
                    return chartsData[i].Data.BData;
                }
            }
        };

		var makeData = function(NT, Data, days) {			
			var i,len=NT.length, dateLen = days * 2;		
				
			for (i=0; i<len; i++) {
				NT[i].value = 0;		
				NT[i].leftValue = 0;	
				NT[i].rightValue = 0;	
								
				var ii = dateLen, data = _.clone(Data), value;				
				while (ii) {
					value = 0;
					if (data.length > 0) value = getNtValue(NT[i].NWID, data.pop());
										
					NT[i].value += value;
					if (ii >= days) {
						NT[i].rightValue += value;
					} else {
						NT[i].leftValue += value;
					}
					
					ii--;
				};
			}
			
			// 排序 只取前5
			NT = NT.sort(function(a, b) {
				return (b.value - a.value);
			});
												
			return NT;
		};
		
		var getNtValue = function(nwid, data) {
			var value = 0, values = data.Values.filter(function(el) {return (el.NWID == nwid)});

			if (values.length > 0) {				
				var i=0, len = values.length;
				for (i=0; i<len; i++) {
					value += (function(values) {
						var total = 0, i, len;
						for (i=0, len = values.length; i<len; i++) {
							if (values[i].MGID == typeID) {
								total += values[i].Increase;
								break;	
							}							
						}
						return total;
					})(values[i].Values);
				}
			}
			
			return value;
		};
		
		return {
            NT: makeData(NT, brandData(bid), this.DataDays)
        };
    },

    clearPlan: function () {
        this.Chart.clear();
        this._el.find('#graphs-view-body').empty().hide();
        this._el.find('h1').show();
        
        //清除媒体内容
        this.clearMetrics();
    }
});

PreviewApp.Views.chartView = new PreviewApp.Views.ChartView;

PreviewApp.Views.MetricsView = Backbone.View.extend({    
    //TODO:目前不支持AJAX取数据后的排序更新    
    el: '#Metrics-table',
    
    initialize: function() {
        
    },

    update: function() {
        $(this.el).trigger('update');
        
    },

    initOrder: function() {
        $(this.el).tablesorter( {sortList: [[5,1]]} ); 
    }            
});

PreviewApp.Views.metricsView = new PreviewApp.Views.MetricsView;

//应用页面控制器
PreviewApp.Views.AppView = Backbone.View.extend({
    initialize: function () {
        this.bindEvents();
        var inputValue = new PreviewApp.Views.InputView;
    },

    bindEvents: function () {
        //$('.date-selecter a').bind('click', this.bindDateSelecter);
        //$('.metrics-picker a').bind('click', this.bindMetricsPicker);
    },

    bindDateSelecter: function () {
        $(this).parent('.date-selecter').find('a').removeClass('on');
        $(this).addClass('on');
    },

    bindMetricsPicker: function () {
        $(this).parent('.metrics-picker').find('a').removeClass('on');
        $(this).addClass('on');
    }
});

PreviewApp.Controllers.Routes = Backbone.Router.extend({
                    
    QueryLength: 5, //请求参数长度 
                    
    Ids: [],
                    
    Types: ['views', 'fans', 'comments'],
                    
    Type: 'fans',

    routes: {
        "": "start",
        ":query": "run"                    
    },
                    
    start: function() {
        //this.run('1001-1002-1003-1004-1005-views-fans');                
    },                    
                    
    //router run
    run: function(query) {    		                                                                   
        //格式化请求参数
        this.formatQuery(query);                                                                        
                        
        var hash = this.getUrlHash();
		
        if(hash != query) { //匹配标准话参数
            this.loader();
            return;
        }		      
        if(this.Ids.length > 0) {                        
            PreviewApp.Views.chartView.addChartByIds(this.Ids); 
        }                                                       
    },
                    
    //格式化参数
    formatQuery: function(query){
        var arg = query.split('-'),
        idsAry=[], typesArg=[], type;                            
                        
        //拆分数组为IDS/TYPES                        
        var i,len, q;                            
        for (i=0, len=arg.length; i<len; i++) {                            
            q = parseInt(arg[i]);                                                       
            if (isNaN(q)) typesArg.push(arg[i]); 
            else idsAry.push(q);
                                                      
        }
                        
        if (idsAry.length < this.QueryLength) {
            for (i=0, len=this.QueryLength-1; i<len; i++) {
                if (idsAry[i] == undefined) idsAry.push('');
            }
        }
                        
        for (i=0, len=typesArg.length; i<len; i++) {
            type = typesArg.pop();
            if ($.inArray(type, this.Types) >= 0) break;
        }
         
        this.setIds(idsAry);
        this.setType(type);                        
    },
                    
    //标准格式hash
    getUrlHash: function() {
        return this.Ids.join('-') + '-' + this.Type;
    },
                    
    setIds: function(ids) {
        var len = this.QueryLength - 1;
        if(ids.length < len) return;
        this.Ids = ids.slice(0, len);
    },
                    
    setType: function(type) {                        
        if ($.inArray(type, this.Types) >= 0) {
            this.Type = type;
            return true;
        }
        return false;
    },
                    
    changeType: function(type) {                                
        if (this.setType(type)) {            
            this.loader();
        }                        
    },
    
    setDays: function(days) {
        PreviewApp.Views.chartView.setDataDays(days);
    },
    
    addId: function(id) {
        id = parseInt(id)
        if (isNaN(id)) return;
        
        this.Ids.push(id);
        
        //console.info(this.Ids);
        this.loader();
    },
    
    removeId: function(id) {
        id = parseInt(id);
        if (isNaN(id)) return;
        
        var i,len;
        for(i=0, len=this.Ids.length; i<len; i++) {
            if(this.Ids[i] == id) {
                this.Ids[i] = '';
            }
        }
        
        PreviewApp.Views.chartView.removeChartByBId(id);
        
        PreviewApp.Views.chartView.drawInit();
        
        this.loader();
    },
    
    loader: function() {                        
        var url = this.getUrlHash();
                        
        this.navigate(url, {
            trigger:true, 
            replace:true
        });
    }
});

PreviewApp.initialize();
//});