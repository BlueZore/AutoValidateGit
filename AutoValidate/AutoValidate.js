/// <reference path="../Scripts/jquery-1.4.1-vsdoc.js" />

//验证方法 v2.1，   徐松涛 制
//1修改文件中事处理方式（委托事件处理），支持动态添加验证信息
//2添加vbla做为下拉框对比辅助值
//3添加非Click事件也能执行验证方法
//4添加对话框提示
//5密码验证从账号验证中独立
//6disabled过滤验证

//暂时不支持启动自定义验证
//vfun="***"必填 格式验证    
//vfun="n***"选填 格式验证     
//verr="***"错误显示内容
//vapp="y"用<span>追加提示信息，要用y以外字母得修改同级一组验证，同级一组的标签可以在第一个标签进行vapp="y"属性标识，其它不用
//vlen="***"长度限制，用于textarea标签
//vrig="***"验证正解显示vrig中内容
//vbtn="y"表单提交标签
//vgro="***" 分组验证，“***”组名称
//vpwd="y"新密码
//vrepwd="y"确认新密码
//vex="***"扩展验证方法
//vbla="***"vbla做为下拉框对比辅助值，如"请选择选项"是未选中错误，那通过vbla="0"0则是未选中
//vadj="***"启动自定义验证，按星中验证格式走
//valert="y"验证提示带对话框，是针对提交按钮使用（错误信息载体 tabMan.AlertError）
//vmin="20"文本内容最小长度
//<input id="***" type="text" vld="***" verr="***" vapp="y" vlen="***" vrig="***"/>

document.write("<link href=\"/Scripts/AutoValidate/AutoValidate.css\" rel=\"stylesheet\" type=\"text/css\" />");

$(function () {

    tabMan = {};
    tabMan.Fun = "vfun";
    tabMan.Err = "verr";
    tabMan.Append = "vapp";
    tabMan.Len = "vlen";
    tabMan.Right = "vrig";
    tabMan.Button = "vbtn";
    tabMan.Group = "vgro";
    tabMan.Pwd = "vpwd";
    tabMan.RePwd = "vrepwd";
    tabMan.Extend = "vex";
    tabMan.Adjective = "vadj";
    tabMan.Blame = "vbla";
    tabMan.Alert = "valert";
    tabMan.Min = "vmin";
    tabMan.AlertError = "";

    //正则匿名对象
    var strRegex = {};
    //错误信息匿名对象
    var strError = {};
    //正确信息匿名对象
    var strRight = {};

    /**   参数配置 start  **/
    //非空
    strRegex.NoNull = /[^\s]+/;
    strError.NoNull = "请填写内容，如123、中国！";
    //文本最短长度
    strError.Min = "#不能少于{0}个中文字！";
    //邮箱
    strRegex.Email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    strError.Email = "请核对邮箱格式，如china@163.com！";
    //网址
    strRegex.Url = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^\"\"])*$/;
    strError.Url = "请核对网址格式，如http://www.163.com！";
    //账号
    strRegex.An = /^([a-zA-Z0-9]|[_]){6,16}$/;
    strError.An = "请核对账号格式，如china_56！";
    //密码
    strRegex.Pwd = /^([a-zA-Z0-9]|[_]){6,16}$/;
    strError.Pwd = "请核对密码格式，如china_56！";
    strError.RePwd = "请保持新密码的一致！";


    //数字
    strRegex.Math = /^\d+$/;
    strError.Math = "请核对数字格式，如1234！";
    //年龄
    strRegex.Age = /^\d{2}$/;
    strError.Age = "请核对年龄格式，10~99岁之间！";
    //邮编
    strRegex.Post = /^[1-9]\d{5}$/;
    strError.Post = "请核对邮编格式，如150001！";
    //手机
    strRegex.Mobile = /1[3|4|5|8][0-9]\d{4,8}$/;
    strError.Mobile = "请核对手机格式，如15546503251！";
    //电话
    strRegex.Phone = /^((\d{11})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})))$/;
    strError.Phone = "请核对电话格式，如15546503251！";
    //身份证
    strRegex.Card = /^(([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[X,x]))|([1-9]\d{5}[1-9]\d{1}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{3})))$/;
    strError.Card = "请核对身份证格式，如230103190001010000！";
    //金钱
    strRegex.Price = /^([1-9]\d*|0)(\.\d+)?$/;
    strError.Price = "请核对金钱格式，如99.98！";


    //日期
    strRegex.Date = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/;
    strError.Date = "请核对日期格式，如1999.9.9、1999-9-9、1999.09.09！";
    //时间
    strRegex.Time = /^([0-9]|[0-1][0-9]|[2][0-3])(:|：)([0-5][0-9])$/;
    strError.Time = "请核对时间格式，如23：59！";

    strError.Length = "请核对输入信息长度，长度小于";

    strRight.Info = "恭喜您，验证合法性！"; //可以设置为空

    //下拉框
    strRegex.DDL = ""; //根据验证要求可以修改
    strError.DDL = "请选择选项";

    //单个checkbox复选框
    strRegex.Check = "请选择";
    strError.Check = "请选择选项";

    //单个radio复选框
    strRegex.Radio = "请选择";
    strError.Radio = "请选择选项";

    //同级一组checkbox复选框
    strRegex.CheckGroup = "请选择";
    strError.CheckGroup = "请选择选项";
    //同级一组服务器checkbox复选框
    strRegex.ServerCheckGroup = "请选择";
    strError.ServerCheckGroup = "请选择选项";

    //同级一组radio复选框
    strRegex.RadioGroup = "请选择";
    strError.RadioGroup = "请选择选项";
    //同级一组服务器radio复选框
    strRegex.ServerRadioGroup = "请选择";
    strError.ServerRadioGroup = "请选择选项";


    //系统配置
    strError.E401 = "验证配置信息缺少！";

    //在标签后面追加信息
    var SpanError = "<span class='vldSpanErr'></span>";

    var SpanOk = "<span class='vldSpanRig'></span>";

    /**   参数配置 end  **/


    /**  Main   **/
    //文件目录，回返最顶级目录 ../
    function FilePath() {
        var file = "";
        var path = window.location.pathname.split('/');
        $(path).each(function () {
            file = "../" + file;
        });
        return file;
    }

    //页验证自检
    $("#form1 [" + tabMan.Fun + "]").live("blur", function () {
        RegexExe($(this).removeClass("sel"));
    });

    //针对checkboxlist,radioboxlist服务端控件下的input验证
    $("#form1 [" + tabMan.Fun + "]").find("input").live("blur", function () {
        RegexExe($(this).removeClass("sel").parent());
    });

    //点击标签去除错误样式
    $("#form1 [" + tabMan.Fun + "]").live("click", function () {
        ErrorWipcOff($(this), $(this).parent());
    });

    //针对checkboxlist,radioboxlist服务端控件点击标签去除错误样式
    $("#form1 [" + tabMan.Fun + "]").find("input").live("click", function () {
        ErrorWipcOff($(this), $(this).parent().parent());
    });

    //去除错误样式处理
    function ErrorWipcOff($ctrl, $parent) {
        //        $parent.find(".vldSpanRig").remove();
        //        $parent.find(".vldSpanErr").remove();
        $ctrl.removeClass("error");
        if ($ctrl.is(":input")) {
            $ctrl.addClass("sel");
        }
    }

    //验证处理
    function RegexExe($ctrl) {
        //检查控件是否存在disabled属性
        if (!$ctrl.attr("disabled")) {
            RegexGether($ctrl);
            if ($ctrl.attr("class").indexOf("error") < 0 && $ctrl.parent().find(".vldSpanErr").length == 0 && $ctrl.attr(tabMan.Extend)) {
                RegexExtend($ctrl);
            }
        }
    }

    //验证处理集合
    function RegexGether($ctrl) {
        switch ($ctrl.attr(tabMan.Fun)) {
            case "nonull":
                RegexNull($ctrl);
                break;
            case "null": //针对多行文本框内容长度而设
                RegexLen($ctrl);
                break;
            case "age":
                RegexInputTextAll($ctrl, strRegex.Age, strError.Age);
                break;
            case "nage":
                RegexInputTextOnly($ctrl, strRegex.Age, strError.Age);
                break;
            case "date":
                RegexInputTextAll($ctrl, strRegex.Date, strError.Date);
                break;
            case "ndate":
                RegexInputTextOnly($ctrl, strRegex.Date, strError.Date);
                break;
            case "price":
                RegexInputTextAll($ctrl, strRegex.Price, strError.Price);
                break;
            case "nprice":
                RegexInputTextOnly($ctrl, strRegex.Price, strError.Price);
                break;
            case "email":
                RegexInputTextAll($ctrl, strRegex.Email, strError.Email);
                break;
            case "nemail":
                RegexInputTextOnly($ctrl, strRegex.Email, strError.Email);
                break;
            case "post":
                RegexInputTextAll($ctrl, strRegex.Post, strError.Post);
                break;
            case "npost":
                RegexInputTextOnly($ctrl, strRegex.Post, strError.Post);
                break;
            case "card":
                RegexInputTextAll($ctrl, strRegex.Card, strError.Card);
                break;
            case "ncard":
                RegexInputTextOnly($ctrl, strRegex.Card, strError.Card);
                break;
            case "time":
                RegexInputTextAll($ctrl, strRegex.Time, strError.Time);
                break;
            case "ntime":
                RegexInputTextOnly($ctrl, strRegex.Time, strError.Time);
                break;
            case "math":
                RegexInputTextAll($ctrl, strRegex.Math, strError.Math);
                break;
            case "nmath":
                RegexInputTextOnly($ctrl, strRegex.Math, strError.Math);
                break;
            case "url":
                RegexInputTextAll($ctrl, strRegex.Url, strError.Url);
                break;
            case "nurl":
                RegexInputTextOnly($ctrl, strRegex.Url, strError.Url);
                break;
            case "an":
                RegexInputTextAll($ctrl, strRegex.An, strError.An);
                break;
            case "nan":
                RegexInputTextOnly($ctrl, strRegex.An, strError.An);
                break;
            case "pwd":
                RegexInputTextAll($ctrl, strRegex.Pwd, strError.Pwd);
                break;
            case "mobile":
                RegexInputTextAll($ctrl, strRegex.Mobile, strError.Mobile);
                break;
            case "nmobile":
                RegexInputTextOnly($ctrl, strRegex.Mobile, strError.Mobile);
                break;
            case "phone":
                RegexInputTextAll($ctrl, strRegex.Phone, strError.Phone);
                break;
            case "nphone":
                RegexInputTextOnly($ctrl, strRegex.Phone, strError.Phone);
                break;
            case "ddl":
                RegexSelect($ctrl);
                break;
            case "check":
                RegexInputCheckBoxRadioOnly($ctrl, strError.Check);
                break;
            case "radio":
                RegexInputCheckBoxRadioOnly($ctrl, strError.Radio);
                break;
            case "checkgroup":
                RegexInputCheckBoxRadioAll($ctrl, strError.CheckGroup);
                break;
            case "radiogroup":
                RegexInputCheckBoxRadioAll($ctrl, strError.RadioGroup);
                break;
            case "servercheckgroup":
                RegexServerCheckBoxRadioAll($ctrl, strError.ServerCheckGroup);
                break;
            case "serverradiogroup":
                RegexServerCheckBoxRadioAll($ctrl, strError.ServerCheckGroup);
                break;
            case "adj": //自定义
                RegexAdj($ctrl);
                break;
        }
    }

    //验证扩展处理集合
    function RegexExtend($ctrl) {
        switch ($ctrl.attr(tabMan.Extend)) {
            case "findname":
                CheckName($ctrl);
                break;
        }
    }

    //标签内容空验证   
    function RegexNull($ctrl) {
        if (strRegex.NoNull.test($ctrl.val())) {
            return RegexLen($ctrl);
        }
        else {
            Error($ctrl, strError.NoNull);
            return false;
        }
    }

    //验证多个同级一组input(type=radio)标签 或 input(type=checkbox)标签
    function RegexInputCheckBoxRadioAll($ctrl, error) {
        if ($ctrl.parent().children(":checked").length == 0) {
            if ($ctrl.parent().children().attr(tabMan.Append)) {
                //同级标签中可能会有多个tabMan.Append存在，只取一个，用return false;控制，执行一次就从循环体中跳出
                $ctrl.parent().children("[" + tabMan.Append + "='y']").each(function () {
                    Error($(this), error);
                    return false;
                });
            }
            else {
                //同级一组标签一起报错
                $ctrl.parent().children("[type='" + $ctrl.attr("type") + "']").each(function () {
                    Error($(this), error);
                });
            }
            return false;
        }
        else {
            if ($ctrl.parent().children().attr(tabMan.Append)) {
                $ctrl.parent().children("[" + tabMan.Append + "='y']").each(function () {
                    Ok($(this));
                    return false;
                });
            }
            else {
                $ctrl.parent().children().each(function () {
                    Ok($(this));
                });
            }
            return true;
        }
    }

    //2011-03-07将children改为find
    //验证多个同级一组服务端input(type=radio)标签 或 input(type=checkbox)标签
    function RegexServerCheckBoxRadioAll($ctrl, error) {
        if ($ctrl.find(":checked").length == 0) {
            if ($ctrl.attr(tabMan.Append) && $ctrl.attr(tabMan.Append) == "y") {
                //同级标签中可能会有多个tabMan.Append存在，只取一个，用return false;控制，执行一次就从循环体中跳出
                Error($ctrl, error);
            }
            else {
                //同级一组标签一起报错
                $ctrl.find("[type='" + $ctrl.find("input").attr("type") + "']").each(function () {
                    Error($(this), error);
                });
            }
            return false;
        }
        else {
            if ($ctrl.attr(tabMan.Append) && $ctrl.attr(tabMan.Append) == "y") {
                Ok($ctrl);
            }
            else {
                $ctrl.find("[type='" + $ctrl.find("input").attr("type") + "']").each(function () {
                    Ok($(this));
                });
            }
            return true;
        }
    }

    //验证单个input(type=radio)标签 或 input(type=checkbox)标签
    function RegexInputCheckBoxRadioOnly($ctrl, error) {
        if (!$ctrl.attr("checked")) {
            Error($ctrl, error);
            return false;
        }
        else {
            Ok($ctrl);
            return true;
        }
    }

    //select标签，选项验证
    function RegexSelect($ctrl) {
        //查看辅助是否存在
        if ($ctrl.attr(tabMan.Blame)) {
            strRegex.DDL = $ctrl.attr(tabMan.Blame);
        }
        if ($ctrl.val() == strRegex.DDL) {
            Error($ctrl, strError.DDL);
            return false;
        }
        else {
            Ok($ctrl);
            return true;
        }
    }

    //标签允许为空内容格式验证，type=text标签验证
    function RegexInputTextOnly($ctrl, Regex, error) {
        //先验证标签是否为空
        if (strRegex.NoNull.test($ctrl.val())) {
            return RegexOtherFormat($ctrl, Regex, error);
        }
        else {
            Ok($ctrl);
            return true;
        }
    }

    //标签不允许为空内容格式验证，type=text标签验证
    function RegexInputTextAll($ctrl, Regex, error) {
        //先验证标签是否为空
        if (strRegex.NoNull.test($ctrl.val())) {
            return RegexOtherFormat($ctrl, Regex, error);
        }
        else {
            Error($ctrl, error);
            return false;
        }
    }

    //标签内容格式验证
    function RegexOtherFormat($ctrl, Regex, error) {
        if (Regex.test($ctrl.val())) {
            return RegexPwdSame($ctrl);
        }
        else {
            Error($ctrl, error);
            return false;
        }
    }

    //确认密码和新密码一致性验证
    function RegexPwdSame($ctrl) {
        if ($ctrl.attr(tabMan.RePwd)) {
            if ($("form [" + tabMan.Pwd + "=y]").length > 0) {
                if ($ctrl.val() == $("form [" + tabMan.Pwd + "=y]").val()) {
                    Ok($ctrl);
                    return true;
                }
                else {
                    Error($ctrl, strError.RePwd);
                    return false;
                }
            }
            else {
                //配置错误
                Error($ctrl, strError.E401);
                return false;
            }
        }
        else {
            return RegexLen($ctrl);
        }
    }

    //textarea标签长度验证
    function RegexLen($ctrl) {
        //标签中是否有len属性
        if ($ctrl.attr(tabMan.Len)) {
            var error = strError.Length + $ctrl.attr(tabMan.Len) + "字！";
            if (parseInt($ctrl.val().length) > parseInt($ctrl.attr(tabMan.Len))) {
                Error($ctrl, error);
                return false;
            }
        }
        return RegexInputTextMinLength($ctrl);
    }

    //标签内容长度
    function RegexInputTextMinLength($ctrl) {
        if ($ctrl.attr(tabMan.Min)) {
            if ($ctrl.val().length < $ctrl.attr(tabMan.Min)) {
                Error($ctrl, strError.Min.replace("{0}", $ctrl.attr(tabMan.Min)));
                return false;
            }
        }
        Ok($ctrl);
        return true;
    }

    //自定义验证
    function RegexAdj($ctrl) {
        //标签中是否有abj和Error属性
        if ($ctrl.attr(tabMan.Adjective)) {
            if ($ctrl.attr(tabMan.Err)) {
                return RegexOtherFormat($ctrl, $ctrl.attr(tabMan.Adjective), $ctrl.attr(tabMan.Err));
            }
        }
        Error($ctrl, strError.E401);
        return false;
    }

    //格式验证错误显示
    function Error($ctrl, error) {

        //标签中有err属性，根据属性内容填入title中，但如果error中含有#将不执行
        if (error.substring(0, 1) != "#" && $ctrl.attr(tabMan.Err)) {
            error = $ctrl.attr(tabMan.Err);
        }
        else {
            //去除#
            if (error.substring(0, 1) == "#") {
                error = error.substring(1, error.length);
            }
        }

        if ($ctrl.attr(tabMan.Append)) {
            //具有tabMan.Append属性标签追加span
            if ($ctrl.parent().find(".vldSpanRig").length > 0) {
                //有vldSpanRig样式移除标签
                $ctrl.parent().find(".vldSpanRig").remove();
            }
            if ($ctrl.parent().find(".vldSpanErr").length == 0) {
                //没有vldSpanErr样式添加vldSpanErr标签
                $ctrl.parent().append(SpanError);
                $ctrl.parent().find(".vldSpanErr").append(error);
                $ctrl.parent().find(".vldSpanErr").fadeTo("slow");
            }
        }
        else {
            //追加到title属性中
            $ctrl.attr("title", error);
            $ctrl.addClass("error");
        }
    }

    //格式验证无误，清除错误样式
    function Ok($ctrl, right) {
        //去除可以存在的错误样式
        if ($ctrl.attr(tabMan.Append)) {
            $ctrl.parent().find(".vldSpanErr").remove();
        }
        else {
            $ctrl.removeClass("error");
        }

        var rig = strRight.Info;
        //检查标签中是否有rig属性
        if (!right && $ctrl.attr(tabMan.Right)) {
            rig = $ctrl.attr(tabMan.Right);
        }
        else {
            if (right) {
                rig = right;
            }
        }

        //添加正确提示信息 2011-11-16
        if ($ctrl.attr(tabMan.Append)) {
            if ($ctrl.parent().find(".vldSpanRig").length == 0) {
                $ctrl.parent().append(SpanOk);
                $ctrl.parent().find(".vldSpanRig").append(rig);
                $ctrl.parent().find(".vldSpanRig").fadeTo("slow");
            }
        }
        else {
            $ctrl.attr("title", rig);
        }
    }

    //提交自检
    $("#form1 [" + tabMan.Button + "]").live("click", function () {
        //提交标签分组验证提交
        var groupKey = "";
        if ($(this).attr(tabMan.Group)) {
            //[vgro='xst']
            groupKey = "[" + tabMan.Group + "='" + $(this).attr(tabMan.Group) + "']";
        }

        $("#form1 [" + tabMan.Fun + "]" + groupKey).each(function () {
            RegexExe($(this));
        });

        //对话框提示错误信息
        if ($(this).attr(tabMan.Alert)) {
            //清空错误记录
            tabMan.AlertError = "";

            $("#form1 [" + tabMan.Fun + "][class*='error']" + groupKey).each(function () {
                tabMan.AlertError = tabMan.AlertError + $(this).attr("title") + "\n";
            });

            if (tabMan.AlertError != "") {
                alert(tabMan.AlertError);
            }
        }

        //检查标签中样式是否有error
        if ($("#form1 [" + tabMan.Fun + "][class*='error']" + groupKey).length > 0) {
            return false;
        }
        else {
            var i = 0;
            //检查标签中是否有SpanError
            $("#form1 [" + tabMan.Fun + "]" + groupKey + "[" + tabMan.Append + "]").each(function () {
                //.siblings同等级筛选
                if ($(this).siblings('.vldSpanErr').size() > 0) {
                    i = 1;
                    //return false只能跳出each循环，所以需要i来控件
                    return false;
                }
            });
            return i == 0;
        }
    });

    //验证方法扩展区，通过RegexExtend调用

    //例子
    function CheckName($ctrl) {
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: "/Common/Ajax.asmx/checkName",
            data: "{Name:'" + $ctrl.val() + "',ID:'" + $("#hidID").val() + "'}",
            //error: function (XMLHttpRequest, textStatus, errorThrown) {
            //    alert(XMLHttpRequest.status);
            //    alert(XMLHttpRequest.readyState);
            //    alert(XMLHttpRequest);
            //},
            //timeout: 1000, // 设置请求超时时间
            success: function (data) { // 请求成功后回调函数 参数：服务器返回数据,数据格式.
                if (data.d == "0") {
                    Ok($ctrl, "可以使用");
                }
                else {
                    Error($ctrl, "#对不起，已经被注册！");
                }
            }

        });
    }
});