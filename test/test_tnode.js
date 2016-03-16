'use strict';

let assert = require('assert')
let fs = require('fs')
let util = require('util')
let path = require('path')

let posts2cal = function(data) {
    let root = new tw.TNode("root")
    data.index.posts.forEach( post => {
	root.insert([post.y, post.m, `${post.d}-${post.n}`], post)
    })
    return root
}

// a mock that ran amok
global.ng = {
    core: {
	forwardRef: function() {},
	Component: function() { return {Class: function() {}} }
    },
    router: {}
}

let tw = require('../treeview')


suite('nav', function() {

    setup(function() {
	let file = path.join(__dirname, 'data/blog.json')
	let json = JSON.parse(fs.readFileSync(file).toString())
	this.data = {index: json}
	this.data.cal = posts2cal(this.data)
    })

    test('tnode sort flat', function() {
	let root = new tw.TNode("root")
	root.kid_add([new tw.TNode("apple"), new tw.TNode("banana")])
	root.sort()
	assert.deepEqual(["banana", "apple"], root.kids.map(tn => tn.name))
	root.sort("ascending")
	assert.deepEqual(["apple", "banana"], root.kids.map(tn => tn.name))
    })

    test('tnode sort deep', function() {
	let cal = posts2cal(this.data)
	cal.sort_deep()
//	console.log(util.inspect(cal, {depth: null}))
	assert.equal("23-1", cal.kids[1].kids[1].kids[0].name)
    })

    test('tnode find', function() {
	assert.equal(null, this.data.cal.find())
	assert.equal("15-2", this.data.cal.find('1857', '08', '15-2').name)
	assert.equal("13-1", this.data.cal.find('1858', '07', '13-1').name)
	assert.equal("12-1", this.data.cal.find('1857', '06', '12-1').name)
	assert.equal(null, this.data.cal.find('1858', '07', 'omglol'))
    })

    test('tnode find', function() {
	let leaf1 = this.data.cal.find('1857', '08', '15-1')
	let leaf2 = this.data.cal.find('1857', '08', '15-2')
	let leaf3 = this.data.cal.find('1857')
	let leaf4 = this.data.cal.find('1858')

	assert(leaf2.ascendant_of(leaf3))
	assert.equal(false, leaf1.ascendant_of(leaf2))
	assert.equal(false, leaf1.ascendant_of(leaf4))
    })
})
