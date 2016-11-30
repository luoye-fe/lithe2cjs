// const path = require('path');
// const fs = require('fs');

// let result = path.join(path.relative(path.parse('e.js').dir, 'd.js'));
// /\//.test(result) ? result : result = `./${result}`
// console.log(result);


const requireRegexp = /require\([\'|\"](.+?)[\'|\"]\)/g;
let match = requireRegexp.exec("	var com = require('utils/ajax.js'),$ = require('vendors/zepto.js');");
while (match != null) {
	console.log(match[1]);
	match = requireRegexp.exec("	var com = require('utils/ajax.js'),$ = require('vendors/zepto.js');");
}