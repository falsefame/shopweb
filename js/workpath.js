seajs.setProjectConfig = function(base,workpath){
    seajs.config({
        base: base,
        alias: {
            "common":workpath+"/js/common",
            "proDetail": workpath+"/js/proDetail",
            "cnlang":workpath+"/js/lang/zh"
        }
    });
}
