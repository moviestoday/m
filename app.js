/**
 * Created by Bishaka on 26/02/2016.
 */

var globals={};

var calcScreenDimens = function(_opts){
    return new Promise(function(resolve,reject){
        var opts = _opts || {};
        var w = $(window).width(), h = $(window).height();
        var screenDimens = {w:w,h:h};
        opts["screenDimens"]=screenDimens;
        globals["screenDimens"]=screenDimens;
        resolve(opts);
    })
};

var calcLogoMidScreenPos = function(opts){
    return new Promise(function(resolve,reject){
        var logow = 80,
            logoh = 97,
            top = opts["screenDimens"].h/2 - logoh/2,
            left = opts["screenDimens"].w/2 - logow/2,
            logoDimens = {w:logow,h:logoh,top:top,left:left};
        ;
        opts["logoDimens"]=logoDimens;
        resolve(opts);
    })
};

var showLogoMidScreen = function(){
    return new Promise(function(resolve,reject){
        calcScreenDimens()
        .then(calcLogoMidScreenPos).then(function(opts){
            var logo = opts["logoDimens"];
            TweenMax.to($("#logo"),1,{width:logo.w,height:logo.h,top:logo.top,left:logo.left,ease: Elastic.easeOut.config(1, 0.4), y: 0 });
        })
    })
};

var loadCinemagicMovies = function(){
    return new Promise(function(resolve,reject){
        $.getJSON("http://bt-njsmoviestoday.rhcloud.com/api/v2/wscinemagic/nowshowing",function(data){
            resolve({"cinemagic_movies":data});
        })
    })
};

var loadCinemaxMovies = function(){
    return new Promise(function(resolve,reject){
        $.getJSON("http://bt-njsmoviestoday.rhcloud.com/api/v2/wscinemax/nowshowing",function(data){
            resolve({"cinemax_movies":data});
        })
    })
};

var loadCinemaLists = function(){
    return new Promise(function(lcl_resolve,lcl_reject){
        async.parallel({
            cinemax:function(cinemax_cb){
                loadCinemaxMovies().then(function(opts){
                    cinemax_cb(null,opts["cinemax_movies"])
                })
            }
        },function(err, results){
            console.log("Finished loading movie lists");
            globals["cinema_list"]=results;
            lcl_resolve(results);
        })
    })
};

var loadPoster = function(opts){
    return new Promise(function(resolve,reject){
        $.getJSON("http://bt-njsmoviestoday.rhcloud.com/api/v2/poster/"+opts["movie_title"],function(data){
            opts["poster"]=data;
            resolve(opts);
        })
    })
};

var setMenuBg = function(_opts){
    return new Promise(function(resolve,reject){
        var opts = _opts || {};
        $("#menu_bg_img").attr('src',opts["poster"]["uri"]);
        resolve(opts);
    })
};

var blurMenuBg = function(_opts){
    return new Promise(function(resolve,reject){
        var opts = _opts || {};
        var vague = $('#menu_bg_img').Vague({
            intensity:50
        }).blur();
        vague.blur();
        resolve(opts);
    })
};

var posMenuBg = function(_opts){
    return new Promise(function(resolve,reject){
        var opts = _opts || {};
        console.log("Running");
        TweenMax.to($("#logo"),0,{"z-index":2});
        TweenMax.to($("#menu_bg"),0,{width:globals["screenDimens"].w,height:globals["screenDimens"].h,top:0,left:0,"z-index":1});
        TweenMax.to($("#menu_bg_img"),0,{width:globals["screenDimens"].w,height:globals["screenDimens"].h,top:0,left:0,"z-index":1});
        TweenMax.to($("#menu_bg"),0.5,{opacity:1});
        resolve(opts);
    })
};

var showMenu = function(_opts){
    return new Promise(function(resolve,reject){
        var opts = _opts || {};
        opts["movie_title"]=globals["cinema_list"]["cinemax"][0]["title"];
        loadPoster(opts)
        .then(setMenuBg)
        .then(blurMenuBg)
        .then(posMenuBg)
        .then(function(opts){
            resolve();
        })
    })
};

$(document).ready(function(){
    showLogoMidScreen();
    loadCinemaLists()
    .then(showMenu);
    //load menu
});
