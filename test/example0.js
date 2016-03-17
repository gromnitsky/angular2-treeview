/* globals ng, treeview */
'use strict';

let Example = ng.core.Component({
    selector: 'example',
    directives: [treeview.TreeView],
    template: `
<h1>TreeView Example</h1>

<p>Current node: {{ current?.name }}</p>

<div id="tree">
  <treeview [src]="data"
	    [selected]="current">
  </treeview>
</div>
`
}).Class({
    constructor: function() {
	console.info('TreeView Example Component')
	window.widget = this	// see README
    },
})

// see README
window.some_staff = function() {
    window.tree = new treeview.TNode('my files')
    window.fsroot = new treeview.TNode('/')
    window.etc = new treeview.TNode('etc')
    window.passwd = new treeview.TNode('passwd')

    window.tree.kid_add(window.fsroot)
    window.fsroot.kid_add(window.etc)
    window.etc.kid_add(window.passwd)
}

let boot = () => ng.platform.browser.bootstrap(Example)

if (document.readyState === "loading")
    document.addEventListener('DOMContentLoaded', boot)
else
    boot()
