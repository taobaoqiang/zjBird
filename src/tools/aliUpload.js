import OSS from 'ali-oss'
import {
  Indicator
} from 'mint-ui';

let aliOss = {};
aliOss.fileChange = function (el, vueDataList) {
  //判断是否选中图片
  let fileList;
  let fileArray = [];
  return new Promise((resolve) => {
    try {
      if (!el.target.files[0].size) {
        return
      }
      new Promise((resolve) => {
        fileList = el.target.files
        resolve(fileList);
      }).then((resolve) => {
        for (var i = 0; i < resolve.length; i++) {
          let render = new FileReader();
          render.readAsDataURL(resolve[i]);
          render.onloadend = function () {
            aliOss.compress(this.result, vueDataList)
          }
        }
      });

      for (let i = 0;i<fileList.length  ;i++) {
        fileArray.push(fileList[i]);
      }
      resolve(fileArray);
    } catch (err) {
      console.log(err);
    }
  })
};

//转换base64
aliOss.compress = function (fileObj, vueData) {
  if (typeof (FileReader) === 'undefined') {
    console.log("当前浏览器内核不支持base64图标压缩");
    //调用上传方式不压缩
    vueData.push(fileObj);
    // uploadFile(name,fileObj);
  } else {
    try {
      let Img = new Image();
      Img.src = fileObj;

      Img.onload = function () {
        let canvas = document.createElement('canvas'),

          width = Img.width,
          height = Img.height;
        canvas.width = width;
        // console.log(width)
        // console.log(height)
        canvas.height = height;
        let context = canvas.getContext('2d');
        //压缩完成执行回调
        context.drawImage(Img, 0, 0, width, height);
        let data = canvas.toDataURL('image/jpeg', 0.7);
        vueData.push(data);
      }
    } catch (e) {
      console.log("压缩失败!");
      vueData.push(fileObj);
      //调用直接上传方式  不压缩
      // uploadFile(name,fileObj);
    }
  }
};

aliOss.uploadFile = function (name, vueDataList, aliOssResult = 'moren') {

  function date() {
    let tims = new Date().getTime();
    let nums1 = Math.random() * 10;
    let nums2 = Math.random() * 10;
    let nums3 = Math.random() * 10;

    return tims + nums1 + nums2 + nums3
  }

  Indicator.open('上传中 请稍等...');
  return new Promise(function (resolve) {
    let client = new OSS({
      endpoint: 'oss-cn-hangzhou.aliyuncs.com',
      region: 'frontend2.oss-cn-hangzhou.aliyuncs.com',
      accessKeyId: 'LTAIr7Wg5qXL2crB',
      accessKeySecret: 'PchxY1WBvD5QPiG9Nfj0svWOnCWpEy',
      bucket: 'frontend2'
    });

    async function input() {
      try {
        let result = [];
        for (let i = 0; i < vueDataList.length; i++) {
          let tims = date();
          let data = await client.put(name + tims + vueDataList[i].name, vueDataList[i]);
          result.push(data);
        }
        Indicator.close();
        resolve(result);
      } catch (e) {
        console.log(e);
      }
    }

    input();


  });
};


export default aliOss;
