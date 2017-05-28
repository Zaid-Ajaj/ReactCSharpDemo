using System;
using Bridge.Html5;
using Bridge.React;


namespace ReactTodo
{
    public class Program
    {
        static ReactElement View(string name)
        {
            return DOM.Div
            (
                new Attributes { },
                DOM.P("First paragraph"),
                DOM.Button
                (
                    new ButtonAttributes
                    {
                        OnClick = ev =>
                        {
                            Window.Alert($"Hello {name}");
                        }
                    },
                    "Click me"
                ),
                DOM.P("Second paragraph")
            );
        }


        public static void Main()
        {
            // get the element that mounts the app
            var appRoot = Document.GetElementById("app");
            // attach the user interface to the root node
            React.Render(new MessageLogger(), appRoot);
        } 
    }
}
