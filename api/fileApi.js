var path = require('path');
var config = require('../config');
var rootfolder = path.normalize(config.filepath);
var fs = require('fs');
var find = require('find');
var JSZip = require('jszip');
var mime = require('mime');
var cheerio = require('cheerio');
var xml = fs.readFileSync('FileType.xml', 'utf8');
$ = cheerio.load(xml);
//定义文件or目录属性
function FileProperty(_path, _type, _name, _size) {
	this.path = _path;
	this.filetype = _type;
	this.name = _name;
	this.size = _size;
	this.secPath = new Buffer(_path).toString('base64');
};
//定义树节点属性
function TreeNode(_isParent, _path, _name) {
	this.isParent = _isParent;
	this.filepath = new Buffer(_path).toString('base64');
	this.name = _name;
};


function getFileType(filename) {
	var hz = path.extname(filename).replace('.', '').toLowerCase();
	var resulttype = "other";
	$('filetypes').find('hz').each(function(index, el) {
		if ($(this).text().toLowerCase() == hz) {
			resulttype = $(this).parent().attr("type");
			return;
		}
	});
	return resulttype;
};
/// <summary>
/// 获取压缩限制
/// </summary>
/// <param name="res">response</param>
/// <returns>{maxSize: maxSize,maxCount: maxCount}</returns>
exports.getZipMaxSize = function(res) {
	var maxSize = config.zipMaxSize;
	var maxCount = config.zipMaxCount;
	res.send({
		maxSize: maxSize,
		maxCount: maxCount
	});
};

/// <summary>
/// 获取子目录和文件
/// </summary>
/// <param name="_path">路径</param>
/// <param name="res">response</param>
/// <returns>{status: "success",rootfolder: config.filepath,content: {folders: newdirs,files: newfiles}}</returns>
exports.getList = function(_path, res) {
	_path = (_path == null || _path == '') ? rootfolder : new Buffer(_path, 'base64').toString();
	var currentdir=_path.replace(rootfolder, "").split(path.sep);
	fs.exists(_path, function(iexists) {
		if (!iexists) {
			res.send({
				status: "failed",
				content: "路径不存在！"
			});
			return;
		}
		fs.readdir(_path, function(err, files) {
			if (err) {
				throw err;
				return;
			}
			var newfiles = [];
			var newdirs = [];
			files.forEach(function(file) {
				var statInfo = fs.statSync(path.join(_path, file));
				if (statInfo.isFile()) {
					var fp = new FileProperty(path.join(_path, file), getFileType(file), file, statInfo.size);
					newfiles.push(fp);
				}
				if (statInfo.isDirectory()) {
					var fp = new FileProperty(path.join(_path, file), 'folder', file, statInfo.size);
					newdirs.push(fp);
				}
			});
			if(currentdir.length>4){
				currentdir='...'+path.sep+currentdir.slice(-4).join(path.sep);
			}else{
				currentdir=currentdir.join(path.sep);
			}
			res.send({
				status: "success",
				rootfolder: rootfolder,
				currentdir: currentdir,
				upperdir: new Buffer(path.dirname(_path)).toString('base64'),
				itop:(path.dirname(_path) == path.dirname(rootfolder))? '1':'0' ,
				content: {
					folders: newdirs,
					files: newfiles
				}
			});

		});
	});
};

/// <summary>
/// 获取子节点
/// </summary>
/// <param name="_path">路径</param>
/// <param name="res">response</param>
/// <returns>{status: "success",rootfolder: config.filepath,content: {folders: newdirs,files: []}}</returns>
exports.getNode = function(_path, res) {
	_path = (_path == null || _path == '') ? rootfolder : new Buffer(_path, 'base64').toString();
	fs.exists(_path, function(iexists) {
		if (!iexists) {
			return;
		}
		fs.readdir(_path, function(err, files) {
			if (err) {
				throw err;
			} else {
				var newdirs = [];
				files.forEach(function(file) {
					var statInfo = fs.statSync(path.join(_path, file));
					var tn = new TreeNode(true, path.join(_path, file), file);
					if (statInfo.isDirectory()) {
						newdirs.push(tn);
					}
				});
				res.send({
					status: "success",
					rootfolder: config.filepath,
					content: {
						folders: newdirs,
						files: []
					}
				});
			}
		});
	});
};

/// <summary>
/// 查找文件
/// </summary>
/// <param name="strsearch">查询字符串</param>
/// <param name="res">response</param>
/// <returns>{status: "success",rootfolder: config.filepath,content: {folders: resultdir,files: resultfile}}</returns>
exports.searchfile = function(strsearch, res) {
	var regex = new RegExp(strsearch, "gi");
	var resultdir = [],
		resultfile = [];
	find
		.eachdir(regex, rootfolder, function(dir) {
			var statInfo = fs.statSync(dir);
			var dir = new FileProperty(dir, 'folder', path.basename(dir), statInfo.size);
			resultdir.push(dir);
		})
		.end(function() {
			find
				.eachfile(regex, rootfolder, function(file) {
					var statInfo = fs.statSync(file);
					var file = new FileProperty(file, getFileType(file), path.basename(file), statInfo.size);
					resultfile.push(file);
				})
				.end(function() {
					res.send({
						status: "success",
						rootfolder: config.filepath,
						content: {
							folders: resultdir,
							files: resultfile
						}
					});
				});
		});
};

/// <summary>
/// 获取图片数据base64
/// </summary>
/// <param name="filepaths">文件路径</param>
/// <param name="res">response</param>
/// <returns></returns>
exports.getPreviewData = function(filepath, filetype, res) {
	filepath=new Buffer(filepath,'base64').toString();
	fs.exists(filepath, function(iexists) {
		if (!iexists) {
			res.send({
				status: "failed",
				content: "路径不存在"
			});
			return;
		}
		/**/
		fs.readFile(filepath, {
			encoding: 'base64'
		}, function(err, data) {
			if (err) {
				throw err;
				return;
			}
			if (filetype == 'image') {
				res.send({
					status: "success",
					content: "data:image/" + path.extname(filepath).replace('.', '') + ";base64," + data
				});
			} else if (filetype == 'audio') {
				res.send({
					status: "success",
					content: "data:audio/" + path.extname(filepath).replace('.', '') + ";base64," + data
				});
			} else {

			}
		});
	});
};
/// <summary>
/// 压缩文件
/// </summary>
/// <param name="filepaths">文件路径集合以‘|’分割</param>
/// <param name="res">response</param>
/// <returns></returns>
exports.zipfiles = function(filepaths, res) {
	filepaths = filepaths.split('|');
	//console.log(filepaths);
	var zip = new JSZip();
	var files = [];
	var addfiles = [],
		resarry = [];
	filepaths.forEach(function(filepath) {
		filepath=new Buffer(filepath,'base64').toString();
		addfiles.push(path.basename(filepath));
	});
	addfiles = addfiles.sort();
	for (var i = 0; i < addfiles.length - 1; i++) {
		if (addfiles[i] == addfiles[i + 1]) {
			resarry.push(addfiles[i]);
		}
	}
	filepaths.forEach(function(filepath) {
		filepath=new Buffer(filepath,'base64').toString();
		var _basename = path.basename(filepath);
		var filename = filepath;
		if (resarry.join(',').indexOf(_basename) > -1) {
			filename = path.normalize(filename).replace(rootfolder, '');
			filename = filename.indexOf('\\') === 0 ? filename.substr(1, filename.length - 1) : filename;
		} else {
			filename = _basename;
		}
		zip.file(filename, fs.readFileSync(filepath));

	});
	var ms = Date.parse(new Date());
	var zippath = path.resolve("./tmp" + "/zip" + ms + ".zip");
	var content = zip.generate({
		type: "nodebuffer"
	});
	fs.writeFile(zippath, content, function(err) {
		if (err) {
			res.status(500).send(err);
		}
		res.send({
			zippath: new Buffer(zippath).toString('base64')
		});
	})


};
/// <summary>
/// 下载文件
/// </summary>
/// <param name="downloadfile">文件路径</param>
/// <param name="req">请求</param>
/// <param name="res">回应</param>
/// <param name="idelete">下载后是否删除源文件</param>
/// <returns>二进制流</returns>
exports.download = function(downloadfile, req, res, idelete) {
	/*res.download(downloadfile,path.basename(downloadfile),function(err){
		if (err) {
			res.send(err);
		}else{
			console.log('ok');
		}
	});   //express自带下载
	*/
	downloadfile=new Buffer(downloadfile,'base64').toString();
	var filename = path.basename(downloadfile);
	var mimetype = mime.lookup(downloadfile); //匹配文件格式
	var userAgent = (req.headers['user-agent'] || '').toLowerCase(); //去判断浏览器类型
	if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('trident') >= 0) {
		//ie
		res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
	} else if (userAgent.indexOf('firefox') >= 0) {
		//火狐
		res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
	} else {
		/* chrome、safari、其他非主流浏览器只能自求多福了 */
		res.setHeader('Content-disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
	}
	res.setHeader('Content-type', mimetype);
	var filestream = fs.createReadStream(downloadfile);
	/*filestream.on('data', function(chunk) {
			res.write(chunk);
		});
		filestream.on('end', function() {
			res.end();
			if (idelete) {
				fs.unlink(downloadfile);
			}
		});
		*/
	filestream.on('data', function(chunk) {
		if (res.write(chunk) === false) {
			filestream.pause();
		}
	});
	filestream.on('end', function(chunk) {
		res.end();
		if (idelete) {
			fs.unlink(downloadfile);
		}

	});
	res.on('drain', function() {
		filestream.resume();
	});

};