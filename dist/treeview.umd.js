(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.treeview = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* globals ng */

'use strict';

// Everybody loves trees!

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

exports.TNode = function () {
			function _class(name, payload, parent, kids) {
						_classCallCheck(this, _class);

						if (!name) throw new Error("TNode requires a `name` arg");
						this.name = name;
						this.payload = payload;
						this.parent = parent;
						this.kids = kids || [];
						this.id = Math.random(); // FIXME
			}

			_createClass(_class, [{
						key: "indexOf",
						value: function indexOf(name) {
									if (!name) return -1;
									for (var idx = 0; idx < this.kids.length; ++idx) {
												if (name === this.kids[idx].name) return idx;
									}
									return -1;
						}

						// Example: tnode.insert(['2100', '01', '02', 'omglol'], {hi: "there"})

			}, {
						key: "insert",
						value: function insert(npath, payload) {
									if (!Array.isArray(npath) || !npath.length) return;

									var idx = this.indexOf(npath[0]);
									if (idx !== -1) {
												var _parent = this.kids[idx];
												// RECURSION!
												_parent.insert(npath.slice(1), payload);
												return;
									}

									var parent = this;
									var kid = new exports.TNode(npath[0], npath.length === 1 ? payload : null);
									parent.kid_add(kid);
									// RECURSION!
									kid.insert(npath.slice(1), payload);
						}

						// Side effect: modifies tnode parent

			}, {
						key: "kid_add",
						value: function kid_add(tnode) {
									var _this = this;

									if (!tnode) return false;
									if (Array.isArray(tnode)) {
												var arr = tnode.filter(function (tn) {
															return _this.indexOf(tn.name) === -1;
												});
												if (!arr.length) return false;
												arr.map(function (tn) {
															return tn.parent = _this;
												});
												this.kids = this.kids.concat(arr);
									} else {
												if (this.indexOf(tnode.name) !== -1) return false;
												tnode.parent = this;
												// is this faster than concat()?
												this.kids.push(tnode);
									}
									return true;
						}

						// in place

			}, {
						key: "sort",
						value: function sort(order) {
									if (!order) order = "descending";
									return this.kids.sort(exports.TNode.SortOrder[order]);
						}

						// in place

			}, {
						key: "sort_deep",
						value: function sort_deep(order) {
									if (!order) order = "descending";
									var mysort = function mysort(tnode, level, args) {
												tnode.sort(order);
												return { partial: true };
									};
									var msgbus = {};
									this.walk(mysort, 0, [], msgbus);
									this.sort(order);
						}

						// callback_args -- an array

			}, {
						key: "walk",
						value: function walk(callback, level, callback_args, msgbus) {
									for (var idx = 0; idx < this.kids.length; ++idx) {

												var r = callback(this.kids[idx], level, callback_args);
												if (r) {
															if (r.final) {
																		msgbus.exit = r.final;
																		//		    console.log("*** ABORT")
																		return msgbus.exit;
															}

															// RECURSION!
															this.kids[idx].walk(callback, level + 1, callback_args, msgbus);
															if (msgbus.exit) return msgbus.exit;
												}
									}
						}
			}, {
						key: "find",
						value: function find() /* arguments */{
									var args = Array.prototype.slice.call(arguments);
									if (!args.length) return null;

									var times_left = args.length;
									var search = function search(tnode, level, args) {
												//	    console.log(`${level}: ${args[level]} ? ${tnode.name}`)
												var r = {};
												if (args[level] === tnode.name) {
															times_left--;
															r.partial = true;
												}
												//	    console.log(tnode.name, args, r, times_left)
												//	    console.log('---')

												if (times_left === 0) {
															//		console.log("*** FOUND")
															r.final = tnode;
															return r;
												}

												return r.partial ? r : null;
									};
									var msgbus = {};
									return this.walk(search, 0, args, msgbus) || null;
						}
			}, {
						key: "ascendant_of",
						value: function ascendant_of(tnode) {
									var parent = this.parent;
									if (parent === tnode.parent) return false; // siblings

									while (parent) {
												if (parent === tnode) return true;
												parent = parent.parent;
									}
									return false;
						}
			}]);

			return _class;
}();

exports.TNode.SortOrder = {
			"ascending": function ascending(a, b) {
						return a.name.localeCompare(b.name);
			},
			"descending": function descending(a, b) {
						return b.name.localeCompare(a.name);
			}
};

// Angular2 only
var TreeView = ng.core.Component({
			selector: 'treeview',
			inputs: ['parent', 'src', 'selected', 'node_click', 'node_print'],
			directives: [ng.core.forwardRef(function () {
						return TreeView;
			})],
			template: "\n<ul class=\"treeview__node\"\n    [class.treeview__node--hidden]=\"src?.parent && !selected?.ascendant_of(src)\">\n  <li *ngFor=\"#tnode of src?.kids\">\n    <span *ngIf=\"tnode.kids.length\"\n\t  (click)=\"toggle_view($event)\"\n\t  class=\"treeview__sign {{ sign(tnode) }}\">\n    </span>\n\n    <span (click)=\"node_click ? node_click($event, tnode) : stub_node_click($event, tnode)\"\n\t  class=\"treeview__node__display\"\n\t  [class.treeview__node--selected]=\"match(tnode, selected)\"\n\t  [class.treeview__node--leaf]=\"tnode.kids.length == 0\">\n      {{ node_print ? node_print(tnode) : tnode.name }}\n    </span>\n\n    <treeview [parent]=\"parent\" [src]=\"tnode\" [node_click]=\"node_click\"\n\t      [node_print]=\"node_print\" [selected]=\"selected\"></treeview>\n  </li>\n</ul>\n"
}).Class({
			constructor: function constructor() {},

			stub_node_click: function stub_node_click(event, tnode) {
						alert(tnode.name);
			},

			sign: function sign(parent) {
						if (!this.selected) return "treeview__sign--collapsed";
						return this.selected.ascendant_of(parent) ? "treeview__sign--expanded" : "treeview__sign--collapsed";
			},

			match: function match(tnode, selected) {
						if (!(tnode && selected)) return false;
						return tnode.id === selected.id;
			},

			toggle_view: function toggle_view(e) {
						e.target.classList.toggle('treeview__sign--expanded');
						e.target.classList.toggle('treeview__sign--collapsed');
						e.target.nextElementSibling.nextElementSibling.children[0].classList.toggle('treeview__node--hidden'); // next <treeview>
			}

});

exports.TreeView = TreeView;

},{}]},{},[1])(1)
});