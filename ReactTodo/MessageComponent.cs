using System;
using Bridge;
using Bridge.React;


namespace ReactTodo
{
    public class MessageEcho : Component<MessageEcho.Props, MessageEcho.State>
    {
        public class Props
        {
            public Action<string> OnAdded { get; set; }
        }

        public class State
        {
            public string TextInput { get; set; }
        }

        public MessageEcho(Props p) : base(p) { /* keep empty */ }

        protected override State GetInitialState()
        {
            return new State
            {
                TextInput = ""
            };
        }

        public override ReactElement Render()
        {
            return DOM.Div
            (
                new Attributes { },
                DOM.Input(new InputAttributes
                {
                    OnChange = ev =>
                    {
                        var nextState = this.state;
                        nextState.TextInput = ev.CurrentTarget.Value;
                        SetState(nextState);
                    }
                }),

                DOM.Button(new ButtonAttributes
                {
                    OnClick = ev =>
                    {
                        if (string.IsNullOrWhiteSpace(state.TextInput))
                        {
                            return;
                        }

                        props.OnAdded(state.TextInput);
                    }
                }, "Add")
            );
        }
    }
}