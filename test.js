// const path = require('path');
const fs = require('fs');

const babylon = require('babylon');

// let result = path.join(path.relative(path.parse('e.js').dir, 'd.js'));
// /\//.test(result) ? result : result = `./${result}`
// console.log(result);


// const requireRegexp = /require\([\'|\"](.+?)[\'|\"]\)/g;
// let match = requireRegexp.exec(fs.readFileSync('/Users/loye/Documents/gome/h5/src/js/conf/coquetry/coquetryGame.js', 'utf-8'));
// while (match != null) {
// 	console.log(match[1]);
// 	match = requireRegexp.exec(fs.readFileSync('/Users/loye/Documents/gome/h5/src/js/conf/coquetry/coquetryGame.js', 'utf-8'));
// }


// replace(/define\((?:\'|\")([\s\S]+?)(?:\'|\")([\s\S]+?)\n/, '').replace(/\s+$|\n+$|\r\n+$/, '').replace(/(\/\*[\s\S]+\*\/$)/).replace(/\}\)(?:\;|)$/, '')

let resultData = `define("utils/ajax", function(require, exports, module) {
	// var common = require('lib/common'),
	var common_ui = require("common/ui"),
		ck = require('mods/check'),
		alert = require('UI/alert'),
		gck = require('mods/storage.js'),
		dp = require('vendors/dropload'),
		devId = Date.now();

	require('$');

	function Ajax() {
		var self = this,
			domain = location.href,
			com_vm = {
				pageNum: 2,
				isend: 0,
				arrName: '',
				numPerPage: 10
			};
		domain = domain.match(/^(http[s]?:\/\/(?:[^\/]*))\/.*$/)[1];
		this.postData = function(url, params, callback, pageNum, numPerPage, isAsyn, beforePost) {
			if (!common_ui.onLine()) {
				alert.alertSecond("网络异常");
				return false;
			};
			var edited = editUrl(url, params, pageNum, numPerPage);
			beforePost && beforePost();
			requestAjax(edited.url, edited.params, callback, isAsyn, edited.isImg);
		};
		this.loadPage = function(urls, callbacks, paramsArray, numPerPage) {
			if (!common_ui.onLine()) {
				return false;
			};
			if (urls && urls.length > 0) {
				common_ui.addLoading();
				requestAjax(urls, paramsArray, callbacks);
			} else {
				console.log('loadPage error');
			}
		};
		this.downReLoad = function() {
			var dropload = $('body').dropload({
				domUp: {
					domClass: 'dropload-up',
					domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
					domUpdate: '<div class="dropload-update">↑释放更新</div>',
					domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
				},
				loadUpFn: function(me) {
					setTimeout(function() {
						me.resetload();
						location.reload(true);
					}, 500);
				}
			});
		};
		this.upload = function(parent, url, callback, params, numPerPage) {

			var parent = parent || 'body';
			$(parent).dropload({
				scrollArea: window,
				loadDownFn: function(me) {
					if (com_vm.isend && com_vm.isend == 1) {
						alert.alertSecond('已经没有内容了~');
						me.resetload();
					} else {
						loadMoreFun(url, callback, params, numPerPage);
						me.resetload();
					}
				}
			});
		};
		this.isNum = function(val) {
			return !isNaN(val);
		};
		this.setArrName = function(name) {
			com_vm.arrName = name;
		};
		this.setIsEnd = function(end) {
			com_vm.isend = end;
		};
		this.setPageNum = function(pageNum) {
			com_vm.pageNum = pageNum;
		};
		this.getCom_vm = function(pageNum) {
			return com_vm;
		};
		this.getJSON = function(url, callback, obj) {
			var pageNum = obj == undefined ? 1 : obj.pageNum,
				numPerPage = obj == undefined ? 10 : obj.numPerPage;
			var params = createURL(url);

			requestAjax((domain + url + params), {
				pageNum: pageNum,
				numPerPage: numPerPage
			}, callback, true);

		};

		function editUrl(url, params, pageNum, numPerPage) {
			var other = getCommonParams('');
			var params = !isEmpty(params) ? params : getParams();
			params.pageNum = pageNum || 1;
			params.numPerPage = numPerPage || 10;
			if (url.indexOf('http') > -1) {
				return {
					url: url,
					params: params,
					isImg: true
				};
			}
			return {
				url: (domain + url + other),
				params: params
			};
		};

		function isEmpty(obj) {
			if (!obj)
				return true;
			var empty = true;
			for (var key in obj) {
				empty = false;
				break;
			}
			return empty;
		}

		function getCommonParams(url) {
			return createURL(url);
		};

		function getParams(url) { //获取url传递的参数*/
			var params = {};
			var search = url ? url.substr(url.indexOf('?') + 1) : location.search.substr(1);
			if (search) {
				var key_values = search.split('&');
				if (key_values && key_values.length > 0) {
					for (var i = 0; i < key_values.length; i++) {
						var key = key_values[i].split('=')[0];
						var val = key_values[i].split('=')[1];
						params[key] = val;
					}
				}
			}
			return params;
		};

		function loadMoreFun(url, callback, params, numPerPage) {
			var isend = com_vm.isend;
			if (isend == 0) {
				var pageNum = com_vm.pageNum;
				self.postData(url, params, callback, pageNum, numPerPage);
			} else {
				if (isend == 1) {
					alert.alertSecond('已经没有内容了~');
				}
			}
		};

		function createURL(url) {
			//       var userId=(gck.getCookie("userId")!=''?gck.getCookie("userId"):0);
			return url;
			//return url.indexOf('?') > 0?'userId='+userId+'&clientOs=4&clientOsVersion=4.3&appType=1&appVersion=1.0&mac=ac+as+23+3d&devId='+devId:'?userId='+userId+'&clientOs=4&clientOsVersion=4.3&appType=1&appVersion=1.0&mac=ac+as+23+3d&devId='+devId
		}

		function requestAjax(url, params, callback, isAsync, isImg) {
			var data = {
					url: url,
					params: params
				},
				isArr = ck.isArray(url);
			if (isArr) {
				data = [];
				for (var i = 0; i < url.length; i++) {
					var obj = editUrl(url[i], params[i]);
					data.push(obj);
				}
			}
			if (isImg) {
				$.getJSON(url, function(data,status,xhr) {
					callback(data);
					common_ui.removeLoading();
				});
				return false;
			};
			$.ajax({
				type: 'post',
				url: url,
				data: params,
				dataType: 'json',
				async: isAsync,
				success: function(res,status,xhr) {
					if(res.code == 200 || !isArr){
						removeDiv(res.data, params.pageNum, params.numPerPage);
					}
					common_ui.removeLoading();
					callback(res,status,xhr);
				},
				error: function(error) {
					// alerter('网络请求错误！');
					/*var info = '';
					for(e in error){
						info += e + ':' + error[e]?error[e].toString():'';
					}
					alert.alerter(info);*/
				}
			});
		};

		function removeDiv(data, pageNum, numPerPage) {
			var arrName = com_vm.arrName;
			if (arrName) {
				datas = data.data ? data.data : data;
				for (var item in datas) {
					if (item == arrName) {
						data = datas[item];
						break;
					}
				}
			}
			if (ck.isArray(data)) {
				if (!data || data.length < numPerPage) {
					com_vm.isend = 1;
				} else {
					com_vm.pageNum++;
				}
			}
		}
	}

	/**
	 * 扩展Ajax的方法
	 * 杨浪
	 * @type {{query: Function, querySync: Function, _doPostJson: Function}}
	 */
	Ajax.prototype = {

		/**
		 * post查询，异步执行，<br>
		 * 返回json。<br>
		 * @method query
		 * @async
		 * @param {String} url 查询地址
		 * @param _param 参数对象 可选
		 * @param {Function} _callback 回调方法 可选
		 */
		query: function(url, _param, _callback) {
			var that = this,
				aLen = arguments.length,
				callback, param;
			if (aLen == 2) {
				if ($.isFunction(_param)) {
					callback = _param;
				}
			} else if (aLen == 3) {
				param = _param, callback = _callback;
			}
			return this._doPostJson(url, param, callback, true);
		},


		/**
		 * post查询 同步执行<br>
		 * 返回json<br>
		 * @method querySync
		 * @param {String} url 查询地址
		 * @param _param 参数对象 可选
		 * @param {Function} _callback 回调方法 可选
		 */
		querySync: function(url, _param, _callback) {
			var that = this,
				aLen = arguments.length,
				callback, param;
			if (aLen == 2) {
				if ($.isFunction(_param)) {
					callback = _param;
				}
			} else if (aLen == 3) {
				param = _param, callback = _callback;
			}
			return this._doPostJson(url, param, callback, false);
		},

		/**
		 * 执行post查询<br>
		 * 返回json<br>
		 * 内部使用<br>
		 * @method _doPostJson
		 * @private
		 * @param {String} url 查询地址
		 * @param param 参数对象
		 * @param {Function} callback 回调方法
		 * @param {Boolean} async 是否异步
		 */
		_doPostJson: function(url, param, callback, async) {
			var ajax = $.ajax({
				url: url,
				type: 'post',
				dataType: 'json',
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				async: async,
				data: param,
				success: function(json) {
					if (callback)
						callback(json);
				},
				error: function() {
					console.log("error");
				}
			});
			return ajax;
		}
	};
	/**
	 * [ajaxGet description]  GET请求ajax
	 * @author wangchunpeng 2016-06-30T15:40:09+0800
	 * @param  {[type]}   url          [description]
	 * @param  {Function} callback     [description]
	 */
	Ajax.prototype.ajaxGet = function(url, callback) {
		$.ajax({
			type: "GET",
			url: url,
			success: function(data) {
				callback(data);
			},
			error: function() {
				console.log("error");
			}
		});
	}
	
	module.exports = new Ajax();
});`;

// console.log(AST.program.body[0].expression.callee.name);
// console.log(AST.program.body[0].expression.arguments[0].value);
// /^(http[s](?:\/\/)(?:[^\/]*))\/.*$/.test("asd")

let current = fs.readFileSync('/Users/loye/Desktop/src/js/utils/ajax.js', 'utf-8');

let AST = babylon.parse(current, {
	sourceType: "module",
	plugins: ['*']
});

if (AST.program.body[0].expression.callee.name === 'define') {

	current = current.replace(/\$/g, '#');

	let bodyStart = AST.program.body[0].start;
	let bodyEnd = AST.program.body[0].end;

	console.log(current.substring(bodyStart, bodyEnd));

	let mainStart = AST.program.body[0].expression.arguments[1].body.start;
	let mainEnd = AST.program.body[0].expression.arguments[1].body.end;


	console.log(current.substring(mainStart, mainEnd).replace(/^\{|\}$/g, ''));

	console.log(current.replace(current.substring(bodyStart, bodyEnd), current.substring(mainStart, mainEnd).replace(/^\{|\}$/g, '')).replace(/#/g, '$'));


} else {
	console.log('不是标准文件');
}
