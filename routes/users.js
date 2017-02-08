var express = require('express');
var router = express.Router();
var imageObj = require('../app/models/image');
var fs = require("fs");
/* GET home page. */
router.get('/readFiles/:path*?', function(req, res, next) {

	if(!req.params.path) req.params.path='';
  	readImage(req.params.path,function(err,data){
  		res.json({status:200,data:data})
  	})
});


router.delete("/delete/:filename/:folder*?", function(req, res, next) {

	if(!req.params.folder){
		req.params.folder='';
	}

	var newPath = "public/assets/archived/"+req.params.filename;

	var oldPath = "public/assets/img/"+req.params.folder+"/"+req.params.filename;

	imageObj.update({_id:req.query.id},{$set:{isArchive:true,counter:0}}).exec(function(err, data) {

		if(err) res.status(404).json({error:err});

		imageObj.update({folder:req.params.folder,isArchive:false},{$inc:{counter:1}},{multi:true}).exec(function(err, data) {

			if(err) res.status(404).json({error:err});

			move(oldPath,newPath,function(err,data){
				if(err) res.status(404).json({error:err});

				res.json({status:200,message:"success"});
			})
		});
	});


});

function readImage(path,cb){
	imageObj.find({isArchive:false}).exec(function(err, data) {

		if(err) return cb(err);
		var dataSend=[];
		var flagCheck=0;
		data.forEach(function(value){
			if(path==''){
				if(value.folder==''){
					dataSend.push({
						id:value.id,
						folder: '',
						type: 'file',
						filename : value.title,
						base_path : "/assets/img/"

					});
				}else{
					if(!flagCheck){
						dataSend.push({
							folder: value.folder,
							type: 'folder',
							filename : value.title,
							base_path : "/assets/img/"+value.folder+"/"
						});
						flagCheck++;	
					}
				}

			}else{
				if(value.folder=='sub_folder'){
					dataSend.push({
						id:value.id,
						folder: value.folder,
						type: 'file',
						filename : value.title,
						base_path : "/assets/img/"+value.folder+"/"
					});
				}	
			}
		});
		cb(null,dataSend);
		
  	});
}


function move(oldPath, newPath, callback) {

	 function copy() {

        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

}

module.exports = router;