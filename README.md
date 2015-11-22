# DownLoad_NODE
A Download Site

# 配置 config.js
```
var config={
	lis_port:8888, //端口号
	filepath:"D:\\Program Files\\", //下载的文件路径需要注意斜杠需要转义
	zipMaxSize:10000000, //最大压缩尺寸,单位byte，超过这个大小不能压缩
	zipMaxCount:10 //最大压缩文件数，每个压缩包包含的最大文件数
};
```
# 文件类型区分文件 FileType.xml
其中的一个文件类型.每个 *<hz>* 代表一个后缀，*type* 代表类型, *type* 的值 *image* 是 *public\images\filetype* 下的 *image.png* 
```
  <filetype type="image" described="图片文件" >
      <hz>bmp</hz>
      <hz>jpg</hz>
      <hz>jpeg</hz>
      <hz>jpe</hz>
      <hz>png</hz>
      <hz>gif</hz>
      <hz>ico</hz>
  </filetype>
```
# 运行
```
node app
```
