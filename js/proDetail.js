define(function(require, exports, module) {
    var $ = require("jqueryPlus")
        ,utils = require("utils")
        ,lang = require("lang");
    var factory = {
        "propertyList":[],
        "prepurchase":{
            pnum:0,
            spec1:[],
            bill:{}
        },
        "appendPrice":function(){
            var minPrice = 0,
                maxPrice = 0,
                proUnit = factory.proSpec.productDetailVO.metric;
            //按购买数量报价
            if(factory.proSpec.productDetailVO.priceType === "1"){
                var $rangeTable = $("<table class='table_list'/>").append(utils.join([
                        "<tr>",
                            "<th class='tc'>"+lang.proDetail.batch+"（"+proUnit+"）</th>",
                            "<th class='tc'>"+lang.proDetail.price+"</th>",
                        "</tr>"
                    ]))
                    ,rangeNum = ""
                    ,sdiProductsPriceList = factory.proSpec.sdiProductsPriceList;
                for(var i = sdiProductsPriceList.length;i>0;i--){
                    if(i === 1){
                        rangeNum = "≥&nbsp;"+sdiProductsPriceList[i-1].startNumber;
                    }else{
                        rangeNum = sdiProductsPriceList[i-1].startNumber+"&nbsp;-&nbsp;"+(sdiProductsPriceList[i-2].startNumber-1);
                    }
                    $rangeTable.append(utils.join([
                        "<tr class='c666'>",
                            "<td>"+rangeNum+"</td>",
                            "<td>",
                                "<span class='cred mg05 f14'>$"+(sdiProductsPriceList[i-1].sellPrice / 100).toFixed(2)+"</span>",
                                "<span class='ml5 mr5'>/&nbsp;"+proUnit+"</span>",
                            "</td>",
                        "</tr>"
                    ]));
                }
                $("#priceRange").append($rangeTable);
                //按购规格报价
            }else if(factory.proSpec.productDetailVO.priceType === "3"){
                $.each(factory.proSpec.productPropertySkuBoList,function(index){
                    if(!index){
                        minPrice = this.price;
                        maxPrice = this.price;
                    }else {
                        minPrice = Math.min(minPrice,this.price);
                        maxPrice = Math.max(maxPrice,this.price);
                    }
                })
                $("#priceRange").html("<span class='f30'>$"+ (minPrice/100).toFixed(2)+"</span>"+(maxPrice>minPrice?("<span class='ml5 mr5'>—</span><span class='f30'>"+(maxPrice/100).toFixed(2)+"</span>"):"")+"<span class='c333 ml5 f16'>/&nbsp;"+proUnit+"</span>");
            }
        },
        "appendCounter":function(specData){
            factory.counterName = specData.name || "数量";
            var $tr = $("<tr/>").append(utils.join([
                    "<th>"+factory.counterName+"</th>",
                    "<td class='relative spec2'></td>"
                ])).appendTo($("#addBySpec")),
                $table = $("<table class='table_list sd_a_a_d'/>").appendTo($tr.find("td.spec2"));
            if(specData.values && specData.values.length){
                $.each(specData.values,function(index){
                    if(this.toString().length === 0)return;
                    var $tr = $("<tr/>").appendTo($table);
                    $tr.append(
                        $("<td/>").html(this.toString())
                    );
                    if(specData.stocks && specData.stocks.length){
                        $tr.append(
                            $("<td class='c999'/>").html(
                                specData.stocks[index] === undefined ?"&nbsp;":(specData.stocks[index]+factory.proSpec.productDetailVO.metric+lang.proDetail.forSell)
                            )
                        );
                    };
                    if(specData.prices && specData.prices.length){
                        $tr.append(
                            $("<td/>").html(
                                specData.prices[index] === undefined ?
                                    "&nbsp;":
                                    utils.join([
                                        "<span class='cred'>"+parseFloat(specData.prices[index]/100).toFixed(2)+"</span>",
                                        "<span class='ml5 mr5'>/</span>",
                                        "<span>"+factory.proSpec.productDetailVO.metric+"</span>"
                                    ])
                            )
                        );
                    };
                    $tr.append(
                        $("<td/>").append(factory.createSdaada(specData.name,this.toString(),specData.stocks?specData.stocks[index]:undefined))
                    );
                })
            }else{
                $table.append(
                    $("<tr class='special'/>").append(
                        $("<td/>").append(factory.createSdaada())
                    )
                );

            }
        },
        "appendSpec":function(specData){
            var $tr = $("<tr/>").append(utils.join([
                    "<th>"+specData.name+"</th>",
                    "<td class='sd_a_a_c spec1'></td>"
                ])).appendTo($("#addBySpec"));
            $.each(specData.values,function(index){
                var _this = this;
                if(this.toString().length === 0)return;
                $("<label class='"+(index === 0? 'active':'')+"'/>").html(utils.join([
                    "<a class='md'>",
                        "<span name='specValue1'>"+this.toString()+"</span>",
                    "</a>",
                    "<input type='radio' name='spec1' class='none' value='"+this.toString()+"'>"
                ])).click(function(){
                    $(this).active();
                    $spec.value = _this.toString();
                    var prefixName = utils.join($.map(factory.prepurchase.spec1,function(item){
                        return item.name+":"+item.value;
                    })," ; ");
                    $(".preNumber").each(function(){
                        this.value = factory.prepurchase.bill[prefixName+" ; "+$(this).attr("data-spec2-name")+":"+$(this).attr("data-spec2-value")] || 0;
                    }).trigger("keyup");
                }).appendTo($tr.find("td.spec1"));

            });
            var $spec = {
                name:specData.name,
                value:specData.values[0]
            }
            factory.prepurchase.spec1.push($spec);
        },
        "createSdaada":function(specName,specValue,stock){
            var $sd_a_a_d_a = $("<div class='sd_a_a_d_a'/>"),
                $minusNum = $("<a href='javascript:;' class='minusNum disabled'/>").html("-").click(function(){
                    if($(this).hasClass("disabled"))return;
                    $input.val(parseInt($input.val())-1);
                    factory.updatePrepurchase($input[0],$minusNum);
                }).appendTo($sd_a_a_d_a),
                $input = $("<input class='preNumber' numonly data-tempValue='0' data-spec2-name='"+(specName || "")+"' data-spec2-value='"+(specValue || "")+"' />").val("0").bind("keyup blur",function(e){
                    e = e || window.event;
                    var _this = this,
                        tempValue = parseInt($(this).attr("data-tempValue")),
                        validInput = function(){
                            if(_this.value.length>(parseInt(_this.value)+"").length){
                                _this.value = parseInt(utils.trim(_this.value));
                                $(_this).trigger("keyup");return;
                            }
                            var maxNum = stock === undefined?(factory.proSpec.productDetailVO.saleNumber - factory.prepurchase.pnum + tempValue):stock;
                            if(parseInt(_this.value)>maxNum){
                                _this.value = maxNum;
                                $(_this).trigger("keyup");return;
                            }else if(!_this.value.length){
                                _this.value = 0;
                                $(_this).trigger("keyup");return;
                            }
                            factory.updatePrepurchase(_this,$minusNum,$plusNum,stock);
                        };
                    if(stock === undefined && e.type === "blur"){
                        factory.getPriceByNum(validInput);
                    }else if(parseInt(_this.value) !== tempValue){
                        validInput();
                    }
                }).appendTo($sd_a_a_d_a),
                $plusNum = $("<a href='javascript:;' class='plusNum'/>").html("+").click(function(){
                    if($(this).hasClass("disabled"))return;
                    $input.val(parseInt($input.val())+1);
                    factory.updatePrepurchase($input[0],$minusNum,$plusNum,stock);
                }).appendTo($sd_a_a_d_a);
            return $sd_a_a_d_a;
        },
        "getPriceByNum":function(callback){
          $.ajax({
              url:"json/getPriceByNum",
              data:{pid:factory.pid,pnum:factory.prepurchase.pnum,productType:0},
              dataType:"json",
              success:function(json){
                $("#salenumber").html(factory.proSpec.productDetailVO.saleNumber = json.salenumber);
                if(factory.prepurchase.pnum > json.salenumber)
                    Warn(lang.proDetail.lowStocks)
                callback && callback();
              }
          })
        },
        "updatePrepurchase":function(input,$minusNum,$plusNum,stock){
            if(factory.prepurchase.spec1.length || stock !== undefined){
                if(input){
                    factory.prepurchase.bill[
                    (factory.prepurchase.spec1.length?(utils.join($.map(factory.prepurchase.spec1,function(item){
                        return item.name+":"+item.value;
                    })," ; ")+" ; "+$(input).attr("data-spec2-name")+":"):"")+$(input).attr("data-spec2-value")] = input.value;
                }
                var pnum = 0;
                utils.each(factory.prepurchase.bill,function(name){
                    pnum += parseInt(factory.prepurchase.bill[name] || 0);
                })
                factory.prepurchase.pnum = pnum;
                if(factory.prepurchase.spec1.length)
                    factory.updateBill();
            }else{
                factory.prepurchase.pnum += parseInt(input.value) - parseInt($(input).attr("data-tempValue"));
            }
            $("#totalNum").html(factory.prepurchase.pnum);

            var sellPrice = 0;
            if(stock === undefined){
                $.each(factory.proSpec.sdiProductsPriceList,function(){
                    sellPrice = Math.max(sellPrice,this.sellPrice);
                    if(factory.prepurchase.pnum >= this.startNumber && (!this.endNumber || factory.prepurchase.pnum <= this.endNumber)){
                        $("#totalPrice").html(parseFloat(factory.prepurchase.pnum*this.sellPrice/100).toFixed(2));
                        sellPrice = 0;
                        return false;
                    }
                })
                sellPrice && $("#totalPrice").html(parseFloat(factory.prepurchase.pnum*sellPrice/100).toFixed(2));
            }else{
                $.each(factory.proSpec.productPropertySkuBoList,function(){
                    if(factory.prepurchase.bill[this.propertyValues]){
                        sellPrice += factory.prepurchase.bill[this.propertyValues]*this.price;
                    }
                })
                $("#totalPrice").html(parseFloat(sellPrice/100).toFixed(2))
            }
            $(input).attr("data-tempValue",input.value);
            if(stock === undefined){
                if(factory.prepurchase.pnum < factory.proSpec.productDetailVO.saleNumber){
                    $(".plusNum").removeClass("disabled");
                }else{
                    $(".plusNum").addClass("disabled");
                }
            }else{
                if(stock > input.value){
                    $plusNum.removeClass("disabled");
                }else{
                    $plusNum.addClass("disabled");
                }
            }
            if(parseInt(input.value) === 0){
                $minusNum.addClass("disabled")
            }else{
                $minusNum.removeClass("disabled")
            }
        },
        "updateBill":function(){
            $("#bill").html(
                factory.prepurchase.pnum > 0 ?
                    utils.join([
                        "<table class='table_list'>",
                            "<tr>",
                                 utils.join($.map(factory.prepurchase.spec1,function(item){
                                     return "<th>"+item.name+"</th>";
                                 })),
                                "<th>"+factory.counterName+"</th>",
                                "<th>数量</th>",
                                "<th>操作</th>",
                            "</tr>",
                            (function(){
                                var re = "";
                                utils.each(factory.prepurchase.bill,function(name){
                                    var value = factory.prepurchase.bill[name];
                                    if(value && value > 0){
                                        re += "<tr>";
                                        utils.each(name.split(" ; "),function(){
                                            re += "<td>"+this.toString().split(":")[1]+"</td>";
                                        });
                                        re += "<td>"+factory.prepurchase.bill[name]+"</td>";
                                        re += "<td><a href='javascript:proDetail.removeBill(\""+name+"\");' class='c36c'>删除</a></td>";
                                        re += "</tr>";
                                    }
                                })
                                return re;
                            })(),
                        "</table>"
                    ]):""
            );
        },
        "removeBill":function(name){
            factory.prepurchase.bill[name] = 0;
            var prefixName = utils.join($.map(factory.prepurchase.spec1,function(item){
                return item.name+":"+item.value;
            })," ; ");
            $(".preNumber").each(function(){
                if((prefixName+" ; "+$(this).attr("data-spec2-name")+":"+$(this).attr("data-spec2-value")) === name){
                    $(this).val(0).trigger("keyup");
                    return false;
                }
            })
            factory.updatePrepurchase();
        },
        "buycheck" : function() {
            if (!checkLogin()) {
                return false;
            }
            if (factory.proSpec.userId == factory.userId) {
                Alert(lang.proDetail.ownProduct);
                return false;
            }
            return true;
        },

        "formatData" : function() {
            var data = {
                sellerId:factory.proSpec.userId,
                productId:factory.proSpec.id,
                productType:0,
                priceType:factory.proSpec.productDetailVO.priceType,
                enflag:0,
                marketCode:10,
                uuid:""
            };
            if(!utils.each(factory.prepurchase.bill,function(name){
                if(!data.newProperty){
                    data.newProperty = [];
                    data.newquantity = [];
                }
                    data.newProperty.push(name);
                    data.newProperty.push(factory.prepurchase.bill[name]);
                })){
                data.quantity = factory.prepurchase.pnum;
            }
            return data;
        },
        "addCart" : function() {
            if (!factory.buycheck()) {
                return false;
            }
            if(factory.prepurchase.pnum < factory.proSpec.productDetailVO.startNumber){
                Alert(lang.proDetail.notEnough);
                return;
            }

            /*var $active = $(".sd_a_a_c").find(".selected"), $cart = $(".cart");
            $active.each(function() {
                $("<img />").attr({
                    "src" : $(this).find("img").attr("src"),
                    "height" : 30
                }).css({
                    "position" : "absolute",
                    "left" : $(this).position().left,
                    "top" : $(this).position().top,
                    "opacity" : "0.5",
                    "filter" : "alpha(opacity=50)"
                }).appendTo($("body")).animate({
                    "left" : $cart.position().left,
                    "top" : $cart.position().top
                }, 500, function() {
                    $(this).remove();
                });
            })*/
            var data = factory.formatData();

            Ajax({
                url : "json/addCart",
                data : data,
                success : function() {
                    Tip(lang.proDetail.addSuccess);
                }
            })
        },
        "showAreas" : function(e) {
            utils.stopBubble(e || window.event, "event");
            $("#areaList").toggleClass("hide");
        },
        "preArea" : function(btn, areaId) {
            $.ajax({
                url : "json/getFreight",
                data : {
                    pid : factory.proSpec.id,
                    stateid : areaId
                },
                dataType : "json",
                success : function(result) {
                    if (result.success) {
                        $("#freightval").html(parseFloat(result.freight).toFixed(2));
                        $(btn).parent().active();
                        $("#proArea").html($(btn).html());
                        factory.showAreas();
                    } else {
                        Warn(lang.common.serverError);
                    }
                },
                error : function(xhr,textStatus) {
                    if(textStatus === "timeout"){
                        Warn(lang.common.serverTimeout)
                    }else{
                        Warn(lang.common.serverError);
                    }
                }
            })
        }
    };



    module.exports = factory;
})