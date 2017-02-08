var express = require('express');
var router = express.Router();
var imageObj = require('../app/models/image');
var fs = require("fs");
/* GET home page. */
router.get('/readFiles/:path*?', function(req, res, next) {

	if(!req.params.path) req.params.path='';
  	readImage(req.params.path,req.params.filter,function(err,data){
  		res.json({status:200,data:data})
  	})
});

router.get('/archivedImages', function(req, res, next) {

  	readArchivedImage(function(err,data){
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


router.post("/verify/:id",function(req,res){
  var id = req.params.id ; 

  imageObj.update({_id:id},{$inc:{counter:1}}).exec(function(err, data) {
    if(err){
      if(err) res.status(401).json({error:err});
    }

      res.json({status:200,message:"success",data:data});

  });
})

function readArchivedImage(cb){
	imageObj.find({isArchive:true}).exec(function(err, data) {

		if(err) return cb(err);
		var dataSend=[];
		data.forEach(function(value){
			dataSend.push({
				id:value.id,
				folder: 'archived',
				type: 'file',
				filename : value.title,
				base_path : "/assets/archived/",
				counter : value.counter

			})
		})
		cb(null,dataSend);
  	});
}

function readImage(path,filter,cb){
	var filterQuery={};
	filterQuery.isArchive=false;
	if(filter) {
		if(filter>2){
			filterQuery.counter={$gt:2};
		}else{
			filterQuery.counter=filter;
		}
	}else{
		filterQuery.counter={$gte:0};
	}	
	console.log(filterQuery)
	imageObj.find(filterQuery).exec(function(err, data) {

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
						base_path : "/assets/img/",
						counter : value.counter

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
						base_path : "/assets/img/"+value.folder+"/",
						counter : value.counter
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