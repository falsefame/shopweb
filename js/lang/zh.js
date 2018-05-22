define(function(require, exports, module){
    var cnlang = {
        common:{
			ok:"确定",
			cancel:"取消",
			error:"错误",
			retry:"重试",
			serverError:"服务器响应失败！",
			serverTimeout:"服务器响应超时！",
			close:"关闭",
			account:"账号：",
			accountVerify:"关联账号验证"
		},
		proDetail:{
            batch:"起批量",
			price:"价格",
            forSell:"可售",
            lowStocks:"供货库存不足，请联系商家",
			ownProduct:"您不能购买自己的商品",
            notEnough:"购买数量不能少于起批量",
			addSuccess:"已经成功加入购物车"
        }
    }
    module.exports = cnlang;
})