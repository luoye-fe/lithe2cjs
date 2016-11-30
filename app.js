/*
 * 目的：去除 define 包的壳，替换 require 的 module 路径
 */

/*
 * 1、获取所有 js 文件对应的 moduleID
 * 2、将 moduleID 和文件名对应上保存下来
 * 3、获取每个 js 文件中 require 的 module ，如果是没在已保存的列表里，匹配 public alias，不在 alias 里的，根据 h5/src/js 作为跟路径找到对应文件
 * 4、至此可以得到require 的每个 module 对应的文件名
 * 5、根据文件名，得到针对于某个文件的 module 相对路径，执行替换
 * 6、删除第一行的 define 和 最后一行的 })
 * 7、写文件
 */

/*
 * node >= 7.0.0
 * 需自定义 publicAlias h5Path 这两个变量
 */

const fs = require('fs');
const path = require('path');

const rd = require('rd');
const beautify = require('js-beautify').js_beautify;

const publicAlias = [/\$/, 'vue', 'FastClick', 'TouchSlide', 'DropLoad', /^vendors\/*/];

const h5Path = '/Users/loye/Documents/gome/h5';
const h5SrcJsPath = path.join(h5Path, './src/js');

const requireRegexp = /require\([\'|\"](.+?)[\'|\"]\)/g;
const defineRegexp = /define\([\'|\"](.+?)[\'|\"]\,/;
const defineLine = /define\([\'|\"]([\s\S]+?)[\'|\"]([\s\S]+?)\n/;

function getAllFiles(path) {
	return new Promise((resolve, reject) => {
		rd.readFileFilter(path, /\.js$/, (err, files) => {
			if (err) return reject(err);
			resolve(files);
		});
	});
}

function getAllModuleIds(files) {
	return new Promise((resolve, reject) => {
		let filesList = [...files];
		let keyFileMap = {};

		function loop() {
			let oneFile = filesList[0];
			if (!oneFile) return resolve(keyFileMap);
			fs.readFile(oneFile, 'utf-8', (err, data) => {
				if (err) reject(err);
				if (data.match(defineRegexp)) {
					keyFileMap[data.match(defineRegexp)[1]] = oneFile
				};
				filesList.splice(0, 1);
				loop();
			});
		}
		loop();
	});
}

function resolveAllRequires(files, keyFileMap) {
	return new Promise((resolve, reject) => {
		let filesList = [...files];
		let resultData = '';
		function loop() {
			let oneFile = filesList[0];
			if (!oneFile) return resolve();
			fs.readFile(oneFile, 'utf-8', (err, data) => {
				if (err) reject(err);
				let match = requireRegexp.exec(data);
				while (match != null) {

					// 替换 require 的 module 的路径
					if (keyFileMap[match[1]]) {
						// 存在相应的文件
						data = data.replace(match[0], `require('${relativePath(oneFile, keyFileMap[match[1]])}')`)
					} else if (publicAlias.filter((item) => {
						return new RegExp(item).test(match[1]);
					}).length) {
						// venders 里的文件不做替换
						// console.log(match[1]);
					} else {
						// 没有定义 moduleID，以 h5/src/js 作为跟路径找对应文件
						data = data.replace(match[0], `require('${relativePath(oneFile, findFileByRoot(match[1], h5SrcJsPath))}')`)
					}

					match = requireRegexp.exec(data);
				}
				// 掐头去尾
				data = data.replace(/define\((?:\'|\")([\s\S]+?)(?:\'|\")([\s\S]+?)\n/, '').replace(/\s+$|\n+$|\r\n+$/, '').replace(/\}\)(?:\;|)$/, '');
				fs.writeFileSync(oneFile, beautify(data, {
					"indent_size": 4,
					"indent_with_tabs": true,
					"eol": "\n",
					"space_after_anon_function": false,
					"end_with_newline": true,
					"space_before_conditional": true,
					"space_in_empty_paren": false,
					"space_in_paren": false,
					"unescape_strings": false,
					"wrap_line_length": 0
				}));
				filesList.splice(0, 1);
				loop();
			});
		}
		loop();
	});
}

// 根据文件名和跟路径找到真实文件路径 a/b -> a/b.js | a/b/index.js
function findFileByRoot(name, root) {
	let joinedPath = path.join(root, name);
	if (!fs.existsSync(joinedPath) && !fs.existsSync(joinedPath + '.js') && !fs.existsSync(path.join(joinedPath, './index.js'))) {
		return name;
	};
	if (fs.existsSync(joinedPath) && fs.statSync(joinedPath).isFile()) {
		return joinedPath;
	} else if (fs.existsSync(joinedPath + '.js') && fs.statSync(joinedPath + '.js').isFile()) {
		return joinedPath + '.js';
	} else if (fs.existsSync(path.join(joinedPath, './index.js')) && fs.statSync(path.join(joinedPath, './index.js')).isFile()) {
		return path.join(joinedPath, './index.js');
	}
	return name;
}

// 相对路径计算
function relativePath(file1, file2) {
	let result = path.relative(path.parse(file1).dir, file2);
	if (!/\//.test(result)) {
		result = `./${result}`;
	}
	return result;
}

async function main() {
	let fileList = await getAllFiles(h5SrcJsPath);
	let keyFileMap = await getAllModuleIds(fileList);
	await resolveAllRequires(fileList, keyFileMap);
}

main();
