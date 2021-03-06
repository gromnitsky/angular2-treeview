/* globals ng */

'use strict';

// Everybody loves trees!
exports.TNode = class {
    constructor(name, payload, parent, kids) {
	if (!name) throw new Error("TNode requires a `name` arg")
	this.name = name
	this.payload = payload
	this.parent = parent
	this.kids = kids || []
	this.id = Math.random()	// FIXME
    }

    indexOf(name) {
	if (!name) return -1
	for (let idx = 0; idx < this.kids.length; ++idx) {
	    if (name === this.kids[idx].name) return idx
	}
	return -1
    }

    // Example: tnode.insert(['2100', '01', '02', 'omglol'], {hi: "there"})
    insert(npath, payload) {
	if (!Array.isArray(npath) || !npath.length) return

	let idx = this.indexOf(npath[0])
	if (idx !== -1) {
	    let parent = this.kids[idx]
	    // RECURSION!
	    parent.insert(npath.slice(1), payload)
	    return
	}

	let parent = this
	let kid = new exports.TNode(npath[0],
				    npath.length === 1 ? payload : null)
	parent.kid_add(kid)
	// RECURSION!
	kid.insert(npath.slice(1), payload)
    }

    // Side effect: modifies tnode parent
    kid_add(tnode) {
	if (!tnode) return false
	if (Array.isArray(tnode)) {
	    let arr = tnode.filter( tn => this.indexOf(tn.name) === -1)
	    if (!arr.length) return false
	    arr.map(tn => tn.parent = this)
	    this.kids = this.kids.concat(arr)
	} else {
	    if (this.indexOf(tnode.name) !== -1) return false
	    tnode.parent = this
	    // is this faster than concat()?
	    this.kids.push(tnode)
	}
	return true
    }

    // in place
    sort(order) {
	if (!order) order = "descending"
	return this.kids.sort(exports.TNode.SortOrder[order])
    }

    // in place
    sort_deep(order) {
	if (!order) order = "descending"
	let mysort = function(tnode, level, args) {
	    tnode.sort(order)
	    return { partial: true }
	}
	let msgbus = {}
	this.walk(mysort, 0, [], msgbus)
	this.sort(order)
    }

    // callback_args -- an array
    walk(callback, level, callback_args, msgbus) {
	for (let idx = 0; idx < this.kids.length; ++idx) {

	    let r = callback(this.kids[idx], level, callback_args)
	    if (r) {
		if (r.final) {
		    msgbus.exit = r.final
//		    console.log("*** ABORT")
		    return msgbus.exit
		}

		// RECURSION!
		this.kids[idx].walk(callback, level+1, callback_args, msgbus)
		if (msgbus.exit) return msgbus.exit
	    }
	}
    }

    find(/* arguments */) {
	var args = Array.prototype.slice.call(arguments)
	if (!args.length) return null

	let times_left = args.length
	let search = function(tnode, level, args) {
//	    console.log(`${level}: ${args[level]} ? ${tnode.name}`)
	    let r = {}
	    if (args[level] === tnode.name) {
		times_left--
		r.partial = true
	    }
//	    console.log(tnode.name, args, r, times_left)
//	    console.log('---')

	    if (times_left === 0) {
//		console.log("*** FOUND")
		r.final = tnode
		return r
	    }

	    return r.partial ? r : null
	}
	let msgbus = {}
	return this.walk(search, 0, args, msgbus) || null
    }

    ascendant_of(tnode) {
	let parent = this.parent
	if (parent === tnode.parent) return false // siblings

	while (parent) {
	    if (parent === tnode) return true
	    parent = parent.parent
	}
	return false
    }
}

exports.TNode.SortOrder = {
    "ascending": (a, b) => a.name.localeCompare(b.name),
    "descending": (a, b) => b.name.localeCompare(a.name)
}


// Angular2 only
let TreeView = ng.core.Component({
    selector: 'treeview',
    inputs: ['parent', 'src', 'selected', 'node_click', 'node_print'],
    directives: [ng.core.forwardRef(function() { return TreeView })],
    template:`
<ul class="treeview__node"
    [class.treeview__node--hidden]="src?.parent && !selected?.ascendant_of(src)">
  <li *ngFor="let tnode of src?.kids">
    <span *ngIf="tnode.kids.length"
	  (click)="toggle_view($event)"
	  class="treeview__sign {{ sign(tnode) }}">
    </span>

    <span (click)="node_click ? node_click($event, tnode) : stub_node_click($event, tnode)"
	  class="treeview__node__display"
	  [class.treeview__node--selected]="match(tnode, selected)"
	  [class.treeview__node--leaf]="tnode.kids.length == 0">
      {{ node_print ? node_print(tnode) : tnode.name }}
    </span>

    <treeview [parent]="parent" [src]="tnode" [node_click]="node_click"
	      [node_print]="node_print" [selected]="selected"></treeview>
  </li>
</ul>
`,
}).Class({
    constructor: function() {
    },

    stub_node_click: function(event, tnode) {
	alert(tnode.name)
    },

    sign: function(parent) {
	if (!(this.selected)) return "treeview__sign--collapsed"
	return this.selected.ascendant_of(parent) ? "treeview__sign--expanded" : "treeview__sign--collapsed"
    },

    match: function(tnode, selected) {
	if (!(tnode && selected)) return false
	return tnode.id === selected.id
    },

    toggle_view: function(e) {
	e.target.classList.toggle('treeview__sign--expanded')
	e.target.classList.toggle('treeview__sign--collapsed')
	e.target.nextElementSibling.nextElementSibling.children[0]
	    .classList.toggle('treeview__node--hidden') // next <treeview>
    }

})

exports.TreeView = TreeView
