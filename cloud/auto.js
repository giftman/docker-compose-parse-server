'use strict';
const Common = require('./common.js')

async function afterRecord (req) {
	if(!req.object.get('action')){
		  
		//全部算完把上班状态改掉
	  	await req.user.save({'status':false},{useMasterKey:true})
	}else{
	  	await req.user.save({'status':true,'uptimes':(req.user.get('uptimes') || 0) + 1},{useMasterKey:true})
	}
}

 async function  beforeUserSave(req) {
  console.log('beforeSave User')
  let _user = req.object
  var result = []
  let parents = []
  // if(typeof _user.get('job') == "string"){
  // 	var Vocation = Parse.Object.extend("Vocation");
		//   	let newJob = new Vocation()
  // 	newJob.id = _user.job
  // 	_user.set('job',newJob)
  // }
  for (let i  of await Common.getUsers(result,_user)){
  	parents.push(i.id)
  }
  req.object.set('parents',parents)
}

module.exports = {
  "afterRecord": afterRecord, // 获取指定位数字
  "beforeUserSave":beforeUserSave
}