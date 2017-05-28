/**
 * @version 1.12.6.0
 * @copyright Copyright © ProductiveRage 2017
 * @compiler Bridge.NET 15.7.0
 */
Bridge.assembly("Bridge.React", function ($asm, globals) {
    "use strict";

    Bridge.define("Bridge.React.IDispatcher", {
        $kind: "interface"
    });

    /** @namespace System */

    /**
     * @memberof System
     * @callback System.Action
     * @return  {void}
     */

    /** @namespace Bridge.React */

    /**
     * This provides a class which may be derived from in order to declare React components. Due to the way that React initialises components, it is important that derived classes
     do not perform any logic or initialisation in their constructor, nor may they have any other configuration passed into their constructor but that which is described by the
     props (and state, where applicable) data. The constructors will not be executed and so any logic or member initialisation in there will be silenty ignored.
     *
     * @abstract
     * @public
     * @class Bridge.React.Component$2
     */
    Bridge.define("Bridge.React.Component$2", function (TProps, TState) { return {
        statics: {
            _reactComponentClasses: null,
            config: {
                init: function () {
                    this._reactComponentClasses = new (System.Collections.Generic.Dictionary$2(Function,Object))();
                }
            },
            op_Implicit: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null Component reference will pass through this operator method and so null needs
                // to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            },
            op_Implicit$1: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null Component reference will pass through this operator method and so null needs
                // to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            }
        },
        _reactElement: null,
        ctor: function (props, children) {
            if (children === void 0) { children = []; }

            this.$initialize();
            if (children != null) {
                if (System.Linq.Enumerable.from(children).any($asm.$.Bridge.React.Component$2.f1)) {
                    throw new System.ArgumentException("Null reference encountered in children set");
                }
            }

            // To ensure that a single "template" (ie. React component) is created per unique class, a static "_reactComponentClasss" dictionary is maintained. If it has no entry
            // for the current type then this must be the first instantiation of that type and so a component class will be created and added to the dictionary, ready for re-use
            // by any subsequent component instances.
            var currentType = Bridge.getType(this); // Cast to object first in case derived class uses [IgnoreGeneric] - see http://forums.bridge.net/forum/bridge-net-pro/bugs/3343
            var reactComponentClass = { };
            if (!Bridge.React.Component$2(TProps,TState)._reactComponentClasses.tryGetValue(currentType, reactComponentClass)) {
                reactComponentClass.v = this.createReactComponentClass();
                Bridge.React.Component$2(TProps,TState)._reactComponentClasses.set(currentType, reactComponentClass.v);
            }

            // Now that the React component class is certain to have been defined (once per unique C# component class), this instance requires a React element to be created
            // for it. The internal React mechanism means that the component's constructor will not be executed, which is why ALL state and configuration options for a
            // component must be contained within the props (and state, where appropriate). Note: In most cases where children are specified as a params array, we don't want
            // the "children require unique keys" warning from React (you don't get it if you call DOM.Div(null, "Item1", "Item2"), so we don't want it in most cases here
            // either - to achieve this, we prepare an arguments array and pass that to React.createElement in an "apply" call.
            var createElementArgs = System.Array.init([reactComponentClass.v, Bridge.React.ComponentPropsHelpers$1.wrapProps(props)], Object);
            if (children != null) {
                createElementArgs = createElementArgs.concat.apply(createElementArgs, children);
            }
            this._reactElement = React.createElement.apply(null, createElementArgs);
        },
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @function getprops
         * @return  {TProps}
         */
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @function setprops
         */
        getprops: function () {
            return this.props ? this.props.value : null;
        },
        /**
         * State is not used by all components and so this may be null
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @function getstate
         * @return  {TState}
         */
        /**
         * State is not used by all components and so this may be null
         *
         * @instance
         * @function setstate
         */
        getstate: function () {
            return this.state ? this.state.value : null;
        },
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @function getChildren
         * @return  {Array.<Object>}
         */
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @function setChildren
         */
        getChildren: function () {
            return this.props && this.props.children ? this.props.children : [];
        },
        createReactComponentClass: function () {
            // For each derived class we need to create React component class, this is like a template for the form of the component - individual instances will be created by
            // taking this template and using React.createElement to prepare a new element with the specified props. There should only be one React component class per unique
            // class but multiple React elements - one per instance of the class. The template is prepared by taking the first instance of any component class and ensuring
            // promoting all functions from the class prototype (which is where they will be defined for Bridge classes) since React's internal logic uses hasOwnProperty when
            // looking for key functions such as "render". Most functions can be promoted in a simple manner but there are some exceptions - "constructor" must be ignored
            // (otherwise React will raise a warning "You are attempting to define `constructor` on your component more than once" and "setState") and any of the component
            // lifecycle methods that involves props or state access need special handling. This is because React presumes that all props and state objects will be simple
            // object literals and they get picked apart during processing - so if a Bridge class is used for the props object that has a "name" property with "getName" and
            // "setName" functions on the prototype then React will maintain the "name" value but lose the getter and setter. The way around this is to stash the props object
            // in a simple wrapper with a "value" property which React will allow through its internals since it doesn't recursively meddle with the data - this "value" may be
            // a Bridge class (or an ObjectLiteral, it doesn't matter). The only complications around this approach are that anywhere that props are accessed, a redirection is
            // required - so that the component class gets the "value" reference. This counts not only for components' "this.props" access but also for functions such as
            // "componentWillReceiveProps" since the C# code will expect the "nextProps" value to be of type TProps and not a wrapper with a "value" property of type TProps.
            // The same logic goes for the state reference. Note that this effectively means that state is completely replaced when the "SetState" function is called, since the
            // single "value" reference is over-written. This makes the "SetState" implementation here closer to "replaceState" in React, but I didn't name it "ReplaceState"
            // instead of "SetState" since the React 0.14 docs say that that function may be removed in the future. However, "SetState" replacing the entire state reference,
            // rather than merging it with whatever data is already there is - I think - the least surprising approach when considered in terms of C#; it makes more sense to
            // replace the current data with the new reference, rather than merge - merging is not a common action in C#, though it is in JavaScript (eg. merging default
            // "options" with any explicit settings in many JavaScript APIs).
            var className = Bridge.React.ComponentNameHelpers.getDisplayName(this);
            var reactComponentClass = null;
            
			var bridgeComponentInstance = this;
			bridgeComponentInstance.displayName = className; // This is used by the React dev tools extension
				
			// Copy over all functions that may be needed first (ignoring the constructor since copying that causes a Reacts warning and because the constructor will not
			// be used when createElement initialises new element instances)..
			for (var i in bridgeComponentInstance) {
				if (i === 'constructor') {
					continue;
				}
				bridgeComponentInstance[i] = bridgeComponentInstance[i];
			}

			// .. then overwrite the functions that need special treatment (lifecycle functions involving props and/or state)
			var getInitialState = bridgeComponentInstance.getInitialState;
			bridgeComponentInstance.getInitialState = function (state) {
				return { value: getInitialState.apply(this) };
			};
			var componentWillReceiveProps = bridgeComponentInstance.componentWillReceiveProps;
			bridgeComponentInstance.componentWillReceiveProps = function (nextProps) {
				componentWillReceiveProps.apply(this, [ nextProps ? nextProps.value : nextProps ]);
			};
			var shouldComponentUpdate = bridgeComponentInstance.shouldComponentUpdate;
			bridgeComponentInstance.shouldComponentUpdate = function (nextProps, nextState) {
				return shouldComponentUpdate.apply(this, [ nextProps ? nextProps.value : nextProps, nextState ? nextState.value : nextState ]);
			};
			var componentWillUpdate = bridgeComponentInstance.componentWillUpdate;
			bridgeComponentInstance.componentWillUpdate = function (nextProps, nextState) {
				componentWillUpdate.apply(this, [ nextProps ? nextProps.value : nextProps, nextState ? nextState.value : nextState ]);
			};
			var componentDidUpdate = bridgeComponentInstance.componentDidUpdate;
			bridgeComponentInstance.componentDidUpdate = function (previousProps, previousState) {
				componentDidUpdate.apply(this, [ previousProps ? previousProps.value : previousProps, previousState ? previousState.value : previousState ]);
			};
			reactComponentClass = React.createClass(bridgeComponentInstance);
			
            return reactComponentClass;
        },
        /**
         * State is not used by all components and so it is valid to return null from any implementation of this function
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @return  {TState}
         */
        getInitialState: function () {
            return Bridge.getDefaultValue(TState);
        },
        componentWillMount: function () {
        },
        componentDidMount: function () {
        },
        /**
         * Props is not used by all components and so it is valid for the nextProps reference passed up here to be null
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TProps}    nextProps
         * @return  {void}
         */
        componentWillReceiveProps: function (nextProps) {
        },
        /**
         * If this returns false then the proposed component update will be cancelled - this may be used as an optimisation to avoid unnecessary updates. Since deep equality
         checks can be expensive, taking advantage of this mechanism is easiest when the props and state types are immutable and so equality checks are as simple (and cheap)
         as a reference equality test. Props and State are not used by all components and so it is valid for either or both of the nextProps and nextState references passed
         up here to be null.
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TProps}     nextProps    
         * @param   {TState}     nextState
         * @return  {boolean}
         */
        shouldComponentUpdate: function (nextProps, nextState) {
            return true;
        },
        /**
         * Props and State are not used by all components and so it is valid for either or both of the nextProps and nextState references passed up here to be null
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TProps}    nextProps    
         * @param   {TState}    nextState
         * @return  {void}
         */
        componentWillUpdate: function (nextProps, nextState) {
        },
        /**
         * Props and State are not used by all components and so it is valid for either or both of the nextProps and nextState references passed up here to be null
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TProps}    previousProps    
         * @param   {TState}    previousState
         * @return  {void}
         */
        componentDidUpdate: function (previousProps, previousState) {
        },
        componentWillUnmount: function () {
        },
        /**
         * This replaces the entire state for the component instance - it does not merge any state data with any state data already present on the instance. As such, it might
         be best to consider this implementation to be more like ReplaceState.
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TState}    state
         * @return  {void}
         */
        setWrappedState: function (state) {
            this.setState({ value: state });
        },
        /**
         * This replaces the entire state for the component instance, and executes the callback delegate when the state has been
         successfully mutated. See http://stackoverflow.com/questions/30782948/why-calling-react-setstate-method-doesnt-mutate-the-state-immediately
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TState}           state     
         * @param   {System.Action}    action
         * @return  {void}
         */
        setWrappedStateCallback: function (state, action) {
            this.setState({ value: state }, action);
        },
        /**
         * This replaces the entire state for the component instance asynchronously. Execution will continue when the state has been successfully mutated.
         *
         * @instance
         * @protected
         * @this Bridge.React.Component$2
         * @memberof Bridge.React.Component$2
         * @param   {TState}                         state
         * @return  {System.Threading.Tasks.Task}
         */
        setWrappedStateAsync: function (state) {
            var tcs = new System.Threading.Tasks.TaskCompletionSource();
            this.setWrappedStateCallback(state, function () {
                tcs.setResult(null);
            });
            return tcs.task;
        }
    }; });

    Bridge.ns("Bridge.React.Component$2", $asm.$);

    Bridge.apply($asm.$.Bridge.React.Component$2, {
        f1: function (element) {
            return element == null;
        }
    });

    Bridge.define("Bridge.React", {
        statics: {
            /**
             * This should only be used by the React.DOM factory method overloads - as such, I haven't created separate strongly-typed method signatures for StatelessComponent and PureComponent,
             I've rolled them together by having a single signature that takes an object set. This means that this method could feasibly be called with an object of references without the
             private "_reactElement" property, but no-one should be able to call this anyway so that's very low risk. Note that this won't work with the Component base class, it causes
             React to throw a "Maximum call stack size exceeded" error that I haven't been able to get to the bottom of yet (the ToChildComponentArray extension methods only supported
             StatelessComponent and PureComponent, so I'm ok for now with only supporting DOM factory methods that handle dynamic sets of StatelessComponent and PureComponent but
             not Component)
             *
             * @static
             * @this Bridge.React
             * @memberof Bridge.React
             * @param   {System.Collections.Generic.IEnumerable$1}    components
             * @return  {Array.<Object>}
             */
            toReactElementArray: function (components) {
                if (components == null) {
                    throw new System.ArgumentNullException("components");
                }

                var componentsArray = System.Linq.Enumerable.from(components).toArray();
                var reactElements = System.Array.init(componentsArray.length, null, Object);
                
			for (var i = 0; i < componentsArray.length; i++) {
				reactElements[i] = (componentsArray[i] == null) ? null : componentsArray[i]._reactElement;
			}
			 
                return reactElements;
            }
        }
    });

    Bridge.define("Bridge.React.ComponentNameHelpers", {
        statics: {
            getDisplayName: function (source) {
                if (source == null) {
                    throw new System.ArgumentNullException("source");
                }

                if (Bridge.isPlainObject(source)) {
                    return "Component";
                }

                return System.Linq.Enumerable.from(System.String.split(Bridge.Reflection.getTypeName(Bridge.getType(source)), [46, 91, 36].map(function(i) {{ return String.fromCharCode(i); }}))).first();
            }
        }
    });

    /**
     * React internals do some monkeying about with props references that will cause problems if the props reference is a Bridge class which does not have
     the [ObjectLiteral] attribute on it. The way that the Component and StatelessComponent classes work around this is to wrap props reference in an
     object literal since React's meddling is not recursive, it doesn't change any property values on props, it just changes how those top-level
     properties are described. This class provides a standard way to wrap the props data. It also performs some magic to extract any "Key"
     value from the props, since this must not be tucked away one level deeper as it is a magic React property (for more information
     about keyed elements, see https://facebook.github.io/react/docs/multiple-components.html#dynamic-children).
     *
     * @static
     * @abstract
     * @class Bridge.React.ComponentPropsHelpers$1
     */
    Bridge.define("Bridge.React.ComponentPropsHelpers$1", {
        statics: {
            wrapProps: function (propsIfAny) {
                // Try to extract a Key value from the props - it might be a simple "key" value or it might be a property with a "getKey" function or it
                // might be absent altogether
                var keyIfAny = null;
                if (propsIfAny != null) {
                    
					if (propsIfAny.key || (propsIfAny.key === 0)) { // Ensure that a zero key is not considered "no-key-defined"
						keyIfAny = propsIfAny.key;
					}
					else if (propsIfAny.getKey && (typeof(propsIfAny.getKey) == "function")) {
						var keyIfAnyFromPropertyGetter = propsIfAny.getKey();
						if (keyIfAnyFromPropertyGetter || (keyIfAnyFromPropertyGetter === 0)) { // Ensure that a zero key is not considered "no-key-defined"
							keyIfAny = keyIfAnyFromPropertyGetter;
						}
						else {
							keyIfAny = undefined;
						}
					}
					else {
						keyIfAny = undefined;
					}
				
                }

                // With the changes in React 15.0.0 (vs 0.14.7), a null Key value will be interpreted AS a key (and will either be ".$null" or ".$undefined")
                // when really we want a null Key to mean NO KEY. Possibly related to https://github.com/facebook/react/issues/2386, but I would have expected
                // to have seen this issue in 0.14 if it was that. The workaround is to return a type of "wrapped props" that doesn't even have a Key property
                // on it if there is no key value to use.
                if ((typeof(keyIfAny) !== 'undefined')) {
                    return Bridge.React.ComponentPropsHelpers$1.WrappedPropsWithKey.ctor({ value: propsIfAny, key: keyIfAny });
                }
                return Bridge.React.ComponentPropsHelpers$1.WrappedProps.ctor({ value: propsIfAny });
            },
            doPropsReferencesMatch: function (props1, props2) {
                if ((props1 == null) && (props2 == null)) {
                    return true;
                } else {
                    if ((props1 == null) || (props2 == null)) {
                        return false;
                    }
                }

                // Cast to object before calling GetType since we're using [IgnoreGeneric] (Bridge 15.7.0 bug workaround) - see http://forums.bridge.net/forum/bridge-net-pro/bugs/3343
                if (!Bridge.referenceEquals(Bridge.getType(props1), Bridge.getType(props2))) {
                    return false;
                }

                
			for (var propName in props1) {
				var propValue1 = props1[propName];
				var propValue2 = props2[propName];
				if ((propValue1 === propValue2) 
				|| ((propValue1 === null) && (propValue2 === null))
				|| ((typeof(propValue1) === "undefined") && (typeof(propValue2) === "undefined"))) {
					// Very simple cases where the properties match
					continue;
				}
				else if ((propValue1 === null) || (propValue2 === null) || (typeof(propValue1) === "undefined") || (typeof(propValue2) === "undefined")) {
					// Simple cases where one or both of the values are some sort of no-value (but either one of them has a value or they're inconsistent types of no-value,
					// since we'd have caught them above otherwise)
					return false;
				}
				else if ((typeof(propValue1) === "function") && (typeof(propValue2) === "function")) {
					// If they're Bridge-bound functions (which is what the presence of $scope and $method properties indicates), then check whether the underlying $method
					// and $scope references match (if they do then this means that it's the same method bound to the same "this" scope, but the actual function references
					// are not the same since they were the results from two different calls to Bridge.fn.bind)
					if (propValue1.$scope && propValue1.$method && propValue2.$scope && propValue2.$method && (propValue1.$scope === propValue2.$scope)) {
						if (propValue1.$method === propValue2.$method) {
							continue;
						}
						if (propValue1.$method.toString() === propValue2.$method.toString()) {
							// If the bound method is a named function then we can use the cheap reference equality comparison above. This is the ideal case, not only because
							// the comparison is so cheap but also because it means that the function is only declared once. Anonymous functions can't be compared by reference
							// and they have a cost (in terms of creation and in terms of additional GC work) that makes them less desirable. However, if the underlying bound
							// functions are anonymous functions then so long as they have the same content then they may be considered equivalent (since we've already checked
							// the references that they're bound to are the same, above).
							continue;
						}
					}
					// Due to the way that properties are currently initialised on types in Bridge, if a property's type is a struct then the getter and setter for it will
					// be created for each instance of the type, rather than being shared across all instances of the type (which is the case for reference type properties).
					// This means that when it comes to a "getName" property, for example, the "getName" function will not be the same value for two instances of the same
					// class, which is a problem for this function since it will mean that two props references that contain the same data are not identified as such as
					// the getter / setter functions are distinct across instances. A proper fix for this has been requested at:
					//   http://forums.bridge.net/forum/general/feature-requests/1737
					// A temporary workaround is for the getter and setter functions to be identified as such, and then ignored by this process. That would not be particularly
					// easy to do in general, but it IS something that's relatively easy to add to the ProductiveRage.Immutable library (every time that CtorSet is called, the
					// getter and setter methods for the property will have a $scaffolding value set to true). This can be unpicked if the Bridge translation process changes
					// but it means that types that have struct properties that are declared using the IAmImmutable helpers will work before that time.
					if ((propValue1.$scaffolding === true) && (propValue2.$scaffolding === true)) {
						continue;
					}
				}
				else if ((typeof(propValue1.equals) === "function") && (propValue1.equals(propValue2) === true)) {
					// If propValue1 has an "equals" implementation then give that a go
					continue;
				}
				return false;
			}
			
                return true;
            }
        }
    });

    Bridge.define("Bridge.React.ComponentPropsHelpers$1.WrappedProps", {
        $literal: true
    });

    Bridge.define("Bridge.React.DispatcherMessage", {
        config: {
            properties: {
                Source: 0,
                /**
                 * This will never be null
                 *
                 * @instance
                 * @public
                 * @this Bridge.React.DispatcherMessage
                 * @memberof Bridge.React.DispatcherMessage
                 * @function getAction
                 * @return  {Bridge.React.IDispatcherAction}
                 */
                /**
                 * This will never be null
                 *
                 * @instance
                 * @private
                 * @this Bridge.React.DispatcherMessage
                 * @memberof Bridge.React.DispatcherMessage
                 * @function setAction
                 * @param   {Bridge.React.IDispatcherAction}    value
                 * @return  {void}
                 */
                Action: null
            }
        },
        ctor: function (source, action) {
            this.$initialize();
            if ((source !== Bridge.React.MessageSourceOptions.Server) && (source !== Bridge.React.MessageSourceOptions.View)) {
                throw new System.ArgumentOutOfRangeException("source");
            }
            if (action == null) {
                throw new System.ArgumentNullException("action");
            }

            this.setSource(source);
            this.setAction(action);
        }
    });

    /**
     * @memberof System
     * @callback System.Func
     * @param   {T}          arg
     * @return  {boolean}
     */

    Bridge.define("Bridge.React.DispatcherMessageExtensions", {
        statics: {
            /**
             * This will execute the specified callback with a non-null reference if the current DispatcherMessage action matches type T.
             It will never call the work action with a null reference and it will never return a null reference. It will throw an exception
             for a null DispatcherMessage or null work reference.
             *
             * @static
             * @public
             * @this Bridge.React.DispatcherMessageExtensions
             * @memberof Bridge.React.DispatcherMessageExtensions
             * @param   {Function}                                                             T          
             * @param   {Bridge.React.DispatcherMessage}                                       message    
             * @param   {System.Action}                                                        work
             * @return  {Bridge.React.DispatcherMessageExtensions.IMatchDispatcherMessages}
             */
            if: function (T, message, work) {
                return new Bridge.React.DispatcherMessageExtensions.DispatcherMessageMatcher(message).else(T, work);
            },
            /**
             * This will execute the specified callback with a non-null reference if the current DispatcherMessage action matches type T and
             if that instance of T meets the specified conditions. It will never call the work action with a null reference and it will never
             return a null reference. It will throw an exception for a null DispatcherMessage, null condition or null work reference.
             *
             * @static
             * @public
             * @this Bridge.React.DispatcherMessageExtensions
             * @memberof Bridge.React.DispatcherMessageExtensions
             * @param   {Function}                                                             T            
             * @param   {Bridge.React.DispatcherMessage}                                       message      
             * @param   {System.Func}                                                          condition    
             * @param   {System.Action}                                                        work
             * @return  {Bridge.React.DispatcherMessageExtensions.IMatchDispatcherMessages}
             */
            if$1: function (T, message, condition, work) {
                return new Bridge.React.DispatcherMessageExtensions.DispatcherMessageMatcher(message).else$1(T, condition, work);
            }
        }
    });

    Bridge.define("Bridge.React.DispatcherMessageExtensions.IMatchDispatcherMessages", {
        $kind: "interface"
    });

    Bridge.define("Bridge.React.EnumerableComponentExtensions", {
        statics: {
            /**
             * When initialising a component that will accept a set of child components, each child components must be of type Any&lt;ReactElement, string&gt; - if you have an enumerable
             set of ReactElements then calling ToArray will not return an array of the appropriate type, so either each entry must be cast to an Any&lt;ReactElement, string&gt; before
             calling ToArray or this helper function may be used.
             *
             * @static
             * @public
             * @this Bridge.React.EnumerableComponentExtensions
             * @memberof Bridge.React.EnumerableComponentExtensions
             * @param   {System.Collections.Generic.IEnumerable$1}    elements
             * @return  {Array.<Object>}
             */
            toChildComponentArray: function (elements) {
                if (elements == null) {
                    throw new System.ArgumentNullException("elements");
                }

                return System.Linq.Enumerable.from(elements).select($asm.$.Bridge.React.EnumerableComponentExtensions.f1).toArray();
            },
            /**
             * When initialising a component that will accept a set of child components, each child components must be of type Any&lt;ReactElement, string&gt; - if you have an enumerable
             set of PureComponents of the same type then this helper function may be called to produce an array of the correct type (otherwise, each entry must be cast to an
             Any&lt;ReactElement, string&gt; before ToArray is called on that set)
             *
             * @static
             * @public
             * @this Bridge.React.EnumerableComponentExtensions
             * @memberof Bridge.React.EnumerableComponentExtensions
             * @param   {Function}                                    TProps        
             * @param   {System.Collections.Generic.IEnumerable$1}    components
             * @return  {Array.<Object>}
             */
            toChildComponentArray$1: function (TProps, components) {
                if (components == null) {
                    throw new System.ArgumentNullException("components");
                }

                return System.Linq.Enumerable.from(components).select(function (component) {
                        return Bridge.React.PureComponent$1(TProps).op_Implicit$1(component);
                    }).toArray();
            },
            /**
             * When initialising a component that will accept a set of child components, each child components must be of type Any&lt;ReactElement, string&gt; - if you have an enumerable
             set of PureComponents of the same type then this helper function may be called to produce an array of the correct type (otherwise, each entry must be cast to an
             Any&lt;ReactElement, string&gt; before ToArray is called on that set)
             *
             * @static
             * @public
             * @this Bridge.React.EnumerableComponentExtensions
             * @memberof Bridge.React.EnumerableComponentExtensions
             * @param   {Function}                                    TProps        
             * @param   {System.Collections.Generic.IEnumerable$1}    components
             * @return  {Array.<Object>}
             */
            toChildComponentArray$2: function (TProps, components) {
                if (components == null) {
                    throw new System.ArgumentNullException("components");
                }

                return System.Linq.Enumerable.from(components).select(function (component) {
                        return Bridge.React.StatelessComponent$1(TProps).op_Implicit$1(component);
                    }).toArray();
            }
        }
    });

    Bridge.ns("Bridge.React.EnumerableComponentExtensions", $asm.$);

    Bridge.apply($asm.$.Bridge.React.EnumerableComponentExtensions, {
        f1: function (component) {
            return component;
        }
    });

    Bridge.define("Bridge.React.IDispatcherAction", {
        $kind: "interface"
    });

    Bridge.define("Bridge.React.MessageSourceOptions", {
        $kind: "enum",
        statics: {
            Server: 0,
            View: 1
        }
    });

    /**
     * This provides a class that is like a combination of the StatelessComponent and the React "PureRenderMixin" - it has no State and will not update if given a new Props reference
     whose individual properties are the same as the previous Props reference. Only a shallow equality check is performed, with simple referential equality tests performed - this
     will be most reliable if immutable, persistent types are used for any nested data structures (as is the case with the PureRenderMixin). Using this base class means that there
     is often less work for the Virtual DOM to do, meaning that UI updates require less work / are faster / are more efficient. Note that this class only supports the Render method,
     the other lifecycle methods (ComponentWillReceiveProps, ComponentWillUpdate, etc..) may not be overridden (ShouldComponentUpdate has an internal implementation here that may
     not be altered) - this is because it is possible that this class' internals may be changed for future versions of React, depending upon what optimisations become available for
     Stateless Components. As with the Component and StatelessComponent base classes (and due to the way that React initialises components), it is important that derived classes do
     not perform any logic or initialisation in their constructor, nor may they have any other configuration passed into their constructor but that which is described by the Props
     data. The constructors will not be executed and so any logic or member initialisation in there will be silenty ignored.
     *
     * @abstract
     * @public
     * @class Bridge.React.PureComponent$1
     */
    Bridge.define("Bridge.React.PureComponent$1", function (TProps) { return {
        statics: {
            _reactComponentClasses: null,
            config: {
                init: function () {
                    this._reactComponentClasses = new (System.Collections.Generic.Dictionary$2(Function,Object))();
                }
            },
            op_Implicit: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null PureComponent reference will pass through this operator method and so null
                // needs to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            },
            op_Implicit$1: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null PureComponent reference will pass through this operator method and so null
                // needs to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            }
        },
        _reactElement: null,
        ctor: function (props, children) {
            if (children === void 0) { children = []; }

            this.$initialize();
            if (children != null) {
                if (System.Linq.Enumerable.from(children).any($asm.$.Bridge.React.PureComponent$1.f1)) {
                    throw new System.ArgumentException("Null reference encountered in children set");
                }
            }

            // To ensure that a single "template" (ie. React component) is created per unique class, a static "_reactComponentClasss" dictionary is maintained. If it has no entry
            // for the current type then this must be the first instantiation of that type and so a component class will be created and added to the dictionary, ready for re-use
            // by any subsequent component instances.
            var currentType = Bridge.getType(this); // Cast to object first in case derived class uses [IgnoreGeneric] - see http://forums.bridge.net/forum/bridge-net-pro/bugs/3343
            var reactComponentClass = { };
            if (!Bridge.React.PureComponent$1(TProps)._reactComponentClasses.tryGetValue(currentType, reactComponentClass)) {
                reactComponentClass.v = this.createReactComponentClass();
                Bridge.React.PureComponent$1(TProps)._reactComponentClasses.set(currentType, reactComponentClass.v);
            }

            // Now that the React component class is certain to have been defined (once per unique C# component class), this instance requires a React element to be created
            // for it. The internal React mechanism means that the component's constructor will not be executed, which is why ALL configuration options for a component must
            // be contained within the props. Note: In most cases where children are specified as a params array, we don't want the "children require unique keys" warning
            // from React (you don't get it if you call DOM.Div(null, "Item1", "Item2"), so we don't want it in most cases here either - to achieve this, we prepare an
            // arguments array and pass that to React.createElement in an "apply" call.
            var createElementArgs = System.Array.init([reactComponentClass.v, Bridge.React.ComponentPropsHelpers$1.wrapProps(props)], Object);
            if (children != null) {
                createElementArgs = createElementArgs.concat.apply(createElementArgs, children);
            }
            this._reactElement = React.createElement.apply(null, createElementArgs);
        },
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @protected
         * @this Bridge.React.PureComponent$1
         * @memberof Bridge.React.PureComponent$1
         * @function getprops
         * @return  {TProps}
         */
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @function setprops
         */
        getprops: function () {
            return this.props ? this.props.value : null;
        },
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @protected
         * @this Bridge.React.PureComponent$1
         * @memberof Bridge.React.PureComponent$1
         * @function getChildren
         * @return  {Array.<Object>}
         */
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @function setChildren
         */
        getChildren: function () {
            return this.props && this.props.children ? this.props.children : [];
        },
        createReactComponentClass: function () {
            var className = Bridge.React.ComponentNameHelpers.getDisplayName(this);
            var reactComponentClass = null;
            
			var bridgeComponentInstance = this;
			bridgeComponentInstance.displayName = className; // This is used by the React dev tools extension
				
			// Copy over all functions that may be needed first (ignoring the constructor since copying that causes a Reacts warning and because the constructor will not
			// be used when createElement initialises new element instances)..
			for (var i in bridgeComponentInstance) {
				if (i === 'constructor') {
					continue;
				}
				bridgeComponentInstance[i] = bridgeComponentInstance[i];
			}

			// .. then overwrite the supported life cycle functions (ComponentDidMount, ComponentDidUpdate, ShouldComponentUpdate), since they need special treatment
			var componentDidMount = bridgeComponentInstance.componentDidMount;
			bridgeComponentInstance.componentDidMount = function () {
				componentDidMount.apply(this, [ ]);
			};
			var componentDidUpdate = bridgeComponentInstance.componentDidUpdate;
			bridgeComponentInstance.componentDidUpdate = function (previousProps) {
				componentDidUpdate.apply(this, [ previousProps ? previousProps.value : previousProps ]);
			};
			var shouldComponentUpdate = bridgeComponentInstance.shouldComponentUpdate;
			bridgeComponentInstance.shouldComponentUpdate = function (nextProps, nextState) {
				return shouldComponentUpdate.apply(this, [ nextProps ? nextProps.value : nextProps, nextState ? nextState.value : nextState ]);
			};

			reactComponentClass = React.createClass(bridgeComponentInstance);
			
            return reactComponentClass;
        },
        shouldComponentUpdate: function (nextProps, nextState) {
            return !Bridge.React.ComponentPropsHelpers$1.doPropsReferencesMatch(this.getprops(), nextProps);
        },
        /**
         * This will be invoked once, immediately after the initial rendering occurs
         *
         * @instance
         * @protected
         * @this Bridge.React.PureComponent$1
         * @memberof Bridge.React.PureComponent$1
         * @return  {void}
         */
        componentDidMount: function () {
        },
        /**
         * This will be invoked immediately after the component's updates are flushed to the DOM (but not called for the initial render, ComponentDidMount is called then instead)
         *
         * @instance
         * @protected
         * @this Bridge.React.PureComponent$1
         * @memberof Bridge.React.PureComponent$1
         * @param   {TProps}    previousProps
         * @return  {void}
         */
        componentDidUpdate: function (previousProps) {
        }
    }; });

    Bridge.ns("Bridge.React.PureComponent$1", $asm.$);

    Bridge.apply($asm.$.Bridge.React.PureComponent$1, {
        f1: function (element) {
            return element == null;
        }
    });

    Bridge.define("Bridge.React.RawHtml", {
        config: {
            properties: {
                __html: null
            }
        }
    });

    /**
     * This is a helper class for constructing sets of ReactElement instances. It has a single Add method that has three overloads - one to take a single ReactElement,
     one to take an IEnumerable of ReactElement and one to take a params array of ReactElement. Since many React library methods allow null ReactElement references,
     null element references are allowed here (though null sets of elements are not).
     *
     * @public
     * @class Bridge.React.ReactElementList
     * @implements  System.Collections.Generic.IEnumerable$1
     */
    Bridge.define("Bridge.React.ReactElementList", {
        inherits: [System.Collections.Generic.IEnumerable$1(Object)],
        statics: {
            config: {
                properties: {
                    Empty: null
                },
                init: function () {
                    this.Empty = new Bridge.React.ReactElementList(System.Array.init(0, null, Object));
                }
            }
        },
        _items: null,
        config: {
            alias: [
            "getEnumerator", "System$Collections$Generic$IEnumerable$1$Object$getEnumerator"
            ]
        },
        ctor: function (items) {
            this.$initialize();
            if (items == null) {
                throw new System.ArgumentNullException("items");
            }

            this._items = items;
        },
        /**
         * A null item reference is acceptable here
         *
         * @instance
         * @public
         * @this Bridge.React.ReactElementList
         * @memberof Bridge.React.ReactElementList
         * @param   {Object}                           item
         * @return  {Bridge.React.ReactElementList}
         */
        add: function (item) {
            return new Bridge.React.ReactElementList(System.Linq.Enumerable.from(this._items).concat(System.Array.init([item], Object)));
        },
        /**
         * The items set may contain null references but the set itself must not be null
         *
         * @instance
         * @public
         * @this Bridge.React.ReactElementList
         * @memberof Bridge.React.ReactElementList
         * @param   {System.Collections.Generic.IEnumerable$1}    items
         * @return  {Bridge.React.ReactElementList}
         */
        add$2: function (items) {
            if (items == null) {
                throw new System.ArgumentNullException("items");
            }

            return new Bridge.React.ReactElementList(System.Linq.Enumerable.from(this._items).concat(items));
        },
        /**
         * The items params array may contain null references but the array itself must not be null
         *
         * @instance
         * @public
         * @this Bridge.React.ReactElementList
         * @memberof Bridge.React.ReactElementList
         * @param   {Array.<Object>}                   items
         * @return  {Bridge.React.ReactElementList}
         */
        add$1: function (items) {
            if (items === void 0) { items = []; }
            if (items == null) {
                throw new System.ArgumentNullException("items");
            }

            return new Bridge.React.ReactElementList(System.Linq.Enumerable.from(this._items).concat(items));
        },
        getEnumerator: function () {
            return Bridge.getEnumerator(this._items, Object);
        },
        System$Collections$IEnumerable$getEnumerator: function () {
            return this.getEnumerator();
        }
    });

    /**
     * This class defines the properties of the inline styles you can add to react elements
     *
     * @public
     * @class Bridge.React.ReactStyle
     */
    Bridge.define("Bridge.React.ReactStyle", {
        $literal: true
    });

    Bridge.define("Bridge.React.StatelessComponent$1", function (TProps) { return {
        statics: {
            _reactStatelessRenderFunctions: null,
            config: {
                init: function () {
                    this._reactStatelessRenderFunctions = new (System.Collections.Generic.Dictionary$2(Function,Function))();
                }
            },
            op_Implicit: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null StatelessComponent reference will pass through this operator method and
                // so null needs to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            },
            op_Implicit$1: function (component) {
                // Since React 0.11 (see https://facebook.github.io/react/blog/2014/07/17/react-v0.11.html), it has been acceptable to return null from a Render method to
                // indicate that nothing should be rendered. As such, it's possible that a null StatelessComponent reference will pass through this operator method and
                // so null needs to be allowed (previously this would throw a ArgumentNullException for a null component).
                if (component == null) {
                    return null;
                }
                return component._reactElement;
            }
        },
        _reactElement: null,
        ctor: function (props, children) {
            if (children === void 0) { children = []; }

            this.$initialize();
            if (children != null) {
                if (System.Linq.Enumerable.from(children).any($asm.$.Bridge.React.StatelessComponent$1.f1)) {
                    throw new System.ArgumentException("Null reference encountered in children set");
                }
            }

            // When preparing the "_reactStatelessRenderFunction" reference, a local "reactStatelessRenderFunction" alias is used - this is just so that the JavaScript
            // code further down (which calls React.createElement) can use this local alias and not have to know how Bridge stores static references.
            var reactStatelessRenderFunction = { };
            var currentType = Bridge.getType(this); // Cast to object first in case derived class uses [IgnoreGeneric] - see http://forums.bridge.net/forum/bridge-net-pro/bugs/3343
            if (!Bridge.React.StatelessComponent$1(TProps)._reactStatelessRenderFunctions.tryGetValue(currentType, reactStatelessRenderFunction)) {
                reactStatelessRenderFunction.v = this.createStatelessRenderFunction();
                Bridge.React.StatelessComponent$1(TProps)._reactStatelessRenderFunctions.set(currentType, reactStatelessRenderFunction.v);
            }

            // When we pass the props reference to React.createElement, React's internals will rip it apart and reform it - which will cause problems if TProps is a
            // class with property getters and setters (or any other function) defined on the prototype, since members from the class prototype are not maintained
            // in this process. Wrapping the props reference into a "value" property gets around this problem, we just have to remember to unwrap them again when
            // we render. In most cases where children are specified as a params array, we don't want the "children require unique keys" warning from React (you
            // don't get it if you call DOM.Div(null, "Item1", "Item2"), so we don't want it in most cases here either - to achieve this, we prepare an arguments
            // array and pass that to React.createElement in an "apply" call. Similar techniques are used in the stateful component.
            var createElementArgs = System.Array.init([reactStatelessRenderFunction.v, Bridge.React.ComponentPropsHelpers$1.wrapProps(props)], Object);
            if (children != null) {
                createElementArgs = createElementArgs.concat.apply(createElementArgs, children);
            }
            this._reactElement = React.createElement.apply(null, createElementArgs);
        },
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @protected
         * @this Bridge.React.StatelessComponent$1
         * @memberof Bridge.React.StatelessComponent$1
         * @function getprops
         * @return  {TProps}
         */
        /**
         * Props is not used by all components and so this may be null
         *
         * @instance
         * @function setprops
         */
        getprops: function () {
            return this.props ? this.props.value : null;
        },
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @protected
         * @this Bridge.React.StatelessComponent$1
         * @memberof Bridge.React.StatelessComponent$1
         * @function getChildren
         * @return  {Array.<Object>}
         */
        /**
         * This will never be null nor contain any null references, though it may be empty if there are no children to render
         *
         * @instance
         * @function setChildren
         */
        getChildren: function () {
            return this.props && this.props.children ? this.props.children : [];
        },
        createStatelessRenderFunction: function () {
            // We need to prepare a function to give to React.createElement that takes a props reference and maintains that for the instance of the element for the
            // duration of the Render call AND for any work that might happen later, such as in an OnChange callback (or other event-handler). To do this, we need an
            // instance that will capture this props value and that has all of the functionality of the original component (such as any functions that it has). The
            // best way that I can think of is to use Object.create to prepare a new instance, taking the prototype of the component class, and then setting its
            // props reference, then wrapping this all in a function that calls its Render function, binding to this instance. This woud mean that the constructor
            // would not get called on the component, but that's just the same as for stateful components (from the Component class).
            
			var classPrototype = this.constructor.prototype;
			var scopeBoundFunction = function(props) {
				var target = Object.create(classPrototype);
				target.props = props;
				return target.render.apply(target, []);
			}
			

            // We have an anonymous function for the renderer now but it would better to name it, since React Dev Tools will use show the function name (if defined) as
            // the component name in the tree. The only way to do this is, unfortunately, with eval - but the only dynamic content is the class name (which should be
            // safe to use since valid C# class names should be valid JavaScript function names, with no escaping required) and this work is only performed once per
            // class, since it is stored in a static variable - so the eval calls will be made very infrequently (so performance is not a concern).
            var className = Bridge.React.ComponentNameHelpers.getDisplayName(this);
            var namedScopeBoundFunction = null;
            
			eval("namedScopeBoundFunction = function " + className + "(props) { return scopeBoundFunction(props); };");
			
            return namedScopeBoundFunction;
        }
    }; });

    Bridge.ns("Bridge.React.StatelessComponent$1", $asm.$);

    Bridge.apply($asm.$.Bridge.React.StatelessComponent$1, {
        f1: function (element) {
            return element == null;
        }
    });

    /**
     * While the class-based component structure (using the PureComponent and StatelessComponent base classes) is very convenient and feels natural, there is some overhead to
     constructing the component instances. For the vast majority of the time, this will probably not cause any problems. However, if you have a page where you may need to
     update 1000s of elements at a time then this construction cost may become non-neligible. An alternative is to use static render methods instead of component classes.
     The methods in this class make that possible - the render methods used provided must take a single props argument and return a ReactElement. If the props type supports
     shallow comparison for change detection (which is highly recommended but often requires immutable types to be used for all properties) then the Pure method should be
     used; this will result in a component with a ShouldComponentUpdate implementation that will tell React not to re-render if the props data hasn't changed. If the props
     type does not support shallow comparison then the Stateless method should be used; this uses a lighter weight structure to create the React element but there is no
     way to support a ShouldComponentUpdate mechanism.
     *
     * @static
     * @abstract
     * @public
     * @class Bridge.React.StaticComponent
     */
    Bridge.define("Bridge.React.StaticComponent", {
        statics: {
            /**
             * Use this if the props type supports shallow comparison (which generally requires immutable types to be used for all of the props values) - the resulting component
             will automatically be assigned a ShouldComponentUpdate function so that re-renders of the component may be avoided if the props data has not changed.
             *
             * @static
             * @public
             * @this Bridge.React.StaticComponent
             * @memberof Bridge.React.StaticComponent
             * @param   {Function}       TProps      
             * @param   {System.Func}    renderer    
             * @param   {TProps}         props
             * @return  {Object}
             */
            pure: function (TProps, renderer, props) {
                
			var componentClass = renderer.$$componentClass;
			if (!componentClass) {
				var doPropsReferencesMatch = this.doPropsReferencesMatch;
				componentClass = React.createClass({
					displayName: renderer.name,
					render: function () {
						return renderer(this.props.value);
					},
					shouldComponentUpdate: function (nextProps, nextState) {
						return !doPropsReferencesMatch(this.props ? this.props.value : null, nextProps ? nextProps.value : null);
					}
				});
				renderer.$$componentClass = componentClass;
			}
			
                var wrappedProps = Bridge.React.ComponentPropsHelpers$1.wrapProps(props);
                return React.createElement(componentClass, wrappedProps);
            },
            /**
             * Use this if the props type does not support shallow comparisons
             *
             * @static
             * @public
             * @this Bridge.React.StaticComponent
             * @memberof Bridge.React.StaticComponent
             * @param   {Function}       TProps      
             * @param   {System.Func}    renderer    
             * @param   {TProps}         props
             * @return  {Object}
             */
            stateless: function (TProps, renderer, props) {
                
			var namedScopeBoundFunction;
			eval("namedScopeBoundFunction = function " + renderer.name + "(props) { return renderer(props ? props.value : props); };");
			
                var wrappedProps = Bridge.React.ComponentPropsHelpers$1.wrapProps(props);
                return React.createElement(namedScopeBoundFunction, wrappedProps);
            },
            /**
             * This method is just here to make it easier for the native JavaScript in the method above to call the static function in the ComponentPropsHelpers
             class without us having to bake in the way that Bridge represents static functions on classes
             *
             * @static
             * @this Bridge.React.StaticComponent
             * @memberof Bridge.React.StaticComponent
             * @param   {Function}    TProps    
             * @param   {TProps}      props1    
             * @param   {TProps}      props2
             * @return  {boolean}
             */
            doPropsReferencesMatch: function (props1, props2) {
                return Bridge.React.ComponentPropsHelpers$1.doPropsReferencesMatch(props1, props2);
            }
        }
    });

    Bridge.define("Bridge.React.Style", {
        statics: {
            mergeWith: function (source, other) {
                var merged = { };
                
            if (source) {
                for (var i in source) {
                    merged[i] = source[i];
                }
            }
            if (other) {
                for (var i in other) {
                    merged[i] = other[i];
                }
            }
            
                return merged;
            },
            height$1: function (height) {
                return Bridge.React.ReactStyle.ctor({ height: height });
            },
            height: function (style, height) {
                style.height = height;
                return style;
            },
            width$1: function (width) {
                return Bridge.React.ReactStyle.ctor({ width: width });
            },
            width: function (style, width) {
                style.width = width;
                return style;
            },
            fontSize$1: function (fontSize) {
                return Bridge.React.ReactStyle.ctor({ fontSize: fontSize });
            },
            fontSize: function (style, fontSize) {
                style.fontSize = fontSize;
                return style;
            },
            margin$2: function (margin) {
                return Bridge.React.ReactStyle.ctor({ margin: margin });
            },
            margin$3: function (top, right, bottom, left) {
                return Bridge.React.ReactStyle.ctor({ marginTop: top, marginLeft: left, marginRight: right, marginBottom: bottom });
            },
            margin: function (style, margin) {
                style.margin = margin;
                return style;
            },
            margin$1: function (style, top, right, bottom, left) {
                style.marginTop = top;
                style.marginLeft = left;
                style.marginRight = right;
                style.marginBottom = bottom;
                return style;
            },
            padding$2: function (padding) {
                return Bridge.React.ReactStyle.ctor({ padding: padding });
            },
            padding$3: function (top, right, bottom, left) {
                return Bridge.React.ReactStyle.ctor({ paddingTop: top, paddingLeft: left, paddingRight: right, paddingBottom: bottom });
            },
            padding: function (style, padding) {
                style.padding = padding;
                return style;
            },
            padding$1: function (style, top, right, bottom, left) {
                style.paddingTop = top;
                style.paddingLeft = left;
                style.paddingRight = right;
                style.paddingBottom = bottom;
                return style;
            }
        }
    });

    Bridge.define("Bridge.React.AppDispatcher", {
        inherits: [Bridge.React.IDispatcher],
        _currentDispatching: false,
        config: {
            events: {
                _dispatcher: null
            },
            alias: [
            "register", "Bridge$React$IDispatcher$register",
            "handleViewAction", "Bridge$React$IDispatcher$handleViewAction",
            "handleServerAction", "Bridge$React$IDispatcher$handleServerAction"
            ]
        },
        ctor: function () {
            this.$initialize();
            this._currentDispatching = false;
        },
        /**
         * Actions will sent to each receiver in the same order as which the receivers called Register
         *
         * @instance
         * @public
         * @this Bridge.React.AppDispatcher
         * @memberof Bridge.React.AppDispatcher
         * @param   {System.Action}    callback
         * @return  {void}
         */
        register: function (callback) {
            this.add_dispatcher(callback);
        },
        handleViewAction: function (action) {
            if (action == null) {
                throw new System.ArgumentNullException("action");
            }

            this.dispatch(new Bridge.React.DispatcherMessage(Bridge.React.MessageSourceOptions.View, action));
        },
        handleServerAction: function (action) {
            if (action == null) {
                throw new System.ArgumentNullException("action");
            }

            this.dispatch(new Bridge.React.DispatcherMessage(Bridge.React.MessageSourceOptions.Server, action));
        },
        dispatch: function (message) {
            if (message == null) {
                throw new System.ArgumentNullException("message");
            }

            // Dispatching a message during the handling of another is not allowed, in order to be consistent with the Facebook Dispatcher
            // (see https://github.com/facebook/flux/blob/master/src/Dispatcher.js#L183)
            if (!Bridge.staticEquals(this._dispatcher, null)) {
                if (this._currentDispatching) {
                    throw new System.Exception("Cannot dispatch in the middle of a dispatch.");
                }
                this._currentDispatching = true;
                try {
                    this._dispatcher(message);
                }
                finally {
                    this._currentDispatching = false;
                }
            }
        }
    });

    Bridge.define("Bridge.React.ComponentPropsHelpers$1.WrappedPropsWithKey", {
        inherits: [Bridge.React.ComponentPropsHelpers$1.WrappedProps],
        $literal: true
    });

    Bridge.define("Bridge.React.DispatcherMessageExtensions.DispatcherMessageMatcher", {
        inherits: [Bridge.React.DispatcherMessageExtensions.IMatchDispatcherMessages],
        _message: null,
        config: {
            alias: [
            "else", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$else",
            "else$1", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$else$1",
            "ifAnyMatched", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$ifAnyMatched"
            ]
        },
        ctor: function (message) {
            this.$initialize();
            if (message == null) {
                throw new System.ArgumentNullException("message");
            }
            this._message = message;
        },
        else: function (T, work) {
            return this.elseWithOptionalCondition(T, null, work);
        },
        else$1: function (T, condition, work) {
            if (Bridge.staticEquals(condition, null)) {
                throw new System.ArgumentNullException("condition");
            }

            return this.elseWithOptionalCondition(T, condition, work);
        },
        elseWithOptionalCondition: function (T, optionalCondition, work) {
            if (Bridge.staticEquals(work, null)) {
                throw new System.ArgumentNullException("work");
            }

            var actionOfDesiredType = Bridge.as(this._message.getAction(), T);
            if ((actionOfDesiredType == null) || ((!Bridge.staticEquals(optionalCondition, null)) && !optionalCondition(actionOfDesiredType))) {
                return this;
            }

            work(actionOfDesiredType);
            return Bridge.React.DispatcherMessageExtensions.MatchFoundSoMatchNoMoreDispatcherMessageMatcher.instance;
        },
        ifAnyMatched: function (work) {
            if (Bridge.staticEquals(work, null)) {
                throw new System.ArgumentNullException("work");
            }

            // Do nothing here - there has been no DispatcherMessage action successfully matched by this point (if there had been then
            // we would have returned a MatchFoundSoMatchNoMoreDispatcherMessageMatcher)
        }
    });

    Bridge.define("Bridge.React.DispatcherMessageExtensions.MatchFoundSoMatchNoMoreDispatcherMessageMatcher", {
        inherits: [Bridge.React.DispatcherMessageExtensions.IMatchDispatcherMessages],
        statics: {
            instance: null,
            config: {
                init: function () {
                    this.instance = new Bridge.React.DispatcherMessageExtensions.MatchFoundSoMatchNoMoreDispatcherMessageMatcher();
                }
            }
        },
        config: {
            alias: [
            "else", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$else",
            "else$1", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$else$1",
            "ifAnyMatched", "Bridge$React$DispatcherMessageExtensions$IMatchDispatcherMessages$ifAnyMatched"
            ]
        },
        ctor: function () {
            this.$initialize();
        },
        else: function (T, work) {
            if (Bridge.staticEquals(work, null)) {
                throw new System.ArgumentNullException("work");
            }
            return this;
        },
        else$1: function (T, condition, work) {
            if (Bridge.staticEquals(condition, null)) {
                throw new System.ArgumentNullException("condition");
            }
            if (Bridge.staticEquals(work, null)) {
                throw new System.ArgumentNullException("work");
            }
            return this;
        },
        ifAnyMatched: function (work) {
            if (Bridge.staticEquals(work, null)) {
                throw new System.ArgumentNullException("work");
            }

            // This class is only used if a DispatcherMessage action has been succesfully matched, so any calls to IfMatched on this
            // class should result in the if-successful work being executed
            work();
        }
    });
});
