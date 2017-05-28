/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 15.7.0
 */
Bridge.assembly("ReactTodo", function ($asm, globals) {
    "use strict";

    Bridge.define("ReactTodo.MessageEcho.State", {
        config: {
            properties: {
                TextInput: null
            }
        }
    });

    Bridge.define("ReactTodo.MessageEcho.Props", {
        config: {
            properties: {
                OnAdded: null
            }
        }
    });

    Bridge.define("ReactTodo.MessageLogger.State", {
        config: {
            properties: {
                Messages: null
            }
        }
    });

    Bridge.define("ReactTodo.MessageLogger.Props");

    Bridge.define("ReactTodo.Program", {
        statics: {
            view: function (name) {
                return React.DOM.div({  }, React.DOM.p(null, "First paragraph"), React.DOM.button({ onClick: function (ev) {
                        window.alert(System.String.format("Hello {0}", name));
                    } }, "Click me"), React.DOM.p(null, "Second paragraph"));
            }
        },
        $main: function () {
            // get the element that mounts the app
            var appRoot = document.getElementById("app");
            // attach the user interface to the root node
            ReactDOM.render(Bridge.React.Component$2(ReactTodo.MessageLogger.Props,ReactTodo.MessageLogger.State).op_Implicit(new ReactTodo.MessageLogger()), appRoot);
        }
    });

    Bridge.define("ReactTodo.MessageEcho", {
        inherits: [Bridge.React.Component$2(ReactTodo.MessageEcho.Props,ReactTodo.MessageEcho.State)],
        ctor: function (p) {
            this.$initialize();
            Bridge.React.Component$2(ReactTodo.MessageEcho.Props,ReactTodo.MessageEcho.State).ctor.call(this, p); /*  keep empty */
        },
        getInitialState: function () {
            return Bridge.merge(new ReactTodo.MessageEcho.State(), {
                setTextInput: ""
            } );
        },
        render: function () {
            return React.DOM.div({  }, React.DOM.input({ onChange: Bridge.fn.bind(this, $asm.$.ReactTodo.MessageEcho.f1) }), React.DOM.button({ onClick: Bridge.fn.bind(this, $asm.$.ReactTodo.MessageEcho.f2) }, "Add"));
        }
    });

    Bridge.ns("ReactTodo.MessageEcho", $asm.$);

    Bridge.apply($asm.$.ReactTodo.MessageEcho, {
        f1: function (ev) {
            var nextState = this.getstate();
            nextState.setTextInput(ev.currentTarget.value);
            this.setWrappedState(nextState);
        },
        f2: function (ev) {
            if (System.String.isNullOrWhiteSpace(this.getstate().getTextInput())) {
                return;
            }

            this.getprops().getOnAdded()(this.getstate().getTextInput());
        }
    });

    Bridge.define("ReactTodo.MessageLogger", {
        inherits: [Bridge.React.Component$2(ReactTodo.MessageLogger.Props,ReactTodo.MessageLogger.State)],
        ctor: function () {
            this.$initialize();
            Bridge.React.Component$2(ReactTodo.MessageLogger.Props,ReactTodo.MessageLogger.State).ctor.call(this, new ReactTodo.MessageLogger.Props());
        },
        getInitialState: function () {
            return Bridge.merge(new ReactTodo.MessageLogger.State(), {
                setMessages: System.Array.init([], String)
            } );
        },
        render: function () {
            return React.DOM.div({  }, Bridge.React.Component$2(ReactTodo.MessageEcho.Props,ReactTodo.MessageEcho.State).op_Implicit$1(new ReactTodo.MessageEcho(Bridge.merge(new ReactTodo.MessageEcho.Props(), {
                setOnAdded: Bridge.fn.bind(this, $asm.$.ReactTodo.MessageLogger.f1)
            } ))), React.DOM.ul(null, System.Linq.Enumerable.from(System.Linq.Enumerable.from(this.getstate().getMessages()).select($asm.$.ReactTodo.MessageLogger.f2)).toArray()));
        }
    });

    Bridge.ns("ReactTodo.MessageLogger", $asm.$);

    Bridge.apply($asm.$.ReactTodo.MessageLogger, {
        f1: function (text) {
            var nextState = this.getstate();
            nextState.setMessages(System.Linq.Enumerable.from(nextState.getMessages()).concat(System.Array.init([text], String)).toArray());
            this.setWrappedState(nextState);

        },
        f2: function (msg) {
            return React.DOM.li(null, msg);
        }
    });
});
