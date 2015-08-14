Goals:

- Scalable
- Compressable ( Closure compiler with ADVANCED option )
- Readable
- Only use 1 var in global scope, I.E. window.BotanJS
- Python-like

Predefined programming rules: 
```
    __namespace
    __import
    __readOnly
    __static_method
    __extends

    ns = __namespace( <package> )
    ns[ NS_INVOKE ]( <Same Level Packages> )
    ns[ NS_EXPORT ]( <TYPE>, <Name>, <Object> )
    ns[ NS_TRIGGER ]( <TYPE>, <Callback> )
```

Usage:
```
    BotanJS.import( <package> )
```

BotanJS Class Map:
```
<BotanJS>
    <class name="System" location="/System/_this.js">
        <class name="Global" location="/System/Global.js">
            <export>ALLOWED_ORIGIN</export>
        </class>
        <class name="Debug" location="/System/Debug.js">
            <import>System.Global</import>
        </class>
    </class>

    <class name="Dandelion" location="/Dandelion/_this.js">
        <class name="Swf" location="/Dandelion/Swf/_this.js">
            <!-- problem exists on Extern -->
            <!-- extern must follow path order -->
            <import>Dandelion.Swf.ExtAPI</import>
            <!--
                once Dandelion.Swf is imported
                Dandelion.MY_CLASS_DEPENDENT_PROP will become available
            -->
            <prop src="/Dandelion/Swf/_this.js">MY_CLASS_DEPENDENT_PROP</prop>
            <class name="ExtAPI" location="/Dandelion/Swf/ExtAPI.js">
                <import> ... </import>
            </class>
        </class>
    </class>
</BotanJS>
```

Css Inheritance:
    Unlike js, which use classes only when __import is explicitly called.
    Structure of css class are inherited by it's parent namespace
```
Dandelion.Swf.ExtAPI.css
inherits from Dandelion.Swf.css
inherits from Dandelion.css
```
