/**
 * @license 
 * jQuery Tools Validator @VERSION - HTML5 is here. Now use it.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/form/validator/
 * 
 * Since: Mar 2010
 * Date: @DATE 
 *
 * @description 移植自 jquery tools 中验证模块，去除 jquery 依赖，
 * 加入 trangram 依赖，并对各项进行翻译
 *
 * @require tangram http://tangram.baidu.com/
 * @author gaochao04
 */
(function($) {  

    //加入tools命名空间，可能会与其他命名空间重复
    $.tools = $.tools || {version: '@VERSION'};
        
    // globals
    var typeRe = /\[type=([a-z]+)\]/, 
        numRe = /^-?[0-9]*(\.[0-9]+)?$/,
        dateInput = $.tools.dateinput,
        
        // http://net.tutsplus.com/tutorials/other/8-regular-expressions-you-should-know/
        emailRe = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i,
        urlRe = /^(https?:\/\/)?[\da-z\.\-]+\.[a-z\.]{2,6}[#&+_\?\/\w \.\-=]*$/i,
        v;
         
    v = $.tools.validator = {
        
        conf: {   
            grouped: false,                 // 显示所有的错误信息值一个 container 中
            effect: 'default',          // 显示错误信息时候的效果
            errorClass: 'invalid',      // 当input验证失败时给其增加的 class
            
            // when to check for validity?
            inputEvent: null,               // 当input触发哪个事件时进行验证；可选值为： change, blur, keyup, null 
            errorInputEvent: 'keyup',  // 当已经验证失败后，input触发哪个事件后重新验证；可选值为：change, blur, keyup, null
            formEvent: 'submit',       // form表单验证事件；submit, null

            lang: 'zh',                     // 默认输出错误信息的语言
            message: '<div/>',
            messageAttr: 'data-message', // 验证失败时取数据的关键字
            messageClass: 'error',      // 渲染验证失败数据时所增加的class
            offset: [0, 0], 
            position: 'center right',
            singleError: false,             // 制定为true时，当有一个input验证失败时即返回验证结果
            speed: "normal"             // 错误信息动画持续时间
        },


        /* The Error Messages */
        messages: {
            "*": { zh: "请修改为正确的值" }        
        },
        
        localize: function(lang, messages) { 
            $.each(messages, function(key, msg)  {
                v.messages[key] = v.messages[key] || {};
                v.messages[key][lang] = msg;        
            });
        },
        
        localizeFn: function(key, messages) {
            v.messages[key] = v.messages[key] || {};
            $.extend(v.messages[key], messages);
        },
        
        /** 
         * 增加一个验证选项
         */
        fn: function(matcher, msg, fn) {
            
            // no message supplied
            if ($.isFunction(msg)) {
                fn = msg;
            } else {
                //默认增加的验证选项为中文的
                if (typeof msg == 'string') { 
                    msg = {zh: msg}; 
                }
                this.messages[matcher.key || matcher] = msg;
            }

            // 验证 type=xxx 类型的input，对此验证 matcher 为function
            var test = typeRe.exec(matcher);
            if (test) { matcher = isType(test[1]); }                
            
            // add validator to the arsenal
            fns.push([matcher, fn]);         
        },

        /* Add new show/hide effect */
        addEffect: function(name, showFn, closeFn) {
            effects[name] = [showFn, closeFn];
        }
        
    };
    
    /* 根据 input 的位置计算错误信息的位置 */    
    function getPosition(trigger, el, conf) {
    
        // Get the first element in the selector set
        el = $(el).first() || el;
        
        // get origin top/left position 
        var top = trigger.offset().top,
            left = trigger.offset().left,
            pos = conf.position.split(/,?\s+/),
            y = pos[0],
            x = pos[1];
        
        top  -= el.outerHeight() - conf.offset[0];
        left += trigger.outerWidth() + conf.offset[1];
        
        
        // iPad position fix
        if (/iPad/i.test(navigator.userAgent)) {
            top -= $(window).scrollTop();
        }
        
        // adjust Y     
        var height = el.outerHeight() + trigger.outerHeight();
        if (y == 'center')  { top += height / 2; }
        if (y == 'bottom')  { top += height; }
        
        // adjust X
        var width = trigger.outerWidth();
        if (x == 'center')  { left -= (width  + el.outerWidth()) / 2; }
        if (x == 'left')    { left -= width; }   
        
        return {top: top, left: left};
    }   
    

    
    /* $.is("[type=xxx]") or $.filter("[type=xxx]") not working in jQuery 1.3.2 or 1.4.2

        创建对 [type=xxx]  类型恩 matcher 函数
        原版的代码扩展了对type类型的查询，并不会进入此函数
    */
    function isType(type) { 
        function fn() {
            return this.getAttribute("type") == type;
        }
        //用于获取对应的msg
        fn.key = "[type=\"" + type + "\"]";
        return fn;
    }   

    /* 
     fns 为验证项的集合，
     [matcher, fn] matcher为选择器，fn为验证函数
    */
    var fns = [], effects = {
        
        'default' : [
            
            // show errors function
            function(errs) {
                
                var conf = this.getConf();
                
                // loop errors
                $.each(errs, function(i, err) {
                        
                    // add error class  
                    var input = err.input;                  
                    input.addClass(conf.errorClass);
                    
                    // get handle to the error container
                    var msg = input.data("msg.el"); 
                    
                    // create it if not present
                    if (!msg) { 
                        msg = $(conf.message).addClass(conf.messageClass).appendTo(document.body);
                        input.data("msg.el", msg);
                    }  
                    
                    // clear the container 
                    msg.css({visibility: 'hidden'}).find("span").remove();
                    
                    // populate messages
                    $.each(err.messages, function(i, m) { 
                        $("<span/>").html(m).appendTo(msg);            
                    });
                    
                    // make sure the width is not full body width so it can be positioned correctly
                    if (msg.outerWidth() == msg.parent().width()) {
                        msg.add(msg.find("span")).css({display: 'inline'});        
                    } 
                    
                    // insert into correct position (relative to the field)
                    var pos = getPosition(input, msg, conf); 
                     
                    msg.css({ visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left }).fadeIn(conf.speed);
                });
                        
                
            // hide errors function
            }, function(inputs) {

                var conf = this.getConf();              
                inputs.removeClass(conf.errorClass).each(function() {
                    var msg = $(this).data("msg.el");
                    if (msg) { msg.css({visibility: 'hidden'}); }
                });
            }
        ]  
    };

    
    /* sperial selectors 
       注释了因为 tangram 上并未对 expr  有引用，会造成报错
       注释后的影响未知
    
        $.each("email,url,number".split(","), function(i, key) {
            $.expr[':'][key] = function(el) {
                return el.getAttribute("type") === key;
            };
        });
    */
    

    /* 
        oninvalid() jQuery plugin. 
        Usage: $("input:eq(2)").oninvalid(function() { ... });
        注释了这里，因为没有必要加这个插件
        $.fn.oninvalid = function( fn ){
            return this[fn ? "on" : "trigger"]("OI", fn);
        };
    */

    
    
    /******* built-in HTML5 standard validators *********/
    /*
        这里修改了 email、url、number、radio 类型的查询方式
    
    */
    
    v.fn("[type=\"email\"]", "请输入正确的 E-mail 地址", function(el, v) {
        return !v || emailRe.test(v);
    });
    
    v.fn("[type=\"url\"]", "请输入正确的 URL 地址", function(el, v) {
        return !v || urlRe.test(v);
    });
    
    v.fn("[type=\"number\"]", "请输入数字", function(el, v) {
        return numRe.test(v);           
    });
    
    v.fn("[max]", "输入的数字不能大于 $1", function(el, v) {
        // skip empty values
        if (v === '') { return true; }   
        
        var max = el.attr("max");
        return parseFloat(v) <= parseFloat(max) ? true : [max];
    });
    
    v.fn("[min]", "输入的数字不能小于 $1", function(el, v) {
        // skip empty values and dateinputs
        if (v === '') { return true; }

        var min = el.attr("min");
        return parseFloat(v) >= parseFloat(min) ? true : [min];
    });
    
    v.fn("[required]", "请填写此处数据", function(el, v) {
        if (el.is("[type=checkbox]")) { return el.prop("checked"); }
        return !!v;             
    });
    
    v.fn("[pattern]", function(el, v) {
        return v === '' || new RegExp("^" + el.attr("pattern") + "$").test(v);
    });
    
    function Validator(inputs, form, conf) {        
        
        // private variables
        var self = this, 
            fire = form.add(self);

        // 有些input并不在验证范围内
        inputs = inputs.not("[type=reset], [type=submit]");

        // Prevent default Firefox validation
        form.attr("novalidate", "novalidate");

        // utility function
        function pushMessage(to, matcher, returnValue) {
            
            // 只有单条 msg 可以push
            if (!conf.grouped && to.length) { return; }
            
            // the error message
            var msg;
            
            //查找当前input验证失败后的tip文案
            if (returnValue === false || $.isArray(returnValue)) {
                msg = v.messages[matcher.key || matcher] || v.messages["*"];
                msg = msg[conf.lang] || v.messages["*"].zh;

                // 替换变量 如 max=5 将替换 $1
                var matches = msg.match(/\$\d/g);
                if (matches && $.isArray(returnValue)) {
                    $.each(matches, function(i) {
                        msg = msg.replace(this, returnValue[i]);
                    });
                }
            // 直接返回错误信息的情况
            } else {
                msg = returnValue[conf.lang] || returnValue;
            }
            
            to.push(msg);
        }
        
        
        // API methods  
        $.extend(self, {

            getConf: function() {
                return conf;    
            },
            
            getForm: function() {
                return form;        
            },
            
            getInputs: function() {
                return inputs;  
            },      
            
            reflow: function() {
                inputs.each(function()  {
                    var input = $(this),
                         msg = input.data("msg.el");
                         
                    if (msg) {                      
                        var pos = getPosition(input, msg, conf);
                        msg.css({ top: pos.top, left: pos.left });
                    }
                });
                return self;
            },
            
            /* @param e - for internal use only */
            invalidate: function(errs, e) {
                
                // errors are given manually: { fieldName1: 'message1', fieldName2: 'message2' }
                if (!e) {
                    var errors = [];
                    $.each(errs, function(key, val) {
                        var input = inputs.filter("[name='" + key + "']");
                        if (input.length) {
                            
                            // trigger HTML5 ininvalid event
                            input.trigger("OI", [val]);
                            
                            errors.push({ input: input, messages: [val]});              
                        }
                    });

                    errs = errors; 
                    //代替 $.event()
                    e = {};
                }
                
                // onFail callback
                e.type = "onFail";                  
                fire.trigger("onFail", [errs]); 
                
                // call the effect
                effects[conf.effect][0].call(self, errs, e);                                                    
                
                return self;
            },
            
            reset: function(els) {
                els = els || inputs;
                els.removeClass(conf.errorClass).each(function()  {
                    var msg = $(this).data("msg.el");
                    if (msg) {
                        msg.remove();
                        $(this).data("msg.el", null);
                    }
                }).off(conf.errorInputEvent || '');
                return self;
            },
            
            destroy: function() { 
                form.off(conf.formEvent + "reset"); 
                inputs.off(conf.inputEvent + "change");
                return self.reset();    
            }, 
                                    
            /* @returns boolean */
            checkValidity: function(els, e) {
                
                els = els || inputs;    
                els = els.not("[disabled]");

                if (!els.length) { return true; }

                //代替 $.event()
                e = e || {};

                // onBeforeValidate
                e.type = "onBeforeValidate";
                fire.trigger("onBeforeValidate", [els]);             
                    
                // container for errors
                var errs = [];
 
                // loop trough the inputs
                els.each(function() {
                        
                    // field and it's error message container                       
                    var msgs = [], 
                         el = $(this).data("messages", msgs),
                         event = dateInput && el.is(":date") ? "onHide" : conf.errorInputEvent;                    
                    
                    // cleanup previous validation event
                    el.off(event);
                    
                    
                    // loop all validator functions
                    $.each(fns, function() {
                        var fn = this, match = fn[0]; 
                    
                        // match found
                        if (el.filter(match).length)  {  
                            
                            // execute a validator function
                            var returnValue = fn[1].call(self, el, el.val());
                            
                            
                            // validation failed. multiple substitutions can be returned with an array
                            if (returnValue !== true) {                             
                                
                                // onBeforeFail
                                e.type = "onBeforeFail";
                                fire.trigger("onBeforeFail", [el, match]);
                                
                                // overridden custom message
                                var msg = el.attr(conf.messageAttr);
                                if (msg) { 
                                    msgs = [msg];
                                    return false;
                                } else {
                                    pushMessage(msgs, match, returnValue);
                                }
                            }                           
                        }
                    });
                    
                    if (msgs.length) { 
                        
                        errs.push({input: el, messages: msgs});  
                        
                        // trigger HTML5 ininvalid event
                        el.trigger("OI", [msgs]);
                        
                        // begin validating upon error event type (such as keyup) 
                        if (conf.errorInputEvent) {                         
                            el.on(event, function(e) {
                                self.checkValidity(el, e);      
                            });                         
                        }                   
                    }
                    
                    if (conf.singleError && errs.length) { return false; }
                    
                });
                
                
                // validation done. now check that we have a proper effect at hand
                var eff = effects[conf.effect];
                if (!eff) { throw "Validator: cannot find effect \"" + conf.effect + "\""; }
                
                // errors found
                if (errs.length) {                   
                    self.invalidate(errs, e); 
                    return false;
                    
                // no errors
                } else {
                    
                    // call the effect
                    eff[1].call(self, els, e);
                    
                    // onSuccess callback
                    e.type = "onSuccess";                   
                    fire.trigger("onSuccess", [els]);
                    
                    els.off(conf.errorInputEvent);
                }
                
                return true;                
            }
//}}} 
            
        });
        
        // callbacks    
        $.each("onBeforeValidate,onBeforeFail,onFail,onSuccess".split(","), function(i, name) {
                
            // configuration
            if ($.isFunction(conf[name]))  {
                $(self).on(name, conf[name]);   
            }
            
            // API methods              
            self[name] = function(fn) {
                if (fn) { $(self).on(name, fn); }
                return self;
            };
        }); 
        
        
        // form validation
        if (conf.formEvent) {
            form.on(conf.formEvent, function(e) {
                if (!self.checkValidity(null, e)) { 
                    return e.preventDefault(); 
                }
                // Reset event type and target
                e.target = form;
                e.type = conf.formEvent;
            });
        }
        
        // form reset
        form.on("reset", function()  {
            self.reset();           
        });
        
        // disable browser's default validation mechanism
        if (inputs[0] && inputs[0].validity) {
            inputs.each(function()  {
                this.oninvalid = function() { 
                    return false; 
                };      
            });
        }
        
        // Web Forms 2.0 compatibility
        if (form[0]) {
            form[0].checkValidity = self.checkValidity;
        }
        
        // input validation               
        if (conf.inputEvent) {
            inputs.on(conf.inputEvent, function(e) {
                self.checkValidity($(this), e);
            }); 
        } 
    
        // checkboxes and selects are checked separately
        inputs.filter("[type=checkbox], [type=select]").filter("[required]").on("change", function(e) {
            var el = $(this);
            if (this.checked || (el.is("[type=select]") && $(this).val())) {
                effects[conf.effect][1].call(self, el, e); 
            }
        });

        // get radio groups by name
        inputs.filter("radio[required]").on("change", function(e) {          
            var els = $("[name='" + $(e.srcElement).attr("name") + "']");
            if ((els != null) && (els.length != 0)) {
                self.checkValidity(els, e);
            }
        });
        
        // reposition tooltips when window is resized
        $(window).resize(function() {
            self.reflow();      
        });
        
    }

    
    // 将jquery插件加入方法改为tangram自己的插件机制
    $.plugin("dom",  {
        validator: function(conf) { 
            var instance = this.data("validator");
            
            // destroy existing instance
            if (instance) { 
                instance.destroy();
                this.removeData("validator");
            } 
            
            // configuration
            conf = $.extend(true, {}, v.conf, conf);        
            
            // selector is a form       
            if (this.is("form")) {
                return this.each(function() {           
                    var form = $(this); 
                    instance = new Validator(form.find("input"), form, conf);   
                    form.data("validator", instance);
                });
                
            } else {
                instance = new Validator(this, this.eq(0).closest("form"), conf);
                return this.data("validator", instance);
            }
        }
    });
        
})(baidu);
