var express = require('express');
var router = express.Router();
var fileApi=require('../api/fileApi');

/* GET users listing. */
router.get('/getlist', function(req, res, next) {
	fileApi.getList(decodeURIComponent(req.query.filepath),res);
});
router.get('/getnode', function(req, res, next) {
	fileApi.getNode(decodeURIComponent(req.query.filepath),res);
});
router.get('/searchfile', function(req, res, next) {
	var strsearch=decodeURIComponent(req.query.strsearch);
	fileApi.searchfile(strsearch,res);
});
router.get('/download', function(req, res, next) {
	var downloadpath=decodeURIComponent(req.query.filepath);
	var idel=decodeURIComponent(req.query.idel)
	idel=(idel==='1')?true:false;
	fileApi.download(downloadpath,req,res,idel);
});
router.get('/getZipMax', function(req, res, next) {
	fileApi.getZipMaxSize(res);
});
router.get('/getPreviewData', function(req, res, next) {
	fileApi.getPreviewData(decodeURIComponent(req.query.filepath),decodeURIComponent(req.query.filetype),res);
});
router.post('/zipfiles', function(req, res, next) {
	var downloadpath=decodeURIComponent(req.body.filepath);
	fileApi.zipfiles(downloadpath,res);
});

module.exports = router;
