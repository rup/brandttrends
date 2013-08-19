$(document).ready(function () {
    $("a[href='#']").click(function (e) {
        e.preventDefault();
    });

    if ($('#front_page').size()) {

        /*slideshow*/
        $('#front_page #left').bjqs({
            'animation': 'slide',
            'width': 427,
            'height': 300,
            showControls: false,
            showMarkers: false
        });
    }

    if ($('#preview-page').size()) {

    }

    //rank
    if($('#search_page.rank').size()){

        //tabchange
        tabChange(".tabs li",".main table");

        //arrow toggle
        $("table thead tr:last th a").click(function(){
            $(this).toggleClass("down");
        });

        //button toggle
        $("table thead tr:first li a").click(function(){
            if($(this).is(".btn-gray")){
                $(".btn-white").removeClass("btn-white").addClass("btn-gray");
                $(this).addClass("btn-white");
            }else{

            }
        });
    }
    /*combox*/
    (function combox(input, list) {
        list.hide();
        input.bind("click", function () {
            list.show();
        }).bind("keypress", function () {
                return false;
            }).bind("blur", function () {
                list.animate({ "opacity": 1 }, 100).fadeOut(1);
            });
        list.find("li").click(function () {

            var key = $(this).text();

            var value = $(this).attr("value");


            input.val(key);

            $("#hidden_IndustryID").val(value);


            list.hide();
        });
    })($("#IndustryID"), $(".combox .select_list"));



});

/*
 * 清空字符串前后的空格
 */
String.prototype.Trim = function () { return this.replace(/(^\s*)|(\s*$)/g, ""); }
String.prototype.LTrim = function () { return this.replace(/(^\s*)/g, ""); }
String.prototype.RTrim = function () { return this.replace(/(\s*$)/g, ""); }
/*
 * 获取日期对象当前或以后几天的时间
 */
Date.prototype.addDays = function (number) {
    if (!isNaN(number)) {
        var nowTime = this.getTime();
        return new Date(nowTime + (number) * 24 * 60 * 60 * 1000);
    } else {
        return this;
    }
};
/*
 * 将日期对象显示成“yyyy-MM-dd”或者“yyyy/MM/dd”格式，可选分隔符范围["-","/"]
 */
Date.prototype.toDateFormatString = function (separator) {
    var year = this.getFullYear().toString();
    var month = (this.getMonth() + 1).toString();
    var date = this.getDate().toString();
    var str = year.toString() + "-" + (month.length == 1 ? "0" + month : month) + "-" + (date.length == 1 ? "0" + date : date);
    if (arguments.length == 1 && separator.toString() == "/") {
        return str.replace("-", separator);
    }
    return str;
};
/*
 * 消息提示�?
 * 需要引入的js文件�?
 * <script type="text/javascript" src="~/static/js/dialogs/artDialog.source.js?skin=blue"></script>
 * <script type="text/javascript" src="~/static/js/dialogs/artDialog_helper.js"></script>
 */
//警告消息�?icon：error、warning、succeed、question、face-sad、face-smile
function alertDialog(msg) {
    art.dialog({
        //title: "消息",
        content: msg,
        background: '#CCC',
        //cancelVal: '关闭',
        cancel: true,
        icon: "warning",
        zIndex: 9999,
        lock: true,
        close: function () {
            this.hide();
            return false;
        }
    });
}
//成功消息�?
function succDialog(msg) {
    art.dialog({
        //title: "消息",
        content: msg,
        background: '#CCC',
        //cancelVal: '关闭',
        cancel: true,
        icon: "succed",
        zIndex: 9999,
        time: 0.5,
        lock: true,
        close: function () {
            this.hide();
            return false;
        }
    });
}
//确认消息�?
//<param name="msg">消息</param>
//<param name="callback">回调函数</param>
//<param name="callbackArgs">回调函数参数</param>
function confirmDialog(msg, callback, callbackArgs) {
    art.dialog({
        //title: "消息",
        content: msg,
        background: "#CCC",
        //cancelVal: "取消",
        //okVal: "确定",
        cancel: true,
        icon: "question",
        ok: function () {
            if ($.isFunction(callback)) {
                callback(callbackArgs);
            }
        },
        zIndex: 9999,
        lock: true
    });
}
// 获取地址中的参数
function GetQuertyString(name) {
    var reg = new RegExp("(^|&|\\?)" + name + "=([^&]*)(&|$)"), r;
    if (r = window.location.href.match(reg)) { return unescape(r[2]); }
    return "";
}

// tabchange
function tabChange(title,content){
    $(content).not(":first").hide(); //Hide all content
    $(content).eq(0).show(); //Hide all content
    $(title).eq(0).addClass("curr").show(); //Activate first tab
    $(title).each(function(i) {
        $(this).click(function(e){
            $(title).removeClass("curr"); //Remove any "curr" class
            $(this).addClass("curr"); //Add "curr" class to selected tab
            $(content).hide();
            $(content).eq(i).show();
            e.preventDefault();
        });
    });
}