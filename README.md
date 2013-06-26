Tangram plugin Validator
==========================

介绍
-----------
> 扩展了 tangram 对 form 表单的验证，支持html5属性验证，验证成功/失败事件注册，
参考 jquery tools 中的验证模块实现。简化开发人员对表单验证的流程。



Start
---------------
    *   <form action="#" style="margin:100px">
            <label for="kama">requred url </label>
            <input type="email" required="required"/>
            </br>
            <button type="submit">Submit</button>
        </form>

    *   baidu("form").validator(); 

会对 `<input>` 中 `type="email"` 和 `required="required"` 的 html5 属性进行验证，
如果验证失败会在 `<input>` 合适位置（用户可以自己定义）加入如下代码

    <div class="error" id="" style="visibility: visible; display: inline; position: absolute; top: 105px; left: 359px;">
        <p style="display: inline;">请输入正确的 E-mail 地址</p>
    </div>
同时触发相应事件

API
------------------

#### 在 `<input>` 中可以加入如下验证属性
*   `required="required"` 验证不能为空
*   `type="email"` 验证是否为email
*   `type="url"` 验证是否为url
*   `type="number"` 验证是否是number
*   `max=`   验证number最大值
*   `min=`   验证number最小值
*   `pattern=`   验证正则

#### input 中加入自定义 message
可以在input中加入 `data-message="xxxx"` 用`xxxx`替换默认输入内容

#### js 脚本事件
可以为获取的 tangramdom 对象注册事件

    api.bind("onBeforeValidate", function(e, errors) {
        console.info("BEFORE", this, arguments);
    });

    api.bind("onFail", function(e, errors) {
        console.info("FAIL", this, arguments);      
    });

支持的事件如下：
*   onBeforeValidate 在验证前触发
*   onBeforeFail 在显示错误信息前触发
*   onSuccess 在成功验证时触发
*   onFail 在验证失败后触发

DEMOS
------------------------
在`test`目录下有些demo可以供大家借鉴
*   minnal.html 一些基本的验证使用方法
*   noform.html 当没有form表单时的验证
*   onsubmit.html 在form表单提交时候验证，并监听submit事件
*   submit-auto.html 由a标签点击触发form提交，并进行验证
*   validator.html 比较综合的demo，演示了js方面的功能

WARNING
------------------
*   必须要tangram支持完整的sizzle选择器，不然ie8以下不能使用。
*   当前展示验证信息需要tangram库fx（动画）的支持，若不想用动画，则可以自定义展示验证信息
*   ie6没有测试，不一定好使，之后会支持，使用方法和api不会变
*   由于并没有产品线用过，上线前要全面测试哦（等酒店ota上线后就稳定了）

目录中的`lib/tangram.js`就可以