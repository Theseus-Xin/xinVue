'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; }
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        // debugger
        // key=>$el
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    // 初始化一个有状态的component
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers
    // set() {
    // }
    );
    var setup = Component.setup;
    if (setup) {
        // function Object
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // patch 方便后续的递归处理
    patch(vnode, container);
}
function patch(vnode, container) {
    // 去处理组件
    // 判断是不是element类型
    // 是element，处理element
    // 如何判断是element还是component
    // processElement()
    // shapeFlags
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
    var el = (vnode.el = document.createElement(type));
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    if (props) {
        for (var key in props) {
            var val = props[key];
            console.log(key);
            var isOn = function (key) { return /^on[A-Z]/.test(key); };
            if (isOn(key)) {
                var event_1 = key.slice(2).toLowerCase();
                el.addEventListener(event_1, val);
            }
            else {
                el.setAttribute(key, val);
            }
        }
    }
    container.append(el);
}
function mountChildren(children, el) {
    children.forEach(function (v) {
        patch(v, el);
    });
}
function processComponent(vnode, container) {
    // 挂在组件
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container);
    // element => mount
    initialVNode.el = subTree.el;
}

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
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
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
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
