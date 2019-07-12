'use strict';
async function updateUser (req,res) {
   let userId = req.params.id

	// sessionToken = req.user.get("sessionToken");
	// if(!userId || !sessionToken) return {
	// 	"message": "参数不齐"
	// }

	let query = new Parse.Query(Parse.User);
	query.equalTo("objectId", userId);
	// query.equalTo("parent", req.user);
	query.limit(1);
	try {
		var objs = await query.find({useMasterKey: true});
		//Todo  管理员及创建者才可以继续修改 否则返回非法操作
		if(typeof req.params.job == "string"){
			var Vocation = Parse.Object.extend("Vocation");
		  	let newJob = new Vocation()
		  	newJob.id = req.params.job
		  	req.params.job = newJob
		  	await newJob.fetch()
		  	if(objs[0].get('worknight') === true){
		  		req.params.worktime = newJob.get('ntime')
		  	}else{
		  		req.params.worktime = newJob.get('dtime')
		  	}
		 }
		await objs[0].save({...req.params},{useMasterKey:true})
	} catch(e) {
		return e.message
	}
	return 1
}

async function getMyUser  (req,res)  {
    let userId = req.user.id

	let sessionToken = req.user.get("sessionToken");
	if(!userId || !sessionToken) return {
		"message": "参数不齐"
	}

	let query = new Parse.Query(Parse.User);
	query.equalTo("parents", userId);
	query.select("name","idcard","sex","age","phone","education","address","person_detail","des","target_job","night_job","target_salary","percentage","job");
	query.limit(300);
	try {
		var objs = await query.find({useMasterKey: true});
		return objs
	} catch(e) {
		return e.message
	}
}

async function  changePassword (req,res)  {
	//params {'oldPassword','newPassWord'}
	console.log('changePassword')
	let userId = req.user.id
	let sessionToken = req.user.get("sessionToken");
	if(!userId || !sessionToken) return {
		"message": "参数不齐"
	}

	let user = await req.user.fetch()
	console.log(user)
	console.log(user.get('password'))
	console.log(req.params)
	user.setPassword(req.params.newPassWord);
	await user.save(null,{useMasterKey:true})
	return 1
}

async function  request (req,res)  {
	var url = req.params.url
   var result =  await Parse.Cloud.httpRequest({
	  url: url
	})
   return result.text
}

module.export ={
	'changePassword':changePassword,
	'getMyUser':getMyUser,
	'updateUser':updateUser,
}