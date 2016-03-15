/* globals ng, Rx */
'use strict';

let tw = require('../treeview')

let Example1 = ng.core.Component({
    selector: 'example1',
    directives: [tw.TreeView],
    template: `
<h1>Example1</h1>

<p>Current node: {{ current.name }}</p>

<div id="example1">
  <treeview [parent]="self"
	    [src]="data"
	    [selected]="current"
	    [node_click]="node_click">
  </treeview>
</div>
`
}).Class({
    constructor: function() {
	console.log('Example1')
	this.self = this
	this.data = new tw.TNode("some file system")

	let root = new tw.TNode("/")
	let etc = new tw.TNode("etc")
	let hosts = new tw.TNode("hosts")
	let group = new tw.TNode("group")
	let mail = new tw.TNode("mail")
	let usr = new tw.TNode("usr")
	let bin = new tw.TNode("bin")

	this.data.kid_add(root)
	root.kid_add([etc, usr])
	etc.kid_add([mail, hosts, group])
	mail.kid_add(new tw.TNode("sendmail.mc"))
	etc.kid_add(new tw.TNode("passwd"))
	usr.kid_add(bin)
	bin.kid_add(new tw.TNode("ls"))
	bin.kid_add(new tw.TNode("cat"))

	this.current = this.data.find('/', 'etc', 'group')
    },

    node_click: function(event, tnode) {
	// `this` here is an instance of a TreeView
	this.parent.current = tnode
    }
})

let Example2 = ng.core.Component({
    selector: 'example2',
    directives: [tw.TreeView],
    template: `
<h1>Example2</h1>

<p>Current node: {{ current?.name }} / {{ current?.payload?.s }}</p>

<div id="example2">
  <treeview [parent]="self"
	    [src]="data"
	    [selected]="current"
	    [node_click]="node_click"
	    [node_print]="node_print">
  </treeview>
</div>
`
}).Class({
    constructor: [ng.http.Http, function(http) {
	console.log('Example2')
	this.self = this

	http.get('data/blog.json').map(res => res.json()).
	    subscribe(json => {
		let root = new tw.TNode("root")
		json.posts.forEach( post => {
		    root.insert([post.y, post.m, `${post.d}-${post.n}`], post)
		})
		this.data = root
		this.current = this.data.find('1858', '07', '13-1')
	    })
    }],

    node_click: function(event, tnode) {
	if (tnode.kids.length !== 0) return // select only leafs
	// `this` here is an instance of a TreeView
	this.parent.current = tnode
    },

    node_print: function(tnode) {
	if (!tnode) return null
	return tnode.kids.length ? tnode.name : tnode.payload.s
    },
})


document.addEventListener('DOMContentLoaded', function() {
    ng.platform.browser.bootstrap(Example1)
    ng.platform.browser.bootstrap(Example2, [ng.http.HTTP_PROVIDERS])
})
