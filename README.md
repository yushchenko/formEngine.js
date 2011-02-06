# formEngine.js

In many cases, application UI can be represented by relatively small set of elements.
Every element of a certain type should look and behave in a similar way
within all application or even application suite.
Of course, the elements will have different data bindings, labels, validation rules etc, 
but, as usual, all this stuff can be configured using only few properties.
On the other hand, in a real world project UI is the first target for various changes
so it could be really beneficial to make it configurable using a kind of DSL (domain specific language).

FormEngine.js represents UI as a set of reusable modular elements.
It's based on MVC pattern so application's data are strictly separated from presentation.
The library provides basic services such as rule based message routing,
data binding, expression evaluation, data validation and change tracking.
As a result, it become possible to create UI elements implementing quite simple interface
and configure the application using declarative metadata.
The simplest and the most productive way to deal with metadata is represent them using
consise and readable text representation (DSL).

FormEngine.js is intended to be used in combination with other,
lets say, low level libraries such as jQuery UI or Ext JS.
Such approach allows to create set of feature rich elements required for an application
spending quit reasonable amount of time.
There are couple of such sets (extensions) provided out of the box, they are used to run [samples][samples].
You could use this code as a kind of example or template for your own elements.

Complete project documentation is located in [project's wiki][wiki].

Samples to play and take a look at the source code using 'View Page Source' of your favorite browser
are [here][samples].

Current version is 0.1, see more details on [version history page][history].
If you are interested in project's plans for near future, visit [roadmap page][rmap].

To build the project by yourself see instructions given [here][build].

Enjoy :)

[wiki]: https://github.com/yushchenko/formEngine.js/wiki "formEngine.js wiki on Github"
[samples]: http://yushchenko.github.com/formEngine.js/ "formEngine.js samples on Github"
[build]: https://github.com/yushchenko/formEngine.js/wiki/Build "formEngine.js build instructions"
[history]: https://github.com/yushchenko/formEngine.js/wiki/VersionHistory "formEngine.js version history"
[rmap]: https://github.com/yushchenko/formEngine.js/wiki/Roadmap "formEngine.js roadmap"
