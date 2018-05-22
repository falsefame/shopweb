seajs.setProjectConfig = function(base,workpath){
    seajs.config({
        base: base,
        alias: {
            "common":workpath+"/js/common",
            "proDetail": workpath+"/js/proDetail",
            "lang":workpath+"/js/lang/zh"
        }
    });
}
