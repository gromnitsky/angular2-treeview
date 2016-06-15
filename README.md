# angular2-treeview

A simple auto-expanding tree widget. For example, it can render a
represendation of a filesystem like this:

<pre>
[-] /
	  [-] etc
			[+] mail
			hosts
			<b>group</b>
			passwd
	  [+] usr
</pre>

The current _selected_ node in the tree is "group", thus its parent
branch is auto-expanded. `usr` subtree is auto-collapsed because it
doesn't contain a selected node.

A live example:
[test/example1.html](http://gromnitsky.users.sourceforge.net/js/examples/angular2-treeview/example1.html)
(SourceForge can be ridiculously slow & it can take 2 minutes to load all
Angular2 deps.)

## Styling

The widget internally uses `<ul>` & `<li>` tags & by default contain
almost no styling. `[+]` & `[-]` indicators are spans.

## Installation

As I'm writing this, Angular2 is in ~~beta9~~ rc1; it contains numerous
bugs. angular2-treeview ships w/ 2 UMD modules. Depending on the phase
of the moon one of them may work fine while the other will crash the
Chrome tab.

Clone the repo. The widget consists of 2 files: `treeview.css` &
`treeview.js`.

### Browserify

* If you target es2015-compatible browsers:

	1. Make a symlink to the repo in `node_modules`.
	1. `let tw = require('angular2-treeview/treeview')`

* es5:

	* `let tw = require('angular2-treeview')`

### ES5

`<script src="••• angular2-treeview/dist/treeview.umd.min.js"></script>`


### SystemJS

No support. angular2-treeview is written in es2015 w/ the expectation
that Angular2 UMD module is loaded & `ng.code.Component` & friends are
globally available.


## Usage

The widget ships w/ a data structure called TNode. Here its simplified
constructor:

```
constructor(name, payload, parent, kids) {
	this.name = name
	this.payload = payload
	this.parent = parent
	this.kids = kids || []
	this.id = /* auto-generated */
}
```

You use tnodes to create a tree & pass its pointer to the widget.

To see the process in action, open `test/example0.html` in Chrome,
press F12 & type:

~~~
> tree = new treeview.TNode('my files')
~~~

This will be our "root" tree node. Let's create some children:

~~~
> fsroot = new treeview.TNode('/')
> etc = new treeview.TNode('etc')
> passwd = new treeview.TNode('passwd')
~~~

Attach them to each other:

~~~
> tree.kid_add(fsroot)
> fsroot.kid_add(etc)
> etc.kid_add(passwd)
~~~

For the testing purposes, a simple Angular2 component that uses
TreeView widget is already written for you & `window.widget` variable
contains a pointer to its instance.

	> widget.data = tree

Angular2 should update the screen but it doesn't. To force it, type:

	> ng.probe($('example'))._debugInfo._view.changeDetectorRef.detectChanges()

(You don't need to do this in your code, obviously.)

A "`[+] /`" text should appear in the box. Click on a plus sign. Click
on the node name.

Refresh the page.

To repeat the above steps, just type:

	> some_staff()

Now, we mark a a particular note as a "selected" one:

	> widget.current = tree.find('/', 'etc', 'passwd')

Attach the tree:

	> widget.data = tree

Update the screen:

	> ng.probe($('example'))._debugInfo._view.changeDetectorRef.detectChanges()

The tree has expanded automatically for the widget had a knowledge of
a "selected" node.

See `test/example1.*` files for more examples, `test/test_tnode.js`
for TNode api hints.


## License

MIT.
