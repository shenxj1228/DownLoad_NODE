$(function() {
    var $parent = $('#divall'),
        $carry = $('.carrynews'),
        $removenews = $('.remove'),
        $removeall = $('.removeall'),
        $removeright = $('#removethispc');
    //新建
    $carry.on('click', function() {
        alert('确定新建文件夹？')
        setTimeout(
            function() {
                $parent.append('<li><input type="text" class="fname" value="新建文件夹" /></li>');
            }, 500);
    });
    //清空
    $removeall.on('click', function() {
        alert('确定清空所有文件夹？')
        setTimeout(
            function() {
                $parent.empty();

            }, 500);
    }); //新文件夹不起作用！！        

    //打开文件夹
    $parent.on('click', "li[data-filetype='folder']", function() {

        if ($(this).data('path')) {
            openfolder($(this).data('path'));
        } else {
            //alert("没有可以链接的地址");
            $(".dialog__content").empty();
            $('<h2>没有可以链接的地址</h2><div><button id="dialogClose"  class="action">Close</button></div>').appendTo($(".dialog__content"));
            $('#dialogClose').off().click(function() {
                $(this).DialogToggle({
                    'id': 'somedialog', //传入id，可以控制样式
                    'dialogFx': '0' //传入显示和隐藏的参数
                });
            });
            $(this).DialogToggle({
                'id': 'somedialog', //传入id，可以控制样式
                'dialogFx': '1' //传入显示和隐藏的参数
            });
        }
    });

    $('body').on('click', '#dialogClose', function() {
        $(".dialog__content").empty();
        $(this).DialogToggle({
            'id': 'somedialog',
            'dialogFx': '0'
        });
    });
    //下载或者添加到压缩包
    $parent.on('click', "li[data-filetype!='folder']", function(e) {
        if ($(e.target).hasClass("add_cart")) {
            if (parseInt($(e.target).parent().data('size')) < ZipMax.maxSize) {
                if ($('#file_cart>li').length < ZipMax.maxCount) {
                    addTozip(e.target);
                } else {
                    $(".dialog__content").empty();
                    $('<h2>压缩文件数不能超过<strong>' + ZipMax.maxCount + '</strong>个</h2><button id="dialogClose"  class="action"  >Close</button>').appendTo('.dialog__content');
                    $(this).DialogToggle({
                        'id': 'somedialog',
                        'dialogFx': '1'
                    });
                    //alert("压缩文件数不能超过"+ZipMax.maxCount+"个");
                }
            } else {
                alert("大于" + (ZipMax.maxSize / 1000 / 1000).toFixed(2) + "M的文件不能压缩");
            }
        } else if ($(e.target).hasClass("preview")) {
            var filetype=$(e.target).parent().data('filetype');
            $.ajax({
                url: "/files/getPreviewData?filepath=" + encodeURIComponent($(e.target).parent().data('path')) + "&filetype=" + encodeURIComponent(filetype),
                type: "GET",
                success: function(data) {
                    $(".dialog__content").empty().append('<h3>' + $(e.target).nextAll('.fname').text() + '</h3>');
                    $(".dialog__content").append('<div style="padding-bottom:2em;padding-top:1em"></div>');
                    if (filetype == 'image') {
                        var canvas = document.createElement("canvas");
                        canvas.width = 200;
                        canvas.height = 200;
                        var ctx = canvas.getContext("2d");
                        var image = new Image();
                        image.onload = function() {
                            var x = (image.width > 200) ? 0 : (200 - image.width) / 2;
                            var y = (image.height > 200) ? 0 : (200 - image.height) / 2;
                            ctx.drawImage(image, x, y);
                        };
                        image.src = data.content;
                        $(canvas).appendTo('.dialog__content>div');
                        
                    }else if(filetype == 'audio'){
                        var audio = document.createElement("audio");
                        audio.src = data.content;
                        audio.controls="controls";
                        $(audio).appendTo('.dialog__content>div');
                    }else{}
                    $('<div><a id="btndownload" target="_blank" class="action" href="/files/download?filepath=' + encodeURIComponent($(e.target).parent().data('path')) + '&idel=0" >Download</a></div><div style="margin-top:20px"><small><mark>如不能播放</mark>,是由于浏览器支持的格式不同<a href="http://www.w3school.com.cn/html5/html_5_audio.asp" target="_blank">详情</a></small></div>').appendTo('.dialog__content');
                    $(this).DialogToggle({
                        'id': 'somedialog',
                        'dialogFx': '1'
                    });

                }
            })
        } else {
            downloadfile({
                name: $(this).find("p").text(),
                path: $(this).data("path"),
                size: $(this).data('size')
            });
        }



    });
    //纯属娱乐耍耍，如需更多功能亲们自行开发...............


    $(".dialog__overlay").click(function() {
        $('.dialog__content').empty();
        $(this).DialogToggle({
            'id': 'somedialog',
            'dialogFx': '0'
        });
    });



});
String.prototype.format = function() {
    if (arguments.length == 0) return this;
    for (var s = this, i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
};


$(".scroller").scroll(function() {
    if ($('.scroller').scrollTop() > 100) {
        $("#a_top").fadeIn(200);
    } else {
        $("#a_top").fadeOut(200);
    }
});
//下载文件函数
function downloadfile(file) {
    $(".dialog__content").empty();
    $(".search-close").click();
    if (file.hasOwnProperty('name') && file.hasOwnProperty('path') && file.hasOwnProperty('size')) {
        var size = file.size;
        if (size / 1000 < 0.01) {
            size = size.toFixed(2) + "B";
        } else if (size / 1000000 >= 0.01) {
            size = (size / 1000000).toFixed(2) + "M";
        } else {
            size = (size / 1000).toFixed(2) + "K";
        }
        var content='<h2>点击<strong>Download</strong>下载<strong>' + file.name + '</strong>(' + size + ')</h2><div><a id="btndownload" target="_blank" class="action" href="/files/download?filepath=' + encodeURIComponent(file.path) + '&idel=0" \>Download</a></div>';
        $(content).appendTo($(".dialog__content"));
        $(this).DialogToggle({
            'id': 'somedialog', //传入id，可以控制样式
            'dialogFx': '1' //传入显示和隐藏的参数
        });
    }
}


//返回上级目录
$(document).on('click', "#a_back", function() {
	if($(this).attr('itop')=='0'){
		openfolder($(this).attr('filepath'));
	}else{
		alert('已经是最上层了');
	}
});

//右侧菜单按钮的事件
$("body").on('click', "#a_catalog", function() {
    $("#somedialog").removeClass().addClass("dialog");

});

$("body").on('click', "#a_search", function() {
    $("#somedialog").removeClass().addClass("dialog");
    $(".search").css("display", "");
});
$("#a_top").click(function() {
    $('.scroller').animate({
        scrollTop: 0
    }, 800);
    return false;
});

//添加到压缩包
function addTozip(add_a) {
    var flyElm = $(add_a).parent().clone().css('opacity', '0.7');
    var path = $(add_a).parent().data('path');
    var liClone=$(add_a).parent().clone();
    var status = false;
    $("#file_cart li").each(function() {
        if ($(this).data('path') == path) {
            status = true;
            return false;
        }
    });
    if (!status) {
        liClone.children('a').remove();
        var zip_li=liClone.css('display','none').prepend('<a class="del_a">*</a>');
        zip_li.appendTo('#file_cart');
    }

    flyElm.css({
        'z-index': 9000,
        'display': 'block',
        'position': 'absolute',
        'top': $(add_a).parent().offset().top + 'px',
        'left': $(add_a).parent().offset().left + 'px',
        'width': $(add_a).parent().width() + 'px',
        'height': $(add_a).parent().height() + 'px'
    });
    $('body').append(flyElm);

    flyElm.animate({
        top: $('#a_zip').offset().top,
        left: $('#a_zip').offset().left,
        width: 10,
        height: 10
    }, {
        duration: 1000,
        queue: false,
        complete: function() {
            flyElm.remove();
            $("#file_cart li").css("display", "block");
            var n = $("#file_cart li").length;
            $('.items').text(n);
            $('#d_c').text(n);
            $("#cart_container").css("display", "block");
        }
    });
};

//显示压缩包内容

$("body").on("click", "#a_zip", function() {
    $("#cart_container").fadeIn(500);
});

//隐藏压缩包内容
$("body").on("click", ".clo_x_a", function() {
    $("#cart_container").fadeOut(500);
});

//压缩包中删除一个文件

$("body").on("click", ".del_a", function() {
    $(this).parent().remove();
    var n = $("#file_cart li").length;
    $('.items').text(n);
    $('#d_c').text(n);
});
//清空压缩包
$("body").on("click", ".clear", function() {
    $("#file_cart").empty();
    $('.items').text(0);
    $('#d_c').text(0);
});
//下载压缩包
$("body").on("click", "#downloadzip_a", function() {
    var paths = "";
    if ($("#file_cart li").length == 0) {
        alert("还没有文件加入压缩包");
    } else {
        $("#file_cart li").each(function() {
            if (typeof($(this).data('path')) != "undefined") {
                paths += encodeURIComponent($(this).data('path')) + '|';
            }
        });
        paths = paths.substr(0, paths.length - 1);
        $("#file_cart").empty();
        $('.items').text(0);
        $('#d_c').text(0);
        $(".cartloader").css("display", "block");
        $.ajax({
            url: "/files/zipfiles",
            type: "POST",
            data: {
                'filepath': paths
            },
            success: function(data) {
                $(".cartloader").css("display", "none");
                $("#ifile").attr("src", "/files/download?filepath=" + data.zippath + "&idel=1");
            }
        });


    }
});

//绑定打开菜单方法到#a_catalog
new mlPushMenu(document.getElementById('mp-menu'), 'a_catalog');

//ZTREE
var setting = {
    async: {
        enable: true,
        url: "/files/getnode",
        type: "get",
        autoParam: ["filepath"],
        dataFilter: filter
    },
    data: {
        key: {
            title: "",
            name: "name"
        }
    },
    callback: {
        onClick: onClick,

    },
    view: {
        showLine: false,
        autoCancelSelected: false,
        selectedMulti: false,

    }
};

var zNodes = [{
    name: "文件夹目录",
    filepath: "",
    isParent: true
}];

var log, className = "dark";

function filter(treeId, parentNode, childNodes) {
    var getjson = childNodes;
    if (getjson.status != "success") {
        alert(getjson.content);
    } else {
        return getjson.content.folders;
    }

}

function onClick(event, treeId, treeNode, clickFlag) {
    openfolder(treeNode.filepath);
}


//ready

window.onload = function() {

    //打开根目录
    openfolder('');
    //加载树
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
    var FileNode = treeObj.getNodeByParam("name", "文件夹目录", null);
    treeObj.reAsyncChildNodes(FileNode, "refresh");

}

//查询框
var $search = $('.search'),
    $input = $('.search-input'),
    $close = $('.search-close'),
    $svg = $('.search-svg'),
    $path = $('.search-svg__path')[0],
    initD = $svg.data('init'),
    midD = $svg.data('mid'),
    finalD = $svg.data('active'),
    backDelay = 400,
    midAnim = 200,
    bigAnim = 400,
    animating = false;

$(document).on('click', '.search:not(.active)', function() {
    if (animating)
        return;
    animating = true;
    $search.addClass('active');
    Snap($path).animate({
        'path': midD
    }, midAnim, mina.backin, function() {
        Snap($path).animate({
            'path': finalD
        }, bigAnim, mina.easeinout, function() {
            $input.addClass('visible');
            $input.focus();
            $close.addClass('visible');
            animating = false;
        });
    });
});
$(document).on('click', '.search-close', function() {
    $search.css('display', 'none');
    if (animating)
        return;
    animating = true;
    $input.removeClass('visible');
    $close.removeClass('visible');
    $search.removeClass('active');
    setTimeout(function() {
        Snap($path).animate({
            'path': midD
        }, bigAnim, mina.easeinout, function() {
            Snap($path).animate({
                'path': initD
            }, midAnim, mina.easeinout, function() {
                animating = false;
            });
        });
    }, backDelay);
});
$(document).on('keydown', '#searchText', function(event) {
    var newcontent = "";
    var searchtext = $.trim($(this).val());
    if (event.keyCode == 13 && searchtext != "") {
        $(".search-close").click();
        pageload(50, 50000);
        $("#mp-pusher").addClass("mp-pushed");
        $.ajax({
            url: "/files/searchfile?strsearch=" + encodeURIComponent(searchtext),
            type: "GET",
            success: function(data) {
                var getjson = data;
                if (getjson.status != "success") {
                    alert(getjson.content);
                    
                } else {
                    $("#divall").empty();
                    if ((getjson.content.folders.length + getjson.content.files.length) == 0) {
                        $("#thisway").text("没有找到您要查找的文件！");
                    } else {
                        $("#thisway").text("共查找到" + (getjson.content.folders.length + getjson.content.files.length) + "个结果");
                    }
                    loadDivall(getjson.content);
                }
            },
            complete: function(data) {
            	pageload(100, 500);
                $("#mp-pusher").removeClass("mp-pushed");
            }

        });
    }
});



//打开文件夹函数
function openfolder(folderpath) {
    $("#divall").empty();
    pageload(80, 10000);
    $.ajax({
        url: "/files/getlist?filepath=" + encodeURIComponent(folderpath),
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        type: "GET",
        success: function(data) {
            var getjson = data;
            if (getjson.status != "success") {
                alert(getjson.content);
            } else {
                $("#rootfolder").text(getjson.rootfolder);
                $("#thisway").text((getjson.itop == '1') ? "" : getjson.currentdir);
                $("#a_back").text((getjson.itop == '1') ? "" : "返回上级目录");
                $("#a_back").attr('itop',getjson.itop).attr('filepath',getjson.upperdir);
                pageload(100,500);
                loadDivall(getjson.content);
            }
        }
    });

}

function loadDivall(content) {
    var per_li = '<li  style="background:url(images/filetype/{0}.png) 50% 30%  no-repeat;" data-filetype="{0}" data-path="{1}" title="{2}" data-size="{3}" >{4}{5}<p  class="fname" >{6}</p></li>';
    for (var i = 0; i < content.folders.length; i++) {
        var name = content.folders[i].name;
         $("#divall").append(per_li.format("folder", content.folders[i].secPath, name, "", "", "", name));
    }
    for (var j = 0; j < content.files.length; j++) {
        var filetype = content.files[j].filetype;
        var size = content.files[j].size;
        var size_title = 0,
            preview_a = '';
        var name = content.files[j].name;
        var add_a='<a class="add_cart">+</a>';
        if (size / 1000 < 0.01) {
            size_title = size + "B";
        } else if (size / 1000000 >= 0.01) {
            size_title = (size / 1000000).toFixed(2) + "M";
        } else {
            size_title = (size / 1000).toFixed(2) + "K";
        }
        if (filetype == 'image'||filetype == 'audio') {
            preview_a = '<a class="preview"></a>';
        }else {
            preview_a = '';
        }
        $("#divall").append(per_li.format(filetype, content.files[j].secPath, name+'('+size_title+')', size, preview_a,add_a, name));


    }
}
