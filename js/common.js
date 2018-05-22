define(function(require, exports, module){
   
    var PopUpBox = require("popUpBox"),
        utils = require("utils"),
		lang = require("lang"),
        $ = window.jQuery || require("jQuery");
        
    window.Alert = function(text,title,callback){
        var dialog = new PopUpBox();
        callback = callback || (typeof title == "function"?title:null) || (typeof text == "function"?text:null);
        text = typeof text == "function"?null:text;
        title = typeof title == "function"?null:title;
        dialog.open({
            html:text,
            title:title,
            btns:[{"name":lang.common.ok,"callback":function(){
                    dialog.close();
                    callback && callback();
                    }}]
        });
    };
    window.Error = function(text,title,callback){
        var dialog = new PopUpBox();
        callback = callback || (typeof title == "function"?title:null) || (typeof text == "function"?text:null);
        text = typeof text == "function"?null:text;
        title = typeof title == "function"?null:title;
        dialog.open({
            html:text || lang.common.serverError,
            title:title || lang.common.error,
            btns:[callback?{"name":lang.common.retry,"style":"background-color:#fff;color:#36c;","callback":function(){
                dialog.close();
                callback();
            }}:null,{"name":lang.common.close,"style":"background-color:#f5bd00"}]
        });
    };
    window.Confirm = function(text,title,callback){
        var dialog = new PopUpBox();
        callback = callback || (typeof title == "function"?title:null) || (typeof text == "function"?text:null);
        text = typeof text == "function"?null:text;
        title = typeof title == "function"?null:title;
        dialog.open({
            html:text,
            title:title,
            btns:[{"name":lang.common.ok,"callback":function(){
                    dialog.close();
                    callback && callback(true);
                    }},
                  {"name":lang.common.cancel,"style":"background-color:#aaa;","callback":function(){
                    dialog.close();
                    callback && callback(false);
                    }}]
        });
    };
    window.Prompt = function(text,defaultText,title,callback){
        var dialog = new PopUpBox();
        var inputid = "input"+new Date().getTime();
        var text = text + "<br/><input type='text' class='input_text' style='width:300px;' id='"+inputid+"' value='"+(defaultText?defaultText:"")+"'/>";
        dialog.open({
            title:title,
            html:text,
            btns:[{"name":lang.common.ok,"callback":function(){
                    var backvalue = document.getElementById(inputid).value;
                    dialog.close();
                    callback && callback(backvalue);
                    }},
                  {"name":lang.common.cancel,"style":"background-color:#aaa;","callback":function(){
                    dialog.close();
                    }}]
        });
    };
    window.Tip = function(text,millisec,callback){
        Tip.close && Tip.close();
        var dialog = new PopUpBox();
        if(typeof millisec == "function"){
            callback = millisec;
            millisec = 0;
        }
        dialog.open({
            titleStyle:"display:none;",
            forkStyle:"display:none;",
            htmlStyle:"padding:0 20px;text-align:center;font-size:14px;letter-spacing:2px;color:#fff;",
            dimStyle:"display:none;",
            boxStyle:"padding:0;background-color:#96af66",
            html:text,
            btns:[{"name":"","style":"display:none;"}]
        });
        Tip.close = function(){dialog.close()};
        setTimeout(function(){
            $("#"+dialog.boxId).fadeOut(function(){
                Tip.close();
                callback && callback();
            })
        },millisec || 2000);
        
    }
    window.Loading = function(text,callback){
        var dialog = new PopUpBox();
        dialog.open({
            titleStyle:"display:none;",
            forkStyle:"display:none;",
            htmlStyle:"padding:0 20px;text-align:center;font-size:14px;letter-spacing:2px;color:#fff;",
            dimBc:"#fff",
            boxStyle:"padding:0;background-color:#666",
            html:text,
            btns:[{"name":"","style":"display:none;"}]
        });
        Loading.close = function(){dialog.close()};
    }
    window.Warn = function(text,millisec,callback){
        Warn.close && Warn.close();
        var dialog = new PopUpBox();
        if(typeof millisec == "function"){
            callback = millisec;
            millisec = 0;
        }
        dialog.open({
            titleStyle:"display:none;",
            forkStyle:"display:none;",
            htmlStyle:"padding:0 20px;text-align:center;font-size:14px;letter-spacing:2px;color:#fff;",
            dimStyle:"display:none;",
            boxStyle:"padding:0;background-color:#af6666",
            html:text,
            btns:[{"name":"","style":"display:none;"}]
        });
        Warn.close = function(){dialog.close()};
        setTimeout(function(){
            $("#"+dialog.boxId).fadeOut(function(){
                Warn.close();
                callback && callback();
            })
        },millisec || 2000);
        
    }
    /*
     * params{
     *      url: 完整url地址或相对地址，如果是相对地址，那根目录默认为页面根目录
     *      type:默认post
     *      dataType:默认json,
     *      。。。所有 $.ajax 支持的参数
     *      timeout:10000,
     *      success:
     *      请求成功处理失败回掉
     *      successError:
     *      error:{
     *          message:进入error 错误提示
     *          timeout:进入error 超时提示,
     *          retry:进入error 错误提示有重试按钮，retry为按钮绑定事件
     *      }
     * }
     * 
     */
    window.Ajax = function(params){
        params.loading && Loading(params.loading)
        $.ajax($.extend({
            type:"post",
            dataType:"json"
        },params,{
            url:params.url.match(/^(https?:\/\/)?[^\/]+\//)?params.url:(utils.ROOT +params.url ),
            success:function(json){
                params.loading && Loading.close();
                if(json.resultFlag)
                    params.success && params.success(json)
                else if(params.successError)
                    params.successError(json)
                else
                    Warn(json.message)
            },
            error:function(xhr,textStatus){
                params.loading && Loading.close();
                params.error = params.error || {};
                if(params.timeout && textStatus=='timeout')
                    Error((params.error.timeout) || lang.common.serverTimeout,params.error.retry)
                else
                    Error((params.error.message) || lang.common.serverError,params.error.retry)
                
            }
        }))
    }
    window.checkLogin = function(){
        if(false){
            location.href=utils.ROOT+"/login.html?redirect="+location.href;
            return false;
        }else
            return true;
    };
    $("input:text[numOnly],textarea[numOnly]").live("focus",function(){
            var numOnly = this.getAttribute("numOnly"),
                type = "digit",decimal = 0,ctrlDown = false,tempValue = "",minus = false;
            if(numOnly && numOnly.indexOf("-")==0){
                minus = true;//允许负数
                numOnly = numOnly.substring(1);
            }
            numOnly && (isNaN(numOnly)?(type = numOnly):(decimal = Math.abs(parseInt(numOnly))));
            var defaultAllow = [8,9,17,37,39,48,49,50,51,52,53,54,55,56,57,96,97,98,99,100,101,102,103,104,105,229],//榛樿鍚堟硶杈撳叆鐨刱eycode
                ctrlDownAllow = [65,67,86,88],//鎸変笅ctrl鍚庡悎娉曡緭鍏ョ殑keycode
                as = {"１":"1","２":"2","３":"3","４":"4","５":"5","６":"6","７":"7","８":"8","９":"9","０":"0"},//全拼自动替换
                df = {paste:true,defaultAllow:defaultAllow,ctrlDownAllow:ctrlDownAllow,imeMode:"disabled"},
                contorl = {
                            "num":{
                                    reg:new RegExp("^\\d*$")
                                  },
                            "bank":{
                                    reg:new RegExp("(^(\\d{4}\\s){0,3}\\d{0,4}$)|(^(\\d{4}\\s){4}\\d{0,3}$)"),
                                    keydown:function(obj,e){
                                        if(e.keyCode == 8){
                                            /\d{4}\s\d$/.test(obj.value) && (obj.value = obj.value.substr(0,obj.value.length-1));
                                        }else{
                                            /\d{4}$/.test(obj.value) && (obj.value = obj.value+" ");
                                        }
                                    }
                                  },
                            "digit":{
                                    reg:new RegExp("^"+(minus?"-?":"")+"\\d*"+(decimal?("(\\.\\d{0,"+decimal+"})?"):"")+"$"),
                                    defaultAllow:defaultAllow.concat(decimal?[110,190]:[]).concat(minus?[189,109]:[]),
                                    blur:function(obj){
                                        obj.value!="" && (obj.value = parseFloat(obj.value));
                                    }
                             }
                         },
                after = function(obj,e){
                    if(!type["reg"].test(obj.value))
                        obj.value = tempValue;
                    else
                        tempValue = obj.value;
                    type[e.type] && type[e.type](obj,e);
                };
            if(contorl[type])
                type = $.extend(df,contorl[type]);
            else
                return;
            var paste,keydown,keyup,propertychange,blur;
            $(this).css("ime-mode",type["imeMode"])
            .bind("paste",paste = function(){return type["paste"]})
            .bind("keydown",keydown = function(e){
                if(e.keyCode==17){ctrlDown=true;return;} //ctrl
                if(e.shiftKey==1 || !(utils.in_array(e.keyCode,type["defaultAllow"],type["ctrlDownAllow"])))return false;
                after(this,e);
            })
            .bind("keyup",keyup = function(e){
                if(e.keyCode==17){ctrlDown=false;return;}
                after(this,e);
            }).bind("input propertychange",propertychange = function(e){
                var match = null;
                if(match = this.value.match(/[１２３４５６７８９０]/)){
                    this.value = this.value.replace(new RegExp(match[0]),as[match[0]]);
                }
                if(this.value && !type["reg"].test(this.value))
                    this.value = tempValue
            }).bind("blur",blur = function(e){
               /* if(e.keyCode==229){return false;}*/
                type["blur"] && type["blur"](this,e);
                $(this).unbind("paste",paste).unbind("keydown",keydown).unbind("keyup",keyup).unbind("input propertychange",propertychange).unbind("blur",blur);
            })
    })
})