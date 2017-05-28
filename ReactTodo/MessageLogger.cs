using System;
using Bridge;
using System.Linq;
using Bridge.Html5;
using Bridge.React;


namespace ReactTodo
{
    public class MessageLogger : Component<MessageLogger.Props, MessageLogger.State>
    {
        public class Props
        {

        }

        public class State
        {
            public string[] Messages { get; set; }
        }


        protected override State GetInitialState()
        {
            return new State
            {
                Messages = new string[] { }
            };
        }


        public MessageLogger() : base(new Props()) { }

        public override ReactElement Render()
        {
            return DOM.Div
            (
                new Attributes { },

                new MessageEcho(new MessageEcho.Props
                {
                    OnAdded = text =>
                    {
                        var nextState = state;
                        nextState.Messages = 
                                nextState.Messages
                                         .Concat<string>(new string[] { text })
                                         .ToArray();

                        SetState(nextState);
                            
                    }
                }),

                DOM.UL
                (
                    state.Messages.Select(msg => DOM.Li(msg))
                )
            );
        }


    }
}