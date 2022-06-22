function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};
var hasChanged = function (oldValue, newValue) {
    return !Object.is(oldValue, newValue);
};
var hasOwn = function (val, key) { return Object.prototype.hasOwnProperty.call(val, key); };
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? "on" + capitalize(str) : "";
};

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; }
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // debugger
        // key=>$el
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

var activeEffect;
var shouldTrack;
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    ReactiveEffect.prototype.run = function () {
        activeEffect = this;
        // 会收集依赖
        if (!this.active) {
            this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        var result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            // 清除依赖
            cleanupEffect(this);
            // 执行副作用
            if (this.onStop)
                this.onStop();
            // 设置为stop
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
}
var targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    var dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 已经在dep中
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    dep.forEach(function (effect) {
        if (effect.scheduler)
            effect.scheduler();
        else
            effect.run();
    });
    // for (const effect of dep) {
    //   if (effect.scheduler) effect.scheduler()
    //   else effect.run()
    // }
}
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    // fn
    var _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    // Object.assign(_effect, options)
    // extend
    extend(_effect, options);
    _effect.run();
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key == "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 检查res是不是一个object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 依赖收集
        if (!isReadonly)
            track(target, key);
        return res;
    };
}
function createSetter(isReadonly) {
    if (isReadonly === void 0) { isReadonly = false; }
    return function set(target, key, value) {
        if (isReadonly)
            return true;
        var res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("key: ".concat(key, " set \u5931\u8D25 \u56E0\u4E3A target \u662F readonly \u7684"), target);
        return true;
    }
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn("target ".concat(target, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    // instanceof.props
    var props = instance.props;
    // TPP
    // 先写一个特定行为 => 重构成通用的行为
    // add -> Add
    var handlerName = toHandlerKey(camelize(event));
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}

function initSlots(instance, children) {
    var vnode = instance.vnode;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    var _loop_1 = function (key) {
        if (Object.prototype.hasOwnProperty.call(children, key)) {
            var value_1 = children[key];
            slots[key] = function (props) { return normalizeSlotValue(value_1(props)); };
        }
    };
    for (var key in children) {
        _loop_1(key);
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this.__v_isRef = true;
        // value -> reactive
        // 看看value是不是对象
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            // 依赖收集
            trackRefValue(this);
            return this._value;
        },
        set: function (newValue) {
            // 一定是先修改
            // 对比的时候 object
            if (hasChanged(newValue, this._rawValue)) {
                this._rawValue = newValue;
                this._value = convert(newValue);
                triggerEffects(this.dep);
            }
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    // 看看是不是ref
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get: function (target, key) {
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function createComponentInstance(vnode, parent) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent,
        isMounted: false,
        subTree: {},
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 初始化一个有状态的component
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        setCurrentInstance(instance);
        // function Object
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
var currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var provides = currentInstance.provides;
        var parentProvides = currentInstance.parent.provides;
        // init
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    // 组件类型
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// import { render } from "./renderer";
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            // 本来应该接收一个string，暂时先接收一个element实例
            mount: function (rootContainer) {
                // 先vnode
                // component
                // 所有的逻辑操作，都会基于vnode 做处理
                var vnode = createVNode(rootComponent);
                // 调用patch方法
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    var hostCreateElement = options.createElement, hostPatchProp = options.patchProp, hostInsert = options.insert;
    function render(vnode, container) {
        // patch 方便后续的递归处理
        patch(null, vnode, container, null);
    }
    // n1 => old
    // n2 => new
    function patch(n1, n2, container, parentComponent) {
        // 去处理组件
        // 判断是不是element类型
        // 是element，处理element
        // 如何判断是element还是component
        // processElement()
        // shapeFlags
        var type = n2.type, shapeFlag = n2.shapeFlag;
        // Fragment -> 只渲染children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        var children = n2.children;
        var textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
        var el = (vnode.el = hostCreateElement(type));
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        if (props) {
            for (var key in props) {
                var val = props[key];
                hostPatchProp(el, key, val);
            }
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, el, parentComponent) {
        vnode.children.forEach(function (v) {
            patch(null, v, el, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        // 挂在组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        var instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(function () {
            if (!instance.isMounted) {
                console.log("init");
                var proxy = instance.proxy;
                var subTree = (instance.subTree = instance.render.call(proxy));
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, instance);
                // element => mount
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                var proxy = instance.proxy;
                var subTree = instance.render.call(proxy);
                var prevSubTree = instance.subTree;
                console.log("current", subTree);
                console.log("prevent", prevSubTree);
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        var event_1 = key.slice(2).toLowerCase();
        el.addEventListener(event_1, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.append(el);
}
var renderer = createRenderer({
    createElement: createElement,
    patchProp: patchProp,
    insert: insert
});
function createApp() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return renderer.createApp.apply(renderer, args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
