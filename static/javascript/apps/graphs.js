var URL =  WebSiteUrl;

var API = {
    //通过关键字搜索品牌
    SearchBrand: URL + '/Handler/SearchBrandForChart',    

    //通过品牌ID搜索品牌数据
    SearchBrandById: URL + '/Handler/GetBrandInfoByBIDForChart',

    //通过媒体ID搜索媒体数据
    MetricsData: URL + '/Handler/GetMetricsCollection',

    //获取所有事件类型
    EventTypes: URL + '/Handler/GetEventTypeMapping',

    //通过品牌ID获取事件数据
    EventData: URL + '/Handler/GetEventCollection',

    //通过日期，ID，品牌ID获取事件内容
    EventValueData: URL + '/Handler/GetEventContent',

    //通过品牌ID，媒体ID，日期获取数据
    GetBrandData: URL + '/Handler/GetDataForChart',

    //个人收藏列表
    GetQuickViewList: URL + '/Handler/GetQuickViewCollection',

    //根据ID获取收藏信息
    GetQuickViewByID: URL + '/Handler/GetQuickViewInfoByIDForChart',

    //删除个人收藏
    DelQuickViewByID: URL + '/Handler/DeleteQuickViewByID',

    //添加个人收藏
    AddQuickView: URL + '/Handler/QuickViewAdd',

    //更新个人收藏
	UpdateQuickView: URL + '/Handler/QuickViewUpdate',

	//获取个人默认收藏地址
	GetDefaultQuickView: URL + '/Handler/GetDefaultQuickViewInfoByIDForChart',

    //下载CSV
	DownloadCSV: URL + '/Handler/ExportTrend',

    // 添加自定义事件
	AddSelfEvents: URL + '/Handler/EventAdd',
	
	// 个人收藏品牌		
	AddFavorite: URL + '/Handler/FavoriteAdd',
	
	// 删除个人收藏品牌
	DelFavorite: URL + '/Handler/FavoriteDel',
	
	// 个人收藏列表
	FavoriteList: URL + '/Handler/Favorites'
};

/*
 * Graphs基类
 */
var Graphs = {

    Global: {},
    
    Fn: {},
    
    Views: {},
    
    Controllers: {},
    
    //类初始化
    initialize: function() {               
		this.appView = new Graphs.Views.AppView;
		
        //路由转发
        Graphs.Controllers.Router =  new Graphs.Controllers.Routes;
                
        Backbone.history.start();
    }
}

/*
 * 数据接口
 */
Graphs.API = API;

/*
 * Error
 */
Graphs.Global.Error = function(response) {

    if(typeof response == 'undefined') {
        alert('接口读取失败.');
    } else if(typeof response.ErrorCode == 'undefined') {
        alert('数据返回类型不正确.');
    } else {
        if(response.ErrorCode == 1000) {
			// TODO 弹窗
             $(".dialog.verification, .ui-mask").show();
		} else {
			alert('Response Error: ' + response.ErrorCode);
		}
    }        
};

/*
 * 数据调用
 */
Graphs.Global.LoadData = function(options) {        
    var settings = {
        api : '',
        data: {},
        callback: null
    };    
    
    settings = _.extend(settings, options);    
    
    $.getJSON(settings.api, settings.data, function(response) {        
        if(typeof response == 'undefined' ||  response.ErrorCode == 'undefined' || response.ErrorCode > 0) {
            if(typeof Graphs.Global.Error != 'undefined') {
                Graphs.Global.Error(response);
            }                  
            return;
        } else {
            if(typeof settings.callback == 'function') {
                settings.callback(response.ResultData);
            }
        }
    });        
};

/*
 * 禁止冒泡
 */
Graphs.Fn.cancelBubble = function(el){
    el.bind('click', function(e){
        if(e && e.stopPropagation) e.stopPropagation();
        else window.event.cancelBubble = true;
    });
};

/*
 * 周几
 */
Graphs.Fn.weekday = function(date) {    
    var D = new Date(date);
    var day = D.getDay();
            
    var wkday = '';
    switch(day) {
        case 0:
            wkday = '周日';
            break;
        case 1:
            wkday = '周一';
            break;
        case 2:
            wkday = '周二';
            break;
        case 3:
            wkday = '周三';
            break;
        case 4:
            wkday = '周四';
            break;
        case 5:
            wkday = '周五';
            break;
        case 6:
            wkday = '周六';
            break;
        default:
            break;
    }            
    return wkday;
};

/*
 * 数字金额转换
 */
Graphs.Fn.fmoney = function(s, n) {   
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

/*
 * 数字金额转换后还原
 */
Graphs.Fn.rmoney = function(s) {   
   return parseFloat(s.replace(/[^\d\.-]/g, ""));   
} 

/*
 * 个人收藏品牌列表
 * TODO:
 */
Graphs.Views.Favorite = Backbone.View.extend({
	
	Data: [],
	
	Favs: [],
	
	initialize: function() {
		this.loadData();
	},
	
	loadData: function() {
		var opt = {}, klass = this;
		opt.api = API.FavoriteList;
		opt.callback = function(response) {			
			var data = response.Data, i, len = data.length;
			if (len < 1) return;
			
			klass.Data = [];
			for (i=0; i<len; i++) {
				klass.Data.push(data[i].BrandID);
			} 
			
			klass.Favs = data;			
		};
		
		Graphs.Global.LoadData(opt);
	},
	
	getData: function() {
		return this.Data;
	},
	
	getFavs: function() {
		return this.Favs;
	},
	
	add: function(BID) {
		var opt = {}, klass = this;
		opt.api = API.AddFavorite;
		opt.data = {BrandID: BID};
		opt.callback = function(response) {			
			klass.Data.push(BID);
			
			klass.Data.push(response.Data);
		};
		
		Graphs.Global.LoadData(opt);
	},
	
	remove: function(BID) {
		var opt = {}, klass = this;
		opt.api = API.DelFavorite;
		opt.data = {BrandID: BID};
		opt.callback = function(response) {
			klass.Data = _.without(klass.Data, BID);
			var i, data = klass.Favs, len = data.length, favs = [];
			
			for (i=0; i<len; i++) {
				if(data[i].BrandID == BID) continue;
				favs.push(data[i]);
			}			
			
			klass.Favs = favs;
		};
		
		Graphs.Global.LoadData(opt);
	}
});


/*
 * 日期选择视图
 */
Graphs.Views.DatePicker = Backbone.View.extend({
    
    MaxDays : 60, //最大间隔天数
    
    DefaultDays: 30, //默认间隔天数
    
    StartDate : '',
    
    EndDate: '',
     
    El: null,
    
    Dialog: null,
    
    initialize: function() {
        this.El = $('.dateRangeBtn');
        
        this.initDate();                               
        
        this.Dialog = $('#Datapicker-Dialog');
        this.Dialog.hide();
        this.bindEvents();        
        
        //this.getDays();              
    },
    
    /*
     * 初始化日期
     */
    initDate: function(days) {
        var timer, startDate, endDate;
        
        days = typeof days == 'undefined' || isNaN(parseInt(days)) || parseInt(days) == 0 ? this.DefaultDays : days;
        
        endDate = this.getDate();
                        
        timer = this.getDateTime(endDate) - 1000 * 60 * 60 * 24 * days;        
        startDate = this.getDate(timer);        
        //结束日期为当前日期的前一天
        timer = this.getDateTime(endDate) - 1000 * 60 * 60 * 24;
        endDate = this.getDate(timer);
        
        this.StartDate = startDate;
        this.EndDate = endDate;
        
        this.initElView();        
    },   
    
    /*
     * 初始化View
     */    
    initElView: function() {
        this.El.find('.val1').text(this.StartDate);
        this.El.find('.val2').text(this.EndDate);
        
        this.setDatepicker();                
    },
    
    bindEvents: function() {
        var klass = this, 
            p = {klass:klass};
            this.El.bind('click', p, this.dialogView);
        
        this.Dialog.bind('show', p, this.showDialog);
        this.Dialog.bind('hide', p, this.hideDialog);
        
        this.Dialog.find('.ui-close').bind('click', p, function(){
            $(this).trigger('hide');
        });        
        
        Graphs.Fn.cancelBubble(this.Dialog);
        
        $('#selectDate').unbind('change').bind('change', p, this.selectData);
        
        var opt = {
            monthNames: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'],
            dayNamesMin: ['日','一','二','三','四','五','六'],
            dateFormat: 'yy-mm-dd',
            minDate: '-60d',
            maxDate: '-1d'
        };
        
        var klass = this,
            startOpt = {                
                defaultDate: this.StartDate,
                onSelect: function(dateText){
                    klass.setStartDate(dateText);
                    return true;
                }
            },
            endOpt = {                
                defaultDate: this.EndDate,
                onSelect: function(dateText){
                    klass.setEndDate(dateText);
                    return true;
                }
            };
        
        $('#datepicker-startDate').datepicker(_.extend(opt, startOpt));        
        $('#datepicker-endDate').datepicker(_.extend(opt, endOpt));               
    },
    
    setDatepicker: function(){
        $('#datepicker-title').text(this.StartDate + ' - ' + this.EndDate);
        $('#datepicker-startDate').datepicker('setDate', this.StartDate);
        $('#datepicker-endDate').datepicker('setDate', this.EndDate);
    },
        
    //获取天数
    //@return Array 返回所有天数数组
    getDays: function(){
        var days = this.dateDiff();
        var Days = [], date, i, len;
        
        var time = this.getDateTime(this.StartDate);        
        for(i=0; i<days; i++){
            date = this.getDate(time + 1000 * 60 * 60 * 24 * i);            
            date = this.chartFormatDate(date);
            Days.push(date);
        }        
        //console.info(Days);                                    
        return Days;
    },
    
    getDate: function(timer){
        var date;
        if(typeof timer == 'undefined') {
            date = new Date();
        } else {
            date = new Date(timer);
        }        
        return this.formatDate(date);
    },
    
    //获取下一个日期
    getNextDate: function(date, step) {
        var timer = this.getDateTime(date) + 1000 * 60 * 60 * 24 * step;
        var date = this.getDate(timer);
        return this.chartFormatDate(date);
    },
    
    //返回日期的timer    
    //格式 yyyy-mm-dd
    getDateTime: function(date){            	
        var S = new Date(date);
        return S.getTime();        
    },
    
    formatDate: function(date){
        var year, month, day;
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        if(parseInt(month) < 10) {
            month = '0' + month;
        }
        if(parseInt(day) < 10) {
            day = '0' + day;
        }
        
        return year + '-' + month + '-' + day;
    },
    
    chartFormatDate: function(date) {
        date = date.split('-');
        if(date.length < 3) return false;
        var month=date[1], day=date[2];
        
        return month + '-' + day;       
    },
    
    //返回天数之间的间隔
    dateDiff: function(){        
        var S = this.getDateTime(this.StartDate), E = this.getDateTime(this.EndDate);                
        
        //结束日期往后推1天
        E = E + 1000 * 60 * 60 * 24;
                                         
        var days = parseInt(Math.abs(E - S) / 1000 / 60 / 60 / 24);

        //超过最大限制天数，将开始日期转换为结束日期前60天.
        if(days > this.MaxDays) {
            days = this.MaxDays;
            var timer =  parseInt(Math.abs(E)) - (1000 * 60 * 60 * 24 * this.MaxDays);
                                       
            var startDate = this.getDate(timer);
            this.setStartDate(startDate);   
            this.initElView();
        }
        
        return days;
    },
    
    //纠正当前设置的开始和结束日期
    putDate: function(){
        var S = this.getDateTime(this.StartDate), E = this.getDateTime(this.EndDate);
        
        if(E < S) {
            var t=this.StartDate;
            this.setStartDate(this.EndDate);
            this.setEndDate(t);
            this.initElView();
        }
    },
    
    dialogView: function(events) {
        var klass = events.data.klass;
                
        Graphs.Fn.cancelBubble($(this));               
        
        if (klass.Dialog.is(':hidden')) {
             klass.Dialog.trigger('show');
        } else {
             klass.Dialog.trigger('hide');
        }                  
    },
    
    showDialog: function(events) {
        var klass = events.data.klass;
        
        klass.Dialog.show();
        
        $(document.body).toggle(function(){}, function(){
            klass.Dialog.trigger('hide');
        });
        
        setTimeout(function(){
            $(document.body).bind('click', function(){
                klass.Dialog.trigger('hide');
            });
        }, 1000);                
    },

    hideDialog: function(events) {
        var klass = events.data.klass;
        klass.Dialog.hide();          
    },
    
    selectData: function(events) {
        var klass=events.data.klass, val = $(this).val(), days;
        switch(val){
            case '1':
                days = 7;
                break;
            case '2':
                days = 15;
                break;
            case '3':
                days = 30;
                break;
            case '4':
                days = 60;
                break;
            default:
                days = 0;
                break;
        }
        
        //根据选择的天数重新初始化时间
        klass.initDate(days);      
        //重绘曲线          
        Graphs.appView.reloadChart();                
    },
    
    setStartDate: function(date) {
        this.StartDate = date;
        this.putDate();
        this.initElView();
        //重绘曲线
        Graphs.appView.reloadChart();
    },
       
    setEndDate: function(date) {
        this.EndDate = date;
        this.putDate();
        this.initElView();
        //重绘曲线
        Graphs.appView.reloadChart();     
    },
    
    getStartDate: function(){
        return this.StartDate;
    },
    
    getEndDate: function(){
        return this.EndDate;
    }
});

/*
 * 我的收藏
 */
Graphs.Views.QuickView = Backbone.View.extend({
	addBtnEl: '#Add-QuickView-Btn', //添加收藏按钮
	postBtnEl: '#Post-QuickView-Dialog',
	inputEl: '#Add-QuickView-Title', //收藏名称
	addDialogEl: '#Add-QuickView-Dialog', //对话框
	
	btnEl: '#QuickView-Btn',//收藏列表按钮		
	dialogEl: '#QuickView-Dialog', //收藏列表对话框
	editBtnEl: '.edit-quickview', //编辑收藏按钮
	delBtnEl: '.del-quickview',
	saveBtnEl: '.save-quickview', //保存编辑收藏按钮
	
	listEl: '.quickview-list',
	
	chartEl: '.brand-list-li',
	
	getAddBtnEl: function(){
		return $(this.addBtnEl);
	},
	getAddDialogEl: function() {
		return $(this.addDialogEl);
	},	
	getPostBtnEl: function(){
		return $(this.postBtnEl);		
	},
	getInputEl: function(){
		return $(this.inputEl);
	},
	
	getBtnEl: function() {
		return $(this.btnEl);
	},
	getDialogEl: function() {
		return $(this.dialogEl);
	},
	getEditBtnEl: function(){
		return $(this.editBtnEl);
	},
	getDelBtnEl: function(){
		return $(this.delBtnEl);
	},
	getSaveBtnEl: function(){
		return $(this.saveBtnEl);
	},	
	
	getListEl: function(){
		return $(this.listEl);
	},
	
	getChartEl: function(){
		return $(this.chartEl);
	},
	
	initialize: function() {		
		this.initView();
		this.bindEvents();
	},
	
	initView: function(){		
		var klass = this, opt = {};
		
		opt.api = Graphs.API.GetQuickViewList;
		opt.date = {};
		opt.callback = function(json) {
			klass.drawView(json.Data);						
		}
		Graphs.Global.LoadData(opt);
	},
	
	drawView: function(Data) {		
		if(Data.length < 1) return;
		
		var html, el = this.getListEl();
		
		html = (function(Data){
			var html = '', i, len, data;
			for (i=0, len=Data.length; i<len; i++) {
				data = Data[i];
				html += '<li>';
				html += '<a href="#'+data.ID+'" class="name">' + data.Name +  '</a>';
				html += '<a class="del-quickview thoughtbot" quickviewid="'+ data.ID +'">删除</a>';
				html += '</li>';
			}
			return html;
		})(Data);
		
		el.html(html);
		//重新绑定事件
		this.bindEvents();
	},
	
	bindEvents: function(){		
		this.bindViewEvents();
		this.bindEditEvents();
		this.bindAddEvents();										
	},
	
	bindViewEvents: function(){
		var klass = this, p = {klass:klass},
			btn = this.getBtnEl(),
			dialog = this.getDialogEl(),
			li = this.getListEl();
		
		btn.bind('click', function(){
			Graphs.Fn.cancelBubble($(this));
			dialog.trigger('show');
		});
		
		li.find('a.name').bind('click', function(){
			dialog.hide();			
			//dialog.trigger('hide');
		});
		
		dialog.bind('show', p, this.showDialog);
		dialog.bind('hide', p, this.hideDialog);
	},
	
	bindEditEvents: function(){
		var klass = this, p = {klass:klass},
			editBtn = this.getEditBtnEl(),
			delBtn = this.getDelBtnEl(),
			saveBtn = this.getSaveBtnEl();
		
		editBtn.unbind('click').bind('click', p, this.editQuickView);
		saveBtn.unbind('click').bind('click', p, this.saveQuickView);
		delBtn.unbind('click').bind('click', p, this.delQuickView);
	},
	
	bindAddEvents: function(){		
		var klass = this, p = {klass: klass};
		var addDialog = this.getAddDialogEl(), 
			addBtn = this.getAddBtnEl(), 
			postBtn = this.getPostBtnEl();
		
		//新增收藏
		addBtn.unbind('click').bind('click', function(){
			Graphs.Fn.cancelBubble($(this));
			addDialog.trigger('show');
		});
		
		//提交新增收藏
		postBtn.unbind('click').bind('click', p, klass.postQuickView);
		
		//新增收藏对话框
		addDialog.bind('show', p, klass.showAddDialog);
		addDialog.bind('hide', p, klass.hideAddDialog);
		
		addDialog.find('.ui-close').bind('click', function(){
			addDialog.trigger('hide');
		});		
	},	
	
	showDialog: function(events) {
		var klass = events.data.klass, el = $(this);
		Graphs.Fn.cancelBubble(el);
		$('.dialog').hide();		
		el.show();
		
		el.find('.ui-close').bind('click', function(){
			el.hide();
		});
		setTimeout(function(){
			$(document.body).bind('click', function(){
				el.trigger('hide');
			});
		});
	},
	
	hideDialog: function(events) {
		var klass = events.data.klass, el = $(this);
		el.hide();
	},
	
	editQuickView: function(events){
		var klass = events.data.klass, el = $(this),
			saveBtn = klass.getSaveBtnEl(), 
			delBtn = klass.getDelBtnEl();
			
		delBtn.show();
				
		el.hide();
		saveBtn.show();		
	},
	
	saveQuickView: function(events) {
		var klass = events.data.klass, el = $(this),
			editBtn = klass.getEditBtnEl(),
			delBtn = klass.getDelBtnEl(),
			dialog = klass.getDialogEl();
		
		delBtn.hide();
		dialog.trigger('hide');
		
		el.hide();
		editBtn.show();
	},
	
	delQuickView: function(events) {
		var klass = events.data.klass, el = $(this), 
			id = el.attr('quickviewid'),
			li = el.parent('li');
					
		el.hide();				
		li.css({'background-color': 'red'}).fadeOut(800);
		var opt = {};
		opt.api = Graphs.API.DelQuickViewByID;
		opt.data = {quickViewID: id};	
		opt.callback = function(json) {
			
		};
		Graphs.Global.LoadData(opt);		
	},
	
	showAddDialog: function(events) {
		var klass = events.data.klass, el = $(this), ot = el.find('.tail');
		Graphs.Fn.cancelBubble(el);
		$('.dialog').hide();
		el.show();
		
		ot.find('.txt').text('').hide();
		ot.find('.loader').hide();
		ot.find('.btn').removeAttr('disabled');
		
		setTimeout(function(){
			$(document.body).bind('click', function(){				
				el.trigger('hide');
			});
		}, 1000);
	},
	
	hideAddDialog: function(events) {
		var klass = events.data.klass, el = $(this);
		el.hide();
	},
	
	postQuickView: function(events) {
		
		var klass = events.data.klass,
			el = $(this),
			dialog = klass.getAddDialogEl(),
			txt = el.parent().find('.txt'),
			loader = el.parent().find('.loader'),
			data = klass.getAddData();
		
		if(!data) {
			txt.text('请至少选择一个品牌和媒体.').show();			
			return;
		}				
		
		el.attr('disabled', 'disabled');					
		loader.show();
		
		var opt = {};
		opt.type = 'post';
		opt.url = Graphs.API.AddQuickView;
		opt.data = data;
		opt.dataType = 'json';
		opt.complete = function() {							
			setTimeout(function() {
				loader.hide();
				el.removeAttr('disabled');						
				dialog.hide();
				//重新加载收藏页面				
			}, 500);							
		};
		opt.success = function(response) {
			// 清空输入框
			klass.getInputEl().val('');
			
			klass.initView();
		}
		$.ajax(opt);
	},
	
	makeQuickViewTitle: function() {
		return '我的收藏';
	},
	
	getAddData: function() {
		var el = this.getChartEl(), data = {},
			inputEl = this.getInputEl();
		
		if(el.length < 1) return false;
		
		var title = inputEl.val(), BId = [], MId = [],
			startDate = Graphs.appView.datepicker.getStartDate(),
			endDate = Graphs.appView.datepicker.getEndDate();
			
		if (title == '') title = this.makeQuickViewTitle();
		
		var $this, bid, mid;
		el.each(function(){
			$this = $(this);
			bid = $this.attr('brandid');
			mid = $this.attr('metricsid');
			
			if(bid != undefined && bid != '0' && mid != undefined && mid != '0'){
				BId.push(bid);
				MId.push(mid);	
			}					
		});
		
		if(BId.length < 1 || MId.length < 1) return false;
		
		//{_Name:"",BrandIDList:"",MetricsIDList:"",StartDate:"",EndDate:""}
		data._Name = title;
		data.BrandIDList = BId.join(',');
		data.MetricsIDList = MId.join(',');
		data.StartDate = startDate;
		data.EndDate = endDate;
		
		return data;
	},
	
	getDataById: function(id, callback){
		id = parseInt(id);
		if(isNaN(id)) return false;
		
		var opt = {};
		opt.api = Graphs.API.GetQuickViewByID;
		opt.data = {quickViewID: id};
		opt.callback = callback;
		
		Graphs.Global.LoadData(opt);
	}	
});

/*
 * 添加/删除 品牌视图
 */
Graphs.Views.OptBrand = Backbone.View.extend({

    domClassName: '.graphs-brand-list',
    liClassName: '.brand-list-li',
    elClassName: '.brand-opt',
    
    initialize: function() {
        this.bindEvents();
    },
    
    bindEvents: function() {
        var el = $(this.domClassName).find(this.liClassName).find(this.elClassName),            
        add = el.find('.add'),
        del = el.find('.del');
            
        var p = {
            klass:this
        };    
        if(add[0]) add.unbind('click').bind('click', p, this.addBrand);
        if(del[0]) del.unbind('click').bind('click', p, this.delBrand);                
    },
    
    /*
     * 添加品牌
     */
    addBrand: function(events) {        
        var klass = events.data.klass,
        $this = $(this);
        
        var len = $(klass.domClassName).find(klass.liClassName).length;
        if(len >= Graphs.appView.chart.getMaxLength()) {
            alert('最多只能添加六个品牌');            
            return;
        }
        
        var li = $this.parents(klass.liClassName),html;
                    
        html = (function(li){
            var html = '',                 
                BID = li.attr('brandid'), MID = li.attr('metricsid'), NID = li.attr('networkid'),
                color = Graphs.appView.chart.getOneColor(),                
                BName = li.find('.brand-attrs .txt').text(),BImg = li.find('.brand-attrs .img').html(),
                MName = li.find('.metrics-attrs .txt').text();            
            var chartID = Graphs.appView.chart.makeChartID();
            html += '<li class="brand-list-li" chartid="'+chartID+'" brandid="'+BID+'" networkid="'+NID+'" metricsid="'+MID+'">';                        
            html += '<dl>';
            html += '<dt class="brand-color" style="background-color: '+color+'"></dt>';
            html += '<dd class="brand-name">';
            html += '<div class="brand-attrs graphs-brand-name">';
            html += '<span class="img">'+BImg+'</span>';
            html += '<span class="txt">'+BName+'</span>';
            html += '<span class="icon_arrow"></span>';
            html += '</div>';
            html += '</dd>';
            html += '<dd class="brand-metrics">';
            html += '<div class="metrics-attrs graphs-brand-metrics">';
            html += '<span class="txt">'+MName+'</span>';
            html += '<span class="icon_arrow"></span>';
            html += '</div></dd>';
            html += '<dd class="brand-opt"><a class="add">+</a><a class="del">x</a>';
            html += '</dd>';
            html += '</dl>';
            html += '</li>';       
            
            return html;
        })(li);
        
        $(klass.domClassName).append(html);                
        
        $(klass.domClassName).find(klass.liClassName).find('a.del').removeClass('disabled');
        
        //添加品牌后续事件
        Graphs.appView.addBrand();
    },
    
    /*
     * 删除品牌
     */
    delBrand: function(events) {
        var klass = events.data.klass,
        $this = $(this);
        if($this.hasClass('disabled')) {
            return;
        };
        
        var li = $this.parents(klass.liClassName),
        BID = li.attr('brandid'),
        MID = li.attr('metricsid');
        
        //保留颜色
        var color = li.find('.brand-color').css('background-color');
        Graphs.appView.chart.pushColor(color);
        
        li.remove();
        
        //保留最后一个LI
        var lis = $(klass.domClassName).find(klass.liClassName),
        len = lis.length;
        if(len == 1) {
            lis.slice(0, 1).find('a.del').addClass('disabled');
        }
        
        //删除品牌后续事件
        Graphs.appView.delBrand();
                
    },
    
    setBrandColor: function(el, color) {
        el.find('.brand-color').css('background-color', color);
    }
});

/*
 * 选择品牌视图
 */
Graphs.Views.Brand = Backbone.View.extend({
    el: null,
    
    domClassName: '.brand-list-li', //最高层元素样式名称
    brandClassName: '.graphs-brand-name',
    dialogClassName: '.Search-Brand-Dialog', //Dialog样式名称

    initialize: function(){
        this.bindEvents();    
    },
    
    bindEvents: function(){
        var p = {klass: this};
        $(this.brandClassName).unbind('click').bind('click', p, this.searchBrandView);
    },
    
    /*
     * 搜索品牌VIEW
     */
    searchBrandView: function(events) {             
        Graphs.Fn.cancelBubble($(this));
            
        var klass = events.data.klass,
            el = $(this).find(klass.dialogClassName);
        
        klass.el = $(this);
        //隐藏所有Dialog
		$(document.body).find('.dialog').hide();
		
		// TODO 添加个人收藏的品牌
        if (!el[0]) {            
            klass.addBrandDialogView($(this));         
        } else if(el.is(':hidden')){
            el.show();
        } else {
            el.hide();
        }
    },
    
    /*
     * 添加品牌搜索框
     */
    addBrandDialogView: function(el) {
        
        el.append($('#search-brand-dialog').html());
        
        var dialog = el.find(this.dialogClassName);
        
        var favs = Graphs.appView.fav.getFavs();
        if (favs.length > 0) {
        	var html = (function(favs){
        		var html = '', i, len=favs.length;
        		for (i=0; i<len; i++) {        			
        			html += '<li class="brandListVal" brandid="'+favs[i].BrandID+'">';
	                html += '<a class="brand-name">';
	                html += '<span class="name">'+favs[i].BrandName+'</span>';
	                html += '<span class="iname">('+favs[i].IndustryName+')</span>'; 
	                html += '</a>';                
	                html += '<a class="fav-btn remove-fav" title="取消收藏 '+favs[i].BrandName+'">-</a>';	                
	                html += '</li>';	
        		}
        		        		
        		return html;
        	})(favs);
        	var list = dialog.find('.result-list');
        	
        	list.html(html);
        	this.bindSelectBrand(list);
        }
        
        dialog.show();
        this.bindDialogEvents(dialog);                   
    },
    
    /*
     * 绑定dialog事件
     */
    bindDialogEvents: function(dialog) {                            
        Graphs.Fn.cancelBubble(dialog);
        
        //关闭事件
        var p = {el: dialog}, klass=this;     
        
        dialog.find('.ui-close').bind('click', p, this.closeDialog);
        setTimeout(function(){
            $(document.body).bind('click', p, klass.closeDialog);        
        }, 1000);
                        
        //绑定输入框事件
        var input = dialog.find('.inputSearch');
        if (input[0]) {
            this.bindInputEvents(input);
        }                
    },
    
    /*
     * 关闭dialog框
     */
    closeDialog: function(events) {        
        if(events && typeof events.data != 'undefined' &&  typeof events.data.el != 'undefined') {
            var el = events.data.el;
            el.hide();
        }        
        //$(document.body).unbind('click');
    },
        
    /*
     * 绑定搜索框事件
     */
    bindInputEvents: function(el) {
        var parent = el.parents('#brand-search-content');
        if (!parent[0]) return;
        
        var klass = this, timer;
        
        var searchView = (function(el) {
            return el.parents('.popOverSearch');
        })(el);
                
        var Events = {
            focus: function() {
                searchView.find('.dummyText').addClass('on');
            },
            
            blur: function() {
                searchView.find('.dummyText').removeClass('on');
            },
            
            keyup: function(e) {
                var $this = $(this),
                val = $this.val(),
                len = val.length;
                
                searchView.find('.dummyText').hide();
                
                //判断是否是删除                
                if(e.keyCode == 8 && len < 1) {                    
                    searchView.find('.dummyText').show().removeClass('on');                    
                }                
                
                try{
                    clearTimeout(timer);
                } catch(e) {
                //
                }
                                
                timer = setTimeout(function() {                            
                    searchView.find('.searchIcon').hide();
                    var loader = searchView.find('.loader');
                    if(!loader[0]){
                        searchView.append('<span class="loader"></span>');
                    } else loader.show();
                    
                    klass.searchBrand($this);
                }, 800)                
            }
        };        
        
        el.unbind('focus').bind('focus', Events.focus)
          .unbind('blur').bind('blur', Events.blur)
          .unbind('keyup').bind('keyup', Events.keyup);        
    },
    
    /*
     * 搜索品牌
     */
    searchBrand: function(el) {                
        var kw = el.val(),     
        searchView = el.parents('.popOverSearch'),
        klass = this;
                            
        if(kw.length < 1) {
            searchView.find('.loader').hide();
            searchView.find('.searchIcon').show();
            return;
        };
                
        var opt = {};
        opt.api = Graphs.API.SearchBrand;
        opt.data = {
            key: kw
        };
        opt.callback = function(json) {                                    
            klass.showBrandResult(el, json.Data);
        };
        
        Graphs.Global.LoadData(opt);        
    },
    
    /*
     * 显示搜索的品牌结果
     */
    showBrandResult: function(el, Data) {
        if(typeof el == 'undefined' || typeof Data == 'undefined' || Data.length < 1) return;
        
        var searchView = el.parents('.popOverSearch'),
        list = el.parents(this.dialogClassName).find('.result-list');
            
        if(!list[0]) return;
        
        searchView.find('.loader').hide();
        searchView.find('.searchIcon').show();
                
        //初始化
        //list.html('');        
        var html = (function(data){
            var i, len, html='', favs = Graphs.appView.fav.getData();
            for (i=0,len=data.length; i<len; i++) {            	
                html += '<li class="brandListVal" brandid="'+data[i].ID+'">';
                html += '<a class="brand-name">';
                html += '<span class="name">'+data[i].Name+'</span>';
                html += '<span class="iname">('+data[i].IName+')</span>'; 
                html += '</a>';                
                if ($.inArray(data[i].ID, favs) === -1) {                	
                	html += '<a class="fav-btn add-fav" title="收藏 '+data[i].Name+'">+</a>';
                } else {
                	
                	html += '<a class="fav-btn remove-fav" title="取消收藏 '+data[i].Name+'">-</a>';
                }
                html += '</li>';
            }
            return html;
        })(Data);
                
        list.html(html);
        
        //绑定品牌选中事件
        this.bindSelectBrand(list);
    },
    
    /*
     *品牌选中事件
     */
    bindSelectBrand: function(list) {        
        if(typeof list == 'undefined') return;
        if(!this.el) return;
        var klass = this;
        
        var select = function() {            
            var $this = $(this).parent('.brandListVal'),
            	bid = $this.attr('brandid');
            
            if(!bid) return;
            
            var opt = {};
            opt.api = Graphs.API.SearchBrandById;
            opt.data = {
                bid:bid
            };
            opt.callback = function(json) {
                if(typeof json.Data == 'undefined' || json.Data.length < 1) return;
                klass.changeBrand(json.Data[0]);
            };
            
            Graphs.Global.LoadData(opt);
        };
        
        var addFav = function() {
        	var $el=$(this), 
        		$this = $el.parent('.brandListVal'), 
        		bid = $this.attr('brandid');
        		
        	$el.removeClass('add-fav').addClass('remove-fav').text('-').unbind('click');
        		
        	Graphs.appView.fav.add(bid);
        	setTimeout(function(){
        		$el.bind('click', delFav);
        	}, 1000);             	
        };
        
        var delFav = function() {
        	var $el=$(this), 
        		$this = $el.parent('.brandListVal'), 
        		bid = $this.attr('brandid');
        		
        	$el.removeClass('remove-fav').addClass('add-fav').text('+').unbind('click');
        		
        	Graphs.appView.fav.remove(bid);
        	setTimeout(function(){
        		$el.bind('click', addFav);
        	}, 1000);        	
        };
                
        var li = list.find('li.brandListVal');
        // 选择品牌
        li.find('.brand-name').bind('click', select);
        // 收藏品牌
        li.find('.add-fav').bind('click', addFav);
        li.find('.remove-fav').bind('click', delFav);           
                    
    },
    
    /*
     * 更改品牌
     */
    changeBrand: function(Data){
        if(!this.el) return;
        var dom = this.el.parents(this.domClassName);
        var bid = dom.attr('brandid');
        
        //关闭Dialog
        dom.find('.brand-name').find(this.dialogClassName).hide();        
        
        if(bid == Data.ID) return;
        
        var img = dom.find('.brand-attrs span.img'),
        txt = dom.find('.brand-attrs span.txt');
        
        if (!img[0] || !txt[0]) return;
        if (typeof Data.ID == 'undefined' || typeof Data.Name == 'undefined') return;
        
        //更改品牌相关属性        
        txt.text(Data.Name);
        img.find('img').attr('src', Data.Img);
                
        //更改品牌后续事件
        dom.attr('brandid', Data.ID);        
        Graphs.appView.changeBrand();
    }
});

/*
 * 选择媒体视图
 */
Graphs.Views.Metrics = Backbone.View.extend({    

    el: null,   
    
    domClassName: '.brand-list-li', //最高层元素样式名称
    metClassName: '.graphs-brand-metrics', //当前媒体样式名称
    dialogClassName: '.Metrics-Dialog', //当前Dialog样式名称
    
    initialize: function() {
        this.bindEvents();
    },
    
    bindEvents: function() {
        var p = {
            klass: this
        };
        $(this.metClassName).unbind('click').bind('click', p, this.metricsView);
    },
    
    metricsView: function(events) {       
        Graphs.Fn.cancelBubble($(this));                             
        
        var klass = events.data.klass,
            el = $(this).find(klass.dialogClassName);            
        
        klass.el = $(this);
        //隐藏所有Dialog
		$(document.body).find('.dialog').hide();
        if (!el[0]) {
            klass.addMetricsDialogView($(this));         
        } else if(el.is(':hidden')){
            el.trigger('show');
        } else {
            el.hide();
        }                
    },
    
    addMetricsDialogView: function(el) {    
        
        el.append($('#select-metrics-dialog').html());
        
        var dialog = el.find(this.dialogClassName);
        dialog.show();        
        this.bindDialogEvents(dialog);                        
    },
    
    bindDialogEvents: function(dialog){
        var klass = this;
        
        Graphs.Fn.cancelBubble(dialog);
        
        //显示事件
        dialog.bind('show', {
            klass:klass, 
            dialog:dialog
        }, this.showMetricsView);                
        dialog.trigger('show');        
        //关闭事件
        var klass = this, p = {el: dialog};     
        dialog.find('.ui-close').bind('click', p, this.closeDialog);
        setTimeout(function(){
            $(document.body).bind('click', p, klass.closeDialog);
        }, 1000);               
    },
    
    /*
     * 关闭dialog框
     */
    closeDialog: function(events) {
        if(events && typeof events.data != 'undefined' &&  typeof events.data.el != 'undefined') {
            var el = events.data.el;
            el.hide();
        }
    },
    
    /*
     *显示媒体框
     */
    showMetricsView: function(events) {                        
        var klass = events.data.klass,
            dialog = events.data.dialog,
            bid = klass.getBrandId();
        
        $(this).show();        
				
        if(!bid) {
            dialog.find('.title').text('请先选择品牌');
            return false;
        } else {
            dialog.find('.title').text('选择媒体&参数');
        }        
        dialog.find('.loader').show();
                        
        //var isLoaded = dialog.attr('loaded');        
        var isLoaded = false;
        if(!isLoaded) {                     
            var opt = {};
            opt.api = Graphs.API.MetricsData;
            opt.data = {
                bid: bid
            };
            opt.callback = function(json) {
                klass.showMetricsResult(dialog, json.Data);
            };

            Graphs.Global.LoadData(opt);
        }
        
    },
    
    /*
     * 显示媒体数据
     */
    showMetricsResult: function(dialog, Data) {        
        var el = dialog.find('.result-content');
       
        var html = (function(data){                                    
            if(data.length < 1) return '';
            
            var i, len, html='', metrics, _i, _len;
            for(i=0, len=data.length; i<len; i++) {
                
                if(data[i].Metrics.length < 1) continue;
                
                metrics = data[i].Metrics;
                
                html += '<ul class="result-list">';
                html += '<li class="metrics-title" nid="'+data[i].NID+'">'+data[i].NName+'</li>';                
                for(_i=0,_len=metrics.length; _i<_len; _i++) {
                    
                    html += '<li class="metircs-name" mid="'+metrics[_i].MID+'">';
                    html += '<a class="metricsTitle"><span class="metName">';                        
                    html += '<span class="metNameText">'+metrics[_i].MName+'</span>';
                    html += '<span class="icon"></span>';
                    html += '</span></a>';
                    html += '</li>';                                   
                }
                html += '</ul>';
                                
            }                        
            return html;            
        })(Data);
                
        el.html(html);
								
        dialog.attr('loaded', 'true');
        dialog.find('.loader').hide();
        
        //增加已经选中的
		this.remainingSelected(el);
        
        //绑定媒体选择事件
        this.bindMetricsEvents(el);				
    },
    /*
     *绑定媒体选择事件
     */
    bindMetricsEvents: function(el){
        var list = el.find('a.metricsTitle');
        
        list.bind('click', {
            klass: this
        }, this.changeMetrics);
    },
    
	/*
	 * 筛选已经选中的媒体
	 */
	remainingSelected: function(el) {
				
		var hash = Graphs.appView.chart.getBrandHash(), BID;
		
		if (hash.length < 1) return;
		
		BID = el.parents('.brand-list-li').attr('brandid');
		
		var i, len = hash.length;
		for (i=0; i < len; i++) {
			if(hash[i].BId == BID) {
				mid = hash[i].MId || 0;
				mname = hash[i].MName || '';
				if (mid == 0) continue;
				el.find("li[mid='"+mid+"'] a").removeClass('metricsTitle').addClass('actived').attr({title: mname + ' 已选中'});	
			}															
		}
	},
	
    /*
     * 更改媒体
     */
    changeMetrics: function(events) {        
        var klass = events.data.klass,
        $this = $(this).parent('li.metircs-name'),
        dom = $this.parents(klass.domClassName),
        MId = $this.attr('mid'); //新Metrics ID
            
        var mid = dom.attr('metricsid');
        
        //关闭dialog
        dom.find('.brand-metrics').find(klass.dialogClassName).hide();        
        
        if(mid == MId) return;
        
        var $parent = $this.parent('.result-list'),
        $pParent = $this.parents('.result-content'),                        
        txt = dom.find('.metrics-attrs span.txt');
        
        //更改媒体页面属性
        var metTitle = $parent.find('.metrics-title').text(),
        metName = $this.find('.metNameText').text();
        
        if (typeof mid == 'undefined') return;        
        
        var metTxt = metTitle + '(' + metName + ')';        
        txt.text(metTxt);
        
        //更改选中属性
        $pParent.find('li a').removeClass('selected');
        $this.find('a').addClass('selected');

        //更改媒体后续事件
        dom.attr('metricsid', MId);
        
        Graphs.appView.changeMetrics();
    },
    
    /*
     * 获取当前品牌ID
     */
    getBrandId: function() {
        if(typeof this.el == 'undefined' || ! this.el) return 0;
        
        var el = this.el.parents(this.domClassName),
        bid = el.attr('brandid');
        
        if(typeof bid == 'undefined') return 0;
        
        bid = parseInt(bid);
        if(isNaN(bid)) return 0;
        return bid;
    }    
});

/*
 * 事件类型视图
 */
Graphs.Views.EventStreamType = Backbone.View.extend({
    El: '#events-types-list',
    
    initialize: function() {        
        this.initView();
        this.bindEvents();
    },
    
    bindEvents: function() {
        var p = {klass: this};
        $('#show-events-types').unbind('click').bind('click', p, this.showTypeView);
        $('#hide-events-types').unbind('click').bind('click', p, this.hideTypeView);
        
        Graphs.Fn.cancelBubble($('#show-events-types'));
        Graphs.Fn.cancelBubble(this.getTypeViewEl());
    },
    
    getEl: function(){
        return $(this.El);
    },
    
    initView: function() {
        var klass = this, opt = {};
        
        opt.api = Graphs.API.EventTypes;
        opt.data = {};
        
        opt.callback = function(json) {            
            var el = klass.getEl(), html;
            
            html = (function(data){
                var html = '', i, len;
                for(i=0, len=data.length; i<len; i++) {
                    html += '<dd>';
                    html += '<input type="checkbox" value="'+data[i].ID+'" checked="checked" class="events-types-input"/> '+data[i].Name;
                    html += '</dd>';
                }
                return html;
            })(json.Data);
            
            el.html(html);
            el.find('input.events-types-input').bind('click', {
                klass:klass
            }, klass.pickerType);
        };
        
        Graphs.Global.LoadData(opt);
    },
    
    /*
     * 选择类型
     */
    pickerType: function(events) {
        var klass = Graphs.appView.eventStream,
            $this = $(this),
            typeid = $this.val();
        if($(this).attr('checked')) {            
            klass.optStreamByType(typeid, true);
        } else {            
            klass.optStreamByType(typeid, false);
        }
    },
    
    /*
     * 事件类型EL
     */
    getTypeViewEl: function(){
        return $('#events-types-view');
    },
    
    /*
     * 显示事件类型层
     */
    showTypeView: function(events){
        var klass = events.data.klass,
            el = klass.getTypeViewEl().parent('.streamOptions'),
            height = 310;                    
                                        
        el.height(42);                        
        el.show();
        el.animate({
            height: height
        }, 200);        
        
        $(document.body).bind('click', {klass:klass}, klass.hideTypeView);
    },
    
    /*
     * 隐藏事件类型
     */    
    hideTypeView: function(events){
        var klass = events.data.klass,
            el = klass.getTypeViewEl().parent('.streamOptions');
        height = 42;
            
        el.animate({
            height: 42
        }, 310, function(){
            //el.hide();
            el.height(height);
        }); 
    }   
});

/*
 * 事件流视图
 */
Graphs.Views.EventStream = Backbone.View.extend({
    El : '#events-container',
    
    EventBID: 0,
    
    EventData: [],  //品牌事件
    
    getEl: function(){
        return $(this.El);
    },
    getSelectEl: function(){
        return $('#events-brand-list');
    },
    
    initialize: function() {
        this.initView();
        this.bindEvents();        
    },
    
    initView: function() {
		var height = $(document).height();		
		
		$(this.El).find('.eventStream').css('min-height', height-40);
        this.loadingView(false);
        this.getEl().find('ul.eventStream li:gt(0)').remove();
    },
    
    bindEvents: function() {
        var p = {klass: this}; 
        this.getSelectEl().unbind('change').bind('change', p, this.selectBrand);                       
    },    
                    
    /*
     * 通过事件类型隐藏/显示事件流
     */
    optStreamByType: function(typeid, show) {
        var el = this.getEl().find('.events-list-body dd[typeid='+typeid+']');
        if(show) el.show();
        else el.hide();
    },
    
    /*
     * 选择品牌
     */
    selectBrand: function(events){
        var BID = $(this).val(), klass=events.data.klass;		
        klass.setEventBID(BID);               
    },
	
	/*
	 * 格式化图标的日期
	 */
	getDayFromChart: function(day) {
		var date = new Date();
		day = date.getFullYear() + '-' + day;
		return day;
	},
	
	/*
	 * 跳转到指定的日期
	 */
    gotoDay: function(day) {		
		day = this.getDayFromChart(day);
		
		var P = $(this.El), el = P.find('.eventStream li.day[date='+day+']');
		if (!el[0]) return;
		
		el.addClass('active');								
		$(P).scrollTo(el, 600, {offset:{top: -150}});		
	},
	
	/*
	 * 高亮指定的日期
	 */
	lightDay: function(day) {
		day = this.getDayFromChart(day);		
		
		var el = $(this.El).find('.eventStream li.day[date='+day+']');
		if (!el[0]) return;
		
		$(this.El).find('.eventStream li.day').removeClass('active');
		el.addClass('active');
	},
	
    /*
     * 设置颜色
     */
    setColor: function(color) {
        if(typeof color != 'undefined') $('.eventStream').find('.event-color').css('background-color', color);
    },         
    
    /*
     * 设置事件品牌ID
     */
    setEventBID: function(BID) {
        this.EventBID = BID;
        var color = Graphs.appView.chart.getColorByBId(BID);		
        this.setColor(color);        
		
        this.refreshView();
    },
    		
    /*
     * 刷新
     */
    refresh: function(){
        var i, len, ids=[], data = Graphs.appView.chart.getBrandIds();
        len = data.length;
	
        if(len < 1) {
            this.initView();
            return;
        }
        
        var options='';
        for(i=0; i<len; i++) {
            ids.push(data[i].BId);
            options += '<option value="'+data[i].BId+'">'+data[i].BName+'</option>';
        }
        
        var el = this.getEl(), selectEl = this.getSelectEl();
        
        selectEl.empty().html(options);        
		
        var bid = $('#events-list').attr('brandid');		
        if($.inArray(bid, ids) == -1) {
            el.find('ul.events-list li.gt(0)').remove();
            bid = ids[0];
        } else {
            selectEl.find('option value=['+bid+']').attr('selected', 'selected');            
        }                               
        this.setEventBID(bid);            
    },
    
    /*
     * 刷新事件列表HTML
     */
    refreshView: function(){        		
        if(this.EventBID == 0) {
            this.initView();
            return false;
        }                        
        var Data = this.getDataByBId(this.EventBID);		
        if(Data) {
            this.drawView(Data);       
        } else {
			this.loadingView(true);			
            var klass = this, opt = {};
            opt.api = Graphs.API.EventData;
            opt.data = {ids:this.EventBID};			
            opt.callback = function(json) {						
                if(typeof json.Data == 'undefined' || json.Data.length < 1) {
                    klass.initView();
                    return;
                };                 
                var Data = json.Data[0];
                klass.EventData.push(Data);
                klass.drawView(Data); 
				
				klass.loadingView(false);
            }
            Graphs.Global.LoadData(opt);
        }
    },
    
    /*
     * Loading 层
     */
    loadingView: function(show) {
        var el = this.getEl().find('.loading');
        if(show) el.show();
        else el.hide();   
    },
    
    /*
     * 通过品牌ID获取事件数据
     */
    getDataByBId: function(BID) {               
        var i,len, data = false;
        for(i=0, len=this.EventData.length; i<len; i++) {
            if(this.EventData[i].BID == id) {
                data = this.EventData[i];
                break;
            }
        }
        return data;
    }, 
    
    /*
     * 绘制事件流层
     */
    drawView: function(data) {        		
        var klass = this, el = this.getEl().find('#events-list');
        if(el.attr('brandid') == this.EventBID) return;
        
        var html = (function(data){
            var Data = data.EData;
            var html='', 
                events, 
                date,
                i, len, _i, _len;
            for (i=0,len=Data.length; i<len; i++) {
                date = Data[i].Date;
                html += '<li class="day" date="'+ date +'" id="day'+date+'">';
                html += '<dl class="events-list-body">';
                html += '<dt>' + Graphs.Fn.weekday(date) + ', ' + date + '<a class="add-events">+</a></dt>';
                events = Data[i].Events;                
                for (_i=0, _len=events.length; _i<_len; _i++){
                    html += '<dd typeid="'+ events[_i].TypeID +'">';
                    html += '<a class="events-value">'+ events[_i].TypeName +'</a>';
                    html += '<span class="number gray">(' + events[_i].Value + ')</span>';
                    html += '</dd>';
                }                
                html += '</dl>';
                html += '</li>'; 						
            }
            return html;
        })(data);        
		
		el.find('li.day').remove();
        el.append(html);
        el.find('.events-list-body dd .events-value').bind('click', {
            klass:klass
        }, this.eventsValueView);
		
		el.find('.events-list-body .add-events').bind('click', {klass:klass}, this.addSelfEvents);
		
        el.attr('brandid', this.EventBID);
                
        this.loadingView(false);
    },    
    
    /*
     * 事件流详细层
     */
    eventsValueView: function(events){
        var el = $(this).parent('dd'), klass = events.data.klass;
        
        var date = el.parents('li').attr('date'),
            typeId = el.attr('typeid'),
            id = klass.EventBID;            
        
        if(date == undefined || id == undefined || !id || typeId == undefined || !typeId) return;                
        
        if(!el.find('.dialog')[0]) {
            var dialog = $('#dialog-event-view').html();                        
            el.append(dialog);
            
            var opt = {};
            
            opt.api = Graphs.API.EventValueData;
            opt.data = {
                Date: date, 
                TypeId: typeId, 
                BId: id
            };
            opt.callback = function(json) {                
                if(typeof json.Data == 'undefined' || json.Data.length < 1) return;
                //HTML
                var html = (function(Data){                    
                    var html='', i, len;
                    for(i=0, len=Data.length; i<len; i++) {
                        html += typeof Data[i].Url == 'undefined' || Data[i].Url == null ? '<li>'+Data[i].Value+'</li>' : '<li><a href="'+Data[i].Url+'" target="_blank">'+Data[i].Value+'</a></li>';
                    }
                    return html;
                })(json.Data);
                                
                el.find('.event-value-ul').html(html);
            };
            el.find('.event-value-date').text(date);
            
            Graphs.Global.LoadData(opt);            
        }
        
        $('.dialog.event').hide();        
        
        var dialog = el.find('.dialog');
        dialog.show();
  		// 底部间隙
		var top = dialog.offset().top, height = $(window).height() + $(window).scrollTop();
		if(height - top < 260) {
			dialog.css({top: '-250px'});
			dialog.find('.arrow-up').css({top: '250px'});
		}
						       
        Graphs.Fn.cancelBubble(el);
        Graphs.Fn.cancelBubble(dialog);
        
        //dialog.find('a.close').unbind('click').bind('click', function(){
        //    $(this).parents('.dialog').hide();
        //});
        $(document.body).bind('click', function(){dialog.hide();});
    },
	
	/*
	 * 添加自定义事件
	 */
	addSelfEvents: function(events) {
		var klass = events.data.klass, el = $(this).parents('li.day'), day;
		
		day = el.attr('date');
		
		
		var dialog = $('#add-event-dialog');
		dialog.find('.ui-close').bind('click', function(){
			dialog.hide();
		});
		dialog.find('.event-day').val(day);
		dialog.find('.btn').bind('click', {klass: klass}, klass.doAddEvents);
		dialog.show();
	},
	
	doAddEvents: function(events) {
		var klass=events.data.klass, opt={}, data = {}, dialog = $(this).parents('.dialog');
		
		// TODO: 添加之前的验证
		
		data.BrandID = klass.EventBID;
		data._Title = dialog.find('.event-title').val();
		data.Content = dialog.find('.event-content').val();
		data._Date = dialog.find('.event-day').val();
				
		opt.url = Graphs.API.AddSelfEvents
		opt.type = 'post';
		opt.dataType = 'json';
		opt.data = data;
		
		opt.success = function(response) {
			//
		};
				
		$.ajax(opt);
		
	}
});

/*
 * 媒体属性视图
 */
Graphs.Views.MetricsAttr = Backbone.View.extend({    
    El: '#Metrics-Body',
    
    getEl: function(){
        return $(this.El);
    },

    initialize: function(){
        this.initView();
    },
    
    initView: function(){
        this.getEl().empty();
    },
    
    /*
     * 加载媒体HTML
     */
    autoLoad: function() {    
    	// TODO    
        var el = this.getEl(), chart = Graphs.appView.chart, chartids = chart.getChartIds();
        var DrawData = Graphs.appView.chart.getDrawData();
                
        var days = DrawData.Days, date = new Date(), year = date.getFullYear();;       
        
        //初始化2个时间段        
        var halfLen = days.length;
        
        var date1Start, date1End, date2Start, date2End;
      
        date1Start = Graphs.appView.datepicker.getNextDate(year + '-' + days[0], halfLen * -1 -1);
		date1End =  Graphs.appView.datepicker.getNextDate(year + '-' + days[0], -1);
		
        date2Start = days[0].replace('-', '/');
        date2End = days[days.length - 1].replace('-', '/');
       
        $('#Data-StartDate').text(date1Start + '-' + date1End);
        
        $('#Data-EndDate').text(date2Start + '-' + date2End);
        
        var html = (function(chartids){
            var i, len, html='';            
            var id, color, bid, mid, bname, mname, data, total, value, value1, value2, exp, addnew, change, lastUpdate;            
            
            for(i=0,len=chartids.length; i<len; i++){
                id = chartids[i];
                exp=0, total=0, value=0, value1=0, value2=0, addnew='', change=0, lastUpdate='';
                
                color = chart.getColorByChartId(id);
				bid = chart.getBIdByChartId(id);
                bname = chart.getBrandNameByChartId(id);
				mid = chart.getMIdByChartId(id);
                mname = chart.getMetricsNameByChartId(id);
				lastUpdate = chart.getLastUpdate(bid, mid);
				
				data = chart.hasProcessedData(id, bid, mid);				
				if (!data || typeof data.Data == 'undefined' || data.Data.length < 1) continue;
												
				var _i = halfLen * 2;
				while (_i) {
					value = 0;					
					if (data.Data.length > 0) {
						value = data.Data.pop().increase;
					}
					
					total += value;
					if (_i >= halfLen) value2 += value;
					else value1 += value;
					
					_i--;
				};				
				
                exp = value2 - value1;
				if(exp == 0) {
					addnew = '0';
					change = '0%';
				} else if(exp < 0) {
					addnew = '- ' + Graphs.Fn.fmoney(exp * -1);
					change = value1 > 0 ? '- ' + Math.round(((exp*-1) / value1 * 100) * 100) / 100 + '%' : '+100%';
                    //addnew = '<font style="color:red">- ' + exp + '</font>';
                    //change = '<font style="color:red">- ' + Math.round(((exp*-1) / value1 * 100) * 100) / 100 + '%</font>';
                } else {
					addnew = '+ ' + Graphs.Fn.fmoney(exp);
					change = value1 > 0 ? '+ ' + Math.round((exp / value1 * 100) * 100) / 100 + '%' : '+100%';
                    //addnew = '<font style="color:green">+ ' + exp + '</font>';
                    //change = '<font style="color:green">+ ' + Math.round((exp / value1 * 100) * 100) / 100 + '%</font>';
                }                                               
                
                html += '<tr>';
                html += '<td><font style="color:'+color+'">'+bname+'<br/>'+mname+'</font></td>';
                html += '<td class="agr">'+ Graphs.Fn.fmoney(value1) +'</td>';
                html += '<td class="agr">'+ Graphs.Fn.fmoney(value2) +'</td>';
                html += '<td class="agr">'+ addnew +'</td>';
                html += '<td class="agr">'+change+'</td>';
                html += '<td class="agr">'+ Graphs.Fn.fmoney(total) +'</td>';
                html += '<td class="agr">'+ lastUpdate +'</td>';
                html += '</tr>';
            }
            return html;
        })(chartids);
        
        el.html(html);       
    }
});

/*
 * 绘图控制视图
 */
Graphs.Views.Chart = Backbone.View.extend({
    CacheData: [], //缓存数据           
    processedData: [],
	
	DataType: 'new',
	ShowType: 'abs',
    
    DrawData: null, //当前的曲线数据
    
    El: '.graphs-brand-list',
    
    Chart: null,
    
    ChartIndex: 0, 
    
    MaxLength: 6, //曲线最大个数
        
    //颜色
    Colors: ['#ACB943', '#9044BB', '#BA7530', '#BB4458', '#43B97B', '#448FBB'],
    
    getEl: function(){
        return $(this.El);
    },    
    
    initialize: function() {
		// 设置容器默认宽度		
		$(document).ready(function(){
			var width = $(document.body).width();
			$('#graphs-boxer').width(width - 200 - 40);
		});
		
		this.initChart();
        this.initView();
		
		var timer, klass=this;
		// 调整浏览器大小
		$(window).resize(function(){
			try{
            	clearTimeout(timer);
            } catch(e) {
                //
            }	
			
			// 设置容器宽度和曲线宽度
			timer = setTimeout(function(){
				var width = $(document.body).width(), minWidth=1280;
				if(width > minWidth) {
					var newWidth = width - 200 - 40;
					$('#graphs-boxer').width(newWidth);					
					if(typeof klass.Chart != 'undefined') {
						//klass.Chart.setWidth(newWidth);
						klass.loadingView(true);  
						klass.Chart.drawRun();
						klass.loadingView(false);
					}
				}
			}, 800);
		});	
		
		// 数据类型
		var $typeEl_1 = $('#graphs-chart-menu').find('.datatype1'),
			$typeEl_2 = $('#graphs-chart-menu').find('.datatype2');
		
		$typeEl_1.click(function(){
			$typeEl_1.removeClass('active');
			var $this = $(this);
			$this.addClass('active');
			klass.setDataType($this.attr('value'));
		});	
		
		$typeEl_2.click(function(){
			$typeEl_2.removeClass('active');
			var $this = $(this);
			$this.addClass('active');
			klass.setShowType($this.attr('value'));
		});       
    },
	
    initChart: function() {
        this.Chart = new Graphs.Views.ChartDraw;
    },
    initView: function(){
        $('#graphs-chart-body').empty();
        this.loadingView(false);		
    },
    resetData: function(){        
        this.CacheData = [];
        this.processedData = [];
    },
    
	// 设置数据类型
	setDataType: function(type) {
		var types = ['new', 'total'];
		if($.inArray(type, types) !== -1) {
			this.DataType = type;	
			// 刷新画板
			this.loadingView(true);
			this.refreshPlan();
		}		
	},
	// 设置显示类型
	setShowType: function(type) {
		var types = ['abs', 'change'];
		if($.inArray(type, types) !== -1) {
			this.ShowType = type;
			this.Chart.setShowType(this.ShowType);	
		}		
	},
    /*
     * 获取一个颜色
     */
    getOneColor: function() {
        return this.Colors.pop();
    },
    
    /*
     * 回传颜色
     */
    pushColor: function(color){
        this.Colors.push(color);
    },
    
    /*
     * 获取最大曲线数目
     */
    getMaxLength : function() {
        return this.MaxLength;
    },
    
    /*
     * 生成一个曲线ID
     */
    makeChartID: function() {
        this.ChartIndex++;
        return this.ChartIndex;
    },
    
    /*
     * 通过品牌ID获取颜色
     */
    getColorByBId: function(BID){
        
    },
    
    /*
     * loading层
     */
    loadingView: function(show) {
        var cssname='graphs-chart-loading',
            el = $('#graphs-chart-body');
        
        var loading = el.find('.' + cssname);
        if(!loading[0]) {
            el.append('<span class='+cssname+'></span>');
            loading = el.find('.' + cssname);
        }
        if(show) {                                    
            loading.show();
        } else {
            el.find('.'+cssname).hide();
        }
    },
	
    /* 
     * 根据曲线 Chart ID 加载数据
     * @param chartids Array 
     */
    loadData: function(chartids) {
        if(!chartids || chartids.length == 0) return false;
        
        var BID = [], MID = [];
        var i,len, chartid, bid, mid;
        for(i=0,len=chartids.length; i<len; i++){
            chartid = chartids[i];
            bid = this.getBIdByChartId(chartid);
            mid = this.getMIdByChartId(chartid);
            
            if(bid == 0 || mid == 0) continue;
            BID.push(bid);
            MID.push(mid);
        }
        
        if(BID.length == 0 || MID.length == 0) return false;
        
		//loading
		this.loadingView(true);
		
        var klass = this, opt = {}, startDate, endDate;
        startDate = this.getStartDate();
        endDate = this.getEndDate();    
        
        opt.api = Graphs.API.GetBrandData;
        opt.data = {
            brandIDs: BID.join(','), 
            metricsIDs: MID.join(','),  
            BeginDate: startDate,
            EndDate: endDate         
        };                
        opt.callback = function(json) {
        	
            //设置开始和结束日期
            json.StartDate = startDate;
            json.EndDate = endDate;   
            
            //加入缓存
            klass.CacheData.push(json);
            
            var pData;          
            for(i=0, len=chartids.length; i<len; i++){
                pData = klass.processDataById(chartids[i]);                                
                if(!pData) continue;
                klass.processedData.push(pData);
            }                                        
            klass.refreshPlan();
        };        
        Graphs.Global.LoadData(opt);
    },    
    
    /*
     * 自动加载曲线
     */
    autoLoad: function() {
        var chartIds = [], el = this.getEl().find('li.brand-list-li');
        el.each(function(){
            id = $(this).attr('chartid');
            if(typeof id != 'undefined') chartIds.push(id);
        });
        
        if(chartIds.length < 1) {
            this.resetData();
            this.initView();
            return;
        }
        
        //清空当前数据
        this.processedData = [];
        
        var pData, loadIds = [], chartid, i, len;
        for (i=0, len=chartIds.length; i<len; i++){
            chartid = chartIds[i];
            pData = this.processDataById(chartid);
            if (!pData) loadIds.push(chartid);
            else this.processedData.push(pData);
        }
                
        if (loadIds.length > 0){ //需要加载数据        	
            this.loadData(loadIds);
        } else {
        	this.refreshPlan();
        }
    },
    
    /*
     * 根据Chart ID 返回处理过的数据
     */            
    processDataById: function(chartid) {                
        var cacheData = this.getCacheById(chartid);
        
        if (!cacheData) return false;
        return cacheData;        
    },
    
    /*
     * 根据Chart ID获取缓存数据
     */
    getCacheById: function(chartid) {
        if(this.CacheData.length < 1) return false;
        
        var bid=this.getBIdByChartId(chartid), mid=this.getMIdByChartId(chartid);
        if(!bid || !mid) return false;
        
        var cacheData;
        
        //判断是否已经生成曲线数据
        cacheData = this.hasProcessedData(chartid, bid, mid);
        if(cacheData != false) return cacheData;
        
        var color=this.getColorByChartId(chartid);
        
        var i, len, cache, hasBId, hasMId, data, pData;                
        var startTimer = this.getDateTime(this.getStartDate()), endTimer = this.getDateTime(this.getEndDate()),timer;        
        
        for(i=0,len=this.CacheData.length; i<len; i++){
            cache = this.CacheData[i];            
            timer = 0;
            
            if(typeof cache.StartDate == 'undefined' || typeof cache.EndDate == 'undefined') continue;
            
            //判断开始时间是否符合
            timer = this.getDateTime(cache.StartDate);            
            if(startTimer < timer) continue;
            
            //判断结束时间是否符合
            timer = this.getDateTime(cache.EndDate);
            if(endTimer > timer) continue;
            
            if(typeof cache.BrandMapping != 'undefined') {
				//判断是否有BID
	            hasBId = cache.BrandMapping.filter(function(el){
	                return (el.BID == bid);
	            });
	            if (hasBId.length < 1) continue;
			} else {
				continue;
			}
            
			if(typeof cache.MetricsMapping != 'undefined') {
				//判断是否有MID
	            hasMId = cache.MetricsMapping.filter(function(el){
	                return (el.MID == mid);
	            });
	            if (hasMId.length < 1) continue;
			} else {
				continue;
			}
            
            
			if(typeof cache.Data != 'undefined') {
				//判断是否有数据
	            data = cache.Data.filter(function(el){
	                return (el.BID == bid);
	            });                                    
	            if(data.length == 0) continue; 
			} else {
				continue;
			}
                                               
            pData = this.makeProcessData(mid, data[0].BData);
            cacheData = this.withData({ChartID:chartid, Color: color, BID: bid, MID: mid, Data: pData});            
            return cacheData;
            break;
        }        
        return pData;
    },
    
    /*
     * 获取开始日期
     */
    getStartDate: function(){
        return Graphs.appView.datepicker.getStartDate();
    },
    
    getEndDate: function(){
        return Graphs.appView.datepicker.getEndDate();
    },
    
    getDateTime: function(date){
        return Graphs.appView.datepicker.getDateTime(date);
    },
    
	/*
	 * 获取品牌&媒体的最后更新日期
	 */
	getLastUpdate: function(bid, mid) {
		
		if(typeof this.CacheData == 'undefined' || this.CacheData.length < 1) return '';
		
		var data = this.CacheData;
		var i, len = data.length, last, day;
		
		var lastday = '';
		for (i=0; i<len; i++) {
			last = data[i].LastDate || [];
			
			if (last.length < 1) continue;
			
			day = last.filter(function(el) {
				return (el.BID == bid && el.MID == mid);
			});
			
			if (day.length < 1) continue;
			
			lastday = day[0].LastDate;
			break;
		}
		
		return lastday;
	},
	
    /*
     * 根据 Chart ID, BID, MID 判断是否有曲线数据
     */
    hasProcessedData: function(chartid, bid, mid){    	
        var data = this.processedData.filter(function(el){
            return (el.ChartID == chartid && el.BID == bid && el.MID == mid);
        });
        
        if(data.length > 0) {        	
            return data[0];
        } else return false;
    },
        
    /*
     * 组装 曲线数据
     */
    makeProcessData: function(mid, Data) {                       
        if(!mid || Data.length < 1) return                
        
        var getValue = function(Data, MID) {
            var i, len, value=0, increase=0, m, _i, _len;
            for(i=0, len=Data.length; i<len; i++) {                
                m = Data[i].Values.filter(function(element){
                    return (element.MGID == MID);
                });                
                                    
                for(_i=0, _len=m.length; _i<_len; _i++) {
                    value += m[_i].Value || 0;
					increase += m[_i].Increase || 0;
                }
            }
            return {value: value, increase: increase};                    
        };
        
        return (function(){
            var i, len, DATA=[], data, value;
            for(i=0, len=Data.length; i<len; i++){
                data = {};
                data.date = Data[i].Date;
                value = getValue(Data[i].Values, mid);
				data.value = value.value || 0;
				data.increase = value.increase || 0;							
                DATA.push(data);
            }
            return DATA;
        })();        
    },
    
     /*
     *拼接数据
     */
    withData: function(options) {
        var data = {};
        
        var defaults = {
            Color : '',
            ChartID: 0,
            BID: 0,
            MID: 0,
            Data: []
        }
        
        data = _.extend(defaults, options);
        return data;
    },        
    
    //通过曲线ID获取对应的EL
    getElByChartId: function(chartid){
        var el = this.getEl().find('li.brand-list-li[chartid='+chartid+']');
        return el;
    },
    
    //通过品牌ID获取对应的EL
    getElByBId: function(bid){
        var el = this.getEl().find('li.brand-list-li[brandid='+bid+']');
        return el;
    },
    
    //通过曲线ID获取品牌ID
    getBIdByChartId: function(chartid) {
        var el = this.getElByChartId(chartid);
        if(el[0]) return el.attr('brandid');
        else return 0;
    },
    
    //通过曲线ID获取媒体ID
    getMIdByChartId: function(chartid) {
        var el = this.getElByChartId(chartid);
        if(el[0]) return el.attr('metricsid');
        else return 0;
    },
    
    //通过曲线ID获取品牌名称
    getBrandNameByChartId: function(chartid){
        var el = this.getElByChartId(chartid);
        if (el[0]) return el.find('.brand-attrs .txt').text();
        else return '';
    },
    
    //通过曲线ID获取媒体名称
    getMetricsNameByChartId: function(chartid){
        var el = this.getElByChartId(chartid);
        if (el[0]) return el.find('.metrics-attrs .txt').text();
        else return '';
    },
    
    //通过EL获取曲线颜色
    getColorByEl: function(el){
        if(el[0]) return el.find('.brand-color').css('background-color');
        else return '#000000';
    },
    
    //通过曲线ID获取曲线颜色
    getColorByChartId: function(chartid) {
        var el  = this.getElByChartId(chartid);
        return this.getColorByEl(el);
    },
    
    //通过品牌ID获取曲线颜色
    //可能会出现多个相同的品牌ID, 只取出第一个曲线的颜色
    getColorByBId: function(bid){
        var el  = this.getElByBId(bid);
        return this.getColorByEl(el);
    },
    
    //获取当前所有品牌的ID
    getBrandIds: function() {     
        var klass = this;   
        return (function(){
            var id = [], bid, bname, data=[];
            klass.getEl().find('li.brand-list-li').each(function(){
                bid = $(this).attr('brandid'),
                bname = $(this).find('.brand-attrs span.txt').text();
                if(bid != '0' && $.inArray(bid, id) == -1) {
                    id.push(bid);
                    data.push({
                        BId: bid, 
                        BName: bname
                    });
                }
            });
            return data;
        })();                
    },
	
	// 获取当前所有的媒体ID
	getMetricsIds: function() {
		var klass = this;
		return (function(){
			var id=[], mid, mname, data = [];
			klass.getEl().find('li.brand-list-li').each(function() {
				mid = $(this).attr('metricsid');
				mname = $(this).find('.brand-metrics span.txt').text();
				
				if (mid != '0' && $.inArray(mid, id) == -1) {
					id.push(mid);
					data.push({
						MId: mid,
						MName: mname
					});
				}
			});
			
			return data;
		})();
	},
	
	// 获取品牌的HASH值
	// 品牌ID-媒体ID
	getBrandHash: function() {
		var klass = this;
		return (function(){
			var id=[], bid, bname, mid, mname, data = [];
			klass.getEl().find('li.brand-list-li').each(function() {
				bid = $(this).attr('brandid');
				bname = $(this).find('.brand-attrs span.txt').text();
				mid = $(this).attr('metricsid');			
				mname = $(this).find('.brand-metrics span.txt').text();
				
				if (mid != '0' && $.inArray(mid, id) == -1) {
					id.push(mid);
					data.push({
						MId: mid,
						MName: mname,
						BId: bid,
						BName: bname
					});
				}
			});
			
			return data;
		})();
	},
    
    //获取当前所有Chart ID
    getChartIds: function(){
        var chartids = [], el = this.getEl().find('li.brand-list-li');
        
        var id;
        el.each(function(){
            id = $(this).attr('chartid');
            if(id != undefined) chartids.push(id);
        });
        
        return chartids;
    },        
    
    /*
     * 刷新画板
     */
    refreshPlan: function() {                     
        if (this.processedData.length < 1) {                       
            this.clearPlan();
            return;
        }        
        //重新绘图
        this.draw();
        
		//close loading
		this.loadingView(false);
		
        //重新刷新媒体属性
        Graphs.appView.metricsAttr.autoLoad();
    },
    
    /*
     * 清空画板
     */
    clearPlan: function() {
        try{
            this.Chart.clear();            
        } catch(e) {
            //
        }
        
        //隐藏LOADING
        this.loadingView(false);        
    },
    
    //获取曲线数据
    getDrawData: function(chartid) {
        return this.DrawData;    
    },
    
    optDrawData: function() {           
        var days, DrawData=[], obj, data, day;
        days = Graphs.appView.datepicker.getDays();                
             
        var i,len, _i, _len=days.length, _data, _value;
        for (i=0,len=this.processedData.length; i<len; i++){
            obj = {};
            data = this.processedData[i];
			
            obj['color'] = data.Color;
            obj['chartid'] = data.ChartID;
			obj['brandid'] = data.BID;
			obj['metricsid'] = data.MID;
            for (_i=0; _i<_len; _i++){
                day = days[_i];
                _value = 0;
				//console.info(data);
				if(data.Data && data.Data.length > 0) {
					_data = data.Data.filter(function(el){
	                    return (el.date == day);
	                });
	                
	                if(_data.length > 0) {
	                    _value =  this.DataType === 'total' ? (_data[0].value || 0) : (_data[0].increase || 0);
	                }	
				}                 
                obj[day] = _value;
            }
            DrawData.push(obj);
        }
        
        return {
            Data: DrawData, 
            Days: days
        };
    },
    
    draw: function() {		
        if(this.processedData == undefined || this.processedData.length < 1) {
            this.resetData();
            this.initView();
            this.clearPlan();
            return false;
        };      
		
		//console.info(this.processedData);          
        this.DrawData = this.optDrawData();       
        //console.info(this.DrawData);   
        this.Chart.draw(this.DrawData);
    }     
});

/*
 * 绘画视图
 */
Graphs.Views.ChartDraw = Backbone.View.extend({
    TxtStyle: {'font-size': '11px', 'font-family':'Helvetica, arial', fill: '#afafaf'},
    
    r: null,
    
    Data: null,
    
    Days: 0,
    
    allValues: null,
    
    options: {
        el: 'graphs-chart-body',            
        type: 'abs',            
        width: 1080, 
        height: 280,
        lines : 5,
        leftgutter: 25, //L R T B
        rightgutter: 25,
        topgutter: 10,
        bottomgutter: 30,
        lineType: 'L',
		showType: 'abs',
    },
    
    //初始化
    initialize: function(options){               
	               
        if(options == undefined) options = {};
        _.extend(options, this.options);
        
        this.Data = [];           
		this.cloneData = [];
        this.allValues = [];
        this.Y = 0;            
    },
    
    setWidth: function(width) {		
        //this.options.width = width;        
    },
    
    setHeight: function(height) {
        this.options.height = height;
    },
	
	setShowType: function(type) {
		this.options.showType = type;
				
		// 切换百分比和数值
		this.makeData();	
		this.drawRun();
	},
    
    setData: function(Data) {        
		this.cloneData = Data.Data;
        this.Days = Data.Days;		      		
    },
    
	makeData: function() {
		if (this.cloneData.length < 1) return;
		
		this.Data =  [];
		if (this.options.showType == 'change') { // 百分比						
			var i, len, d, data, obj, value;
			var Days = this.Days, days = Days.length, _i, _value, _val;
			for (i=0, len=this.cloneData.length; i<len; i++) { 				
				data = this.cloneData[i];
				obj = {};
				obj['color'] = data['color'];
				obj['chartid'] = data['chartid'];
				value = 0;
				for(_i=0; _i<days; _i++) {
					// 取得基线
					value = value == 0 ? (data[Days[_i]] || 0) : value;
					if (_i == 0) { // 设置第一条为0%
						obj[Days[_i]] = 0;
						continue;
					}
					
					if (value < 1) { //如果基线值为0
						valle = 0;
						obj[Days[_i]] = 0;
					} else {
						_val = data[Days[_i]] || 0;
						_value = (_val - value) / value * 100;
						obj[Days[_i]] = Math.round(_value*100) / 100;
					}
				}
				
				this.Data.push(obj);
			}						
		} else { // 绝对数值	
					
			this.Data = this.cloneData;
		}		
		
		this.allValues = [];        
        this.allValues = this.allValues.concat(this.getAllValues(this.Data));
	},
	
    getDays: function() {        
        return this.Days.length;
    },
    
    //取日期的下个日期
    getNextDate: function(date, step){
        return Graphs.appView.datepicker.getNextDate(date, step);
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
    getAllValues: function(Data) {
        var A = [], i, len, data, _i, _len = this.getDays(), day;
        for (i=0, len=Data.length; i<len; i++){
            data = Data[i];
            for(_i=0; _i<_len; _i++) {
                day = this.Days[_i];
                if(typeof data[day] != 'undefined') A.push(data[day]);
            }
        }        
        return A;    
    },
    
    //Y轴数据/1000
    kNumber: function(s) {		
        var p = 'K';
        s = s/1000;
        s = Math.round(s*10)/10;
        if(s > 1000 || s*-1 > 1000) {
            s = s/1000;
            s = Math.round(s*10)/10;
            p = 'M';
        }
        s += p;
        return s;
    },
    
    draw: function(Data){       
		this.cloneData = [];
		this.Data = []; 
        this.setData(Data);     
		this.makeData();
		// 开始绘图
		this.drawRun();   	
    },	
			
	drawRun: function() {
		
		if(this.getMaxValue() == 0) return;
		
		// 设置宽度
		this.options.width = $('#'+this.options.el).width();
		this.options.height = $('#' + this.options.el).height();
		
		this.clear(); 
        this.r = Raphael(this.options.el, this.options.width, this.options.height);                                       
		        
        this.drawGrid();            
        this.drawX();            
        this.drawY();                 
        this.drawGraph();            
        this.drawDone();	
	},
    
    drawGrid: function() {
        var x=0,y=0,
            width = this.options.width,
            height = this.options.height,
            lines = this.options.lines + 1,
            lineColor = '#efefef',
            rowHeight = (this.options.height -this.options.bottomgutter - this.options.topgutter) / lines;             
                                   
            
        var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L"];
            
        for (var i = 1; i < lines; i++) {
            path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + width) + .5]);                        
        }
		
        this.r.path(path.join(",")).attr({
            stroke: lineColor
        });
    },
    
    drawX: function() {
        var txt = this.TxtStyle;
       
        var x, y = this.options.height-10, len = this.getDays();
        var maxLen = 30, space, step=1, day;
        
        space = (this.options.width - this.options.leftgutter - this.options.rightgutter) / len;
        if(len > maxLen) {
            step = (len / maxLen) < 1.5 ? 2 : 3;
        }
        var i=0;
        do {
            x = Math.round(25 + this.options.leftgutter + space*i);
            
            //if(typeof this.Days[i] == 'undefined') { //当前的日期不存在需要往后补
            //    day = this.getNextDate(this.Days[len-1], i-len);    
            //} else {
            //    day = this.Days[i];                
            //}
            
            day = this.Days[i];             
            this.r.text(x, y, day).attr(txt);
            i+=step;
        } while(i<len);
        //} while(i<len-1+step);         
    },
    
    drawY: function() {
        var txt = this.TxtStyle,
            max = this.getMaxValue(),
            min = this.getMinValue();
            
        var c = max - min;
        var s = c / (this.options.lines + 1);
        
        var i,
            lines = this.options.lines + 1, 
            lineHeight = (this.options.height - this.options.bottomgutter - this.options.topgutter) / lines;
        
        var val, value;
        for(i=1; i<lines; i++) {
			val = max - s * i;     
			value = this.options.showType == 'abs' ? (val > 1000 ? this.kNumber(val) : Math.round(val)) : Math.round(val) + '%';
            this.r.text(this.options.leftgutter, lineHeight * i, value).attr(txt);
        }
    },
    
    drawGraph: function() {
        var i,_i,
            len=this.Data.length,
            _len=this.getDays();
        var max = this.getMaxValue(),
            min = this.getMinValue();
        var X = (this.options.width - this.options.leftgutter-this.options.rightgutter) / (_len),
            Y = (this.options.height - this.options.bottomgutter - this.options.topgutter) / (max-min);
               
        var dot = [], path, p, x, y, blanket = this.r.set();
			
        for(i=0; i<len; i++) {            
            path = this.r.path().attr({
                stroke: this.Data[i].color, 
                "stroke-width": 4, 
                "stroke-linejoin": "round"
            });
           
            dot[i] = [];
            for(_i=0; _i<_len; _i++) {                
                x = Math.round(25 + this.options.leftgutter + X * _i);
                y = Math.round(this.options.height - this.options.bottomgutter - Y * (this.Data[i][this.Days[_i]]-min));

                if (_i==0) {
                    p = ["M", x, y, this.options.lineType, x, y];
                } else if(_i!=0 && _i < _len-1) {
                    p = p.concat([x,y]);
                }   
                //绘制圈
                dot[i].push(this.r.circle(x, y, 4).attr({
                    fill: this.Data[i].color, 
                    stroke: "#2a2a2a", 
                    "stroke-width": 1
                }));            
            }
                
            p = p.concat([x, y, x, y]);
            
            path.attr({
                path: p
            });                                               
        } 
		
		//绘制横向区域块
		var blan;
		for(_i=0; _i <_len; _i++) {
			blan = this.r.rect(this.options.leftgutter + X * (_i),  0,  X,  this.options.height).attr({stroke: "none", fill: "#fff", opacity: 0});								
			blanket.push(blan);			
		}		
		blanket.toFront();
		
		//事件绑定
		var klass = this, valueEl = $('.graphs-chart-value');
		
		$.each(blanket, function(i){		
			var ii, len = klass.Data.length, html, value, day, color;	
			blanket[i].hover(function(){
				html = '';				
				day = klass.Days[i] || ''; 		
				//高亮当前日期的事件		
				Graphs.appView.eventStream.lightDay(day);
				
				html += '<span class="date">'+day+'</span>';	
																				
				for(ii=0; ii<len; ii++){										
					value = 0;
					try {
						value = klass.Data[ii][klass.Days[i]];
					} catch(e) {
						//
					}
					
					if(value != 0) value = klass.options.showType == 'abs' ? (value > 0 ? '+' : '') + Graphs.Fn.fmoney(value) : (value > 0 ? ('+' + value) : value) + '%';
					color = typeof klass.Data[ii] != 'undefined' ? klass.Data[ii].color : '';			
					html += '<span style="color:'+color+'">' + value + '</span>';
					$.each(blanket,function(e){
                    	dot[ii][e].attr("r", 4);
                	});
					dot[ii][i].attr("r", 6);	
				}
																						
				valueEl.html(html).show();
								
			}, function(){
				
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
        //所有绘制完成
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

Graphs.Views.PageView = Backbone.View.extend({
	
	shareEl: $('#graphs-share'),
	downloadEl: $('#graphs-download'),
		
	initialize: function() {
		this.bindEvents();	
	},
	
	bindEvents: function() {
		var klass = this, p = {klass:klass};
		
		this.downloadEl.bind('click', p, this.downloadCSV);
		
		Graphs.Fn.cancelBubble(this.shareEl);
		this.shareEl.bind('click', p, this.share);
	},
	
	share: function(events) {

		var el = $(this), $p = el.parent('li'), dialog = $p.find('.dialog');
		
		$('.dialog').hide();
		
		dialog.show();
		
		setTimeout(function(){
			$(document.body).click(function(){dialog.hide()});
		}, 500);
	},
	
	downloadCSV: function(events) {

		var qid = Graphs.appView.DefQuickViewId || 0, el = $(this), href= el.attr('href');
		
		if(qid == 0) return false;
		
		if(href.indexOf(qid.toString()) === -1) {
			el.attr('href', href + qid);	
		}
		
		return true;
		
		/*
		var opt = {};
		opt.api = Graphs.API.DownloadCSV;
		opt.data = {quickviewID: qid};
		opt.callback = function(response) {
			//
		};
		Graphs.Global.LoadData(opt);
		*/
	}
});

/*
 * 主视图
 */
Graphs.Views.AppView = Backbone.View.extend({
	
	DefQuickViewId: 0, //默认QuickView ID        
    /*
     * 类初始化
     */
    initialize: function(){
		this.datepicker = new Graphs.Views.DatePicker;        
        this.chart = new Graphs.Views.Chart;        
        this.eventStream = new Graphs.Views.EventStream;         
        this.eventStreamType = new Graphs.Views.EventStreamType;
        this.brand = new Graphs.Views.Brand;
        this.metrics = new Graphs.Views.Metrics;
        this.opt = new Graphs.Views.OptBrand;
        this.metricsAttr = new Graphs.Views.MetricsAttr;
        
		this.quickview = new Graphs.Views.QuickView;			
		this.pageview = new Graphs.Views.PageView;
		
		this.fav = new Graphs.Views.Favorite;
    },      
	
    //重新绑定/刷新
    reBindEvents: function() {
        this.brand.bindEvents();
        this.metrics.bindEvents();    
        this.opt.bindEvents();                
    },
    
    //添加品牌
    addBrand: function() {  
        this.reloadChart();
		this.eventStream.refresh();
		
        this.reBindEvents();
    },
    
    //删除品牌
    delBrand: function() {
        this.reloadChart();
		this.eventStream.refresh();
		
        this.reBindEvents();
    },
    
    //更改品牌
    changeBrand: function() {
        this.reloadChart();
		this.eventStream.refresh();
		
        this.reBindEvents();
    },
    
    //更改媒体
    changeMetrics: function() {		
        this.reloadChart();
        this.reBindEvents();
    },    
        
    /*
     * 重新加载品牌曲线 & 实时保存数据
     */
    reloadChart: function() {
        this.chart.autoLoad();
		
		//保存数据
		if (this.DefQuickViewId != 0) {
			// 时间间隔
			var timer, klass = this;
			try {
				clearTimeout(timer);
			} catch(e) {
				//
			}

			timer = setTimeout(function() {
				var data = klass.quickview.getAddData();
				if(!data) return;
				
				data.QuickViewID = klass.DefQuickViewId;				
				//console.info(data);
				var opt = {};
				opt.type = 'post';
				opt.url = Graphs.API.UpdateQuickView;
				opt.data = data;
				opt.dataType = 'json';
				opt.success = function(response) {					
					//
				};
				$.ajax(opt);
								
			}, 1000);			
		}        
    },    
    
    /*
     * 初始化数据结构
     */
    initEmptyData: function() {
        return {
            StartDate: this.datepicker.getStartDate(),
            EndDate: this.datepicker.getEndDate(),
            Data : [{
                    BID : 0,
                    BName: '选择品牌',
                    Img: '',
                    MID: 0,
                    MName: '',
                    NID: 0,
                    NName: '选择媒体'                                       
            }]
        };
    },
	
    // 入口
	init: function() {
		var klass = this, opt = {};
		opt.api = Graphs.API.GetDefaultQuickView;
		opt.data = {};
		opt.callback = function(json) {			
			try {																											
				klass.DefQuickViewId = json.QuickViewID;	
				Graphs.Controllers.Router.navigate(klass.DefQuickViewId.toString());
			
				if (json.Data.length < 1) {
					klass.initEmptyView();
					return;
				}
							
				//启动程序				
				klass.start(json);					
			} catch(e) {
				klass.initEmptyView();	
			}					
		};
		
		Graphs.Global.LoadData(opt);				
	},
	
	saveQuickViewId: function() {
		var klass = this, opt = {};
		opt.api = Graphs.API.GetDefaultQuickView;
		opt.data = {};
		opt.callback = function(json) {			
			try {																											
				klass.DefQuickViewId = json.QuickViewID;								
			} catch(e) {
				klass.initEmptyView();	
			}					
		};		
		Graphs.Global.LoadData(opt);
	},
	
    /*
     * 初始化页面内容
     */
    initEmptyView: function() {				
        var data = this.initEmptyData();		
        this.loadView(data);
        this.reBindEvents();        
    },
        
    /*
     * 通过quick view 初始化页面   
     */
    initWithQuickView: function(id) {
        if(typeof id == 'undefined') return false;
        
		// 保存QUICK VIEW ID
		this.saveQuickViewId();
		
		var klass = this;
		
		var callback = function(json){									
			try {
				if (json.Data.length < 1) {
					klass.initEmptyView();
					return;
				}
				
				klass.start(json);
			}
			catch (e) {
				klass.initEmptyView();
			}
		};		
		
		Graphs.appView.quickview.getDataById(id, callback);		
    },

	// 启动
	start: function(obj) {
		this.loadView(obj);			
		var klass = this, bid = obj.Data[0].BID;
				
		klass.eventStream.setEventBID(bid);
		klass.eventStream.refresh();
		
		klass.reBindEvents();		
		setTimeout(function(){
			klass.reloadChart();
		}, 1000);
	},

    /*
     * 加载页面
     * @param obj => { 
     *                  StartDate => 开始日期, 
     *                  EndDate => 结束日期,                        
     *                  Data => 初始化数组 => [{BID => 品牌ID, MID => 媒体ID}]
     *                }
     */
    loadView: function(obj) {
        if (typeof obj.StartDate != 'undefined') this.datepicker.setStartDate(obj.StartDate);
        if (typeof obj.EndDate != 'undefined') this.datepicker.setEndDate(obj.EndDate);
                
        var klass=this, el = this.getBrandsViewEl(), i, len, html;                
        //生成品牌HTML;
        html = (function(obj){
            var html = '', i, len, data;
            var color, bid, bname, bimg, nid, nname, mid, mname, chartid;
            for(i=0,len=obj.Data.length; i<len; i++) {
                data = obj.Data[i];
                bid = data.BID, mid = data.MID, nid = data.NID;				
                bname = data.BName, bimg = data.Img, nname = data.NName, mname = data.MName;
                
                chartid = klass.chart.makeChartID();
                color = klass.chart.getOneColor();
                
                html += '<li class="brand-list-li" chartid="'+chartid+'" brandid="'+bid+'" networkid="'+nid+'" metricsid="'+mid+'">';
                html += '<dl>';
                html += '<dt class="brand-color" style="background-color:'+color+'"></dt>';
                html += '<dd class="brand-name">';
                html += '<div class="brand-attrs graphs-brand-name">';
                html += '<span class="img"><img src="'+bimg+'" /></span>';
                html += '<span class="txt">'+bname+'</span>';
                html += '<span class="icon_arrow"></span>';
                html += '</div>';
                html += '</dd>';
                html += '<dd class="brand-metrics">';
                html += '<div class="metrics-attrs graphs-brand-metrics">';
                html += '<span class="txt"><span class="networkTxt">'+nname +'</span>(<span class="metricsTxt">'+ mname + '</span>)</span>';
                html += '<span class="icon_arrow"></span>';
                html += '</div>';
                html += '</dd>';
                html += '<dd class="brand-opt">';
                html += '<a class="add">+</a>';
                html += '<a class="del">x</a>';
                html += '</dd>';
                html += '</dl>';
                html += '</li>';                                    
            }
            
            return html;
        })(obj);
        
        el.html(html);
        
        //保留一个品牌
        if(obj.Data.length == 1) this.saveLastBrandEl(el);     
		   
    },
    
    /*
     * 页面元素
     */
    getBrandsViewEl: function() {
        return $('#graphs-brand-list');
    },
    
    /*
     * 保留最后一个EL
     */
    saveLastBrandEl: function(el) {
        el.find('.brand-list-li').slice(0, 1).find('.brand-opt a.del').addClass('disabled');
    }        
});

/*
 * 路由转发
 */
Graphs.Controllers.Routes = Backbone.Router.extend({
    routes: {
        "": "start",
        ":query": "run"                    
    },
    
    start: function() {
        //主视图初始化		        
        Graphs.appView.init();
    },
    
    run: function(query) {					
        var id = parseInt(query);
		if(isNaN(id)) {
			Graphs.appView.init();
			return;
		}
		Graphs.appView.initWithQuickView(id);		
    }
});

Graphs.Controllers.Router = new Graphs.Controllers.Routes();

//启动基类初始化
Graphs.initialize();