Tangram plugin Validator
==========================

介绍
-----------
> 扩展了 tangram 对 form 表单的验证，支持html5属性验证，验证成功/失败事件注册，
参考 jquery tools 中的验证模块实现。简化开发人员对表单验证的流程。



Get Start
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

