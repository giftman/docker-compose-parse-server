Parse.Cloud.define('hello', function(req, res) {
  return {
		"code": 200,
		"message": "hello man"
	}
});
var auto = require("./auto.js"); // 用户
Parse.Cloud.afterSave("Record", auto.afterRecord)
Parse.Cloud.beforeSave(Parse.User,auto.beforeUserSave)





async function saveAllRato(user){
	var child_user_list = await getChildUser(user)
	console.log('----------------It have these workers------------')
	console.log(child_user_list)
    console.log('createRatoRevenue')
	let jobs = await getJobDict()
	for(let i of child_user_list){
		if(i.get('job')){
			let jobRevenue = jobs[i.get('job').id].get('revenue')
			await saveRato(i,jobRevenue)
		}
	}
}

//user should be a worker
async function saveRato(user,jobRevenue){
			let result = []
			result = await getUsers(result,user)
			console.log('-------user id ------------')
			console.log(user.id)
			console.log('----------------It have these parents------------')
			console.log(result)
			console.log('----------------Begin Cal------------')
			//计算 revenue 并保存到父user,自己下面没有工人是没有Revenue的
			const userId = user.id + ""
			//如果只有一个爷级是管理员
			if(result.length === 1){
				let revenue_list = result[0].get('hourRevenue') || {}
				revenue_list[userId] = jobRevenue
				// newRevenue.set('hourRevenue',revenue_list)
				await result[0].save({'hourRevenue':revenue_list},{useMasterKey:true})
			}else{
				while(result.length){
					//中间级的收益需要把下家的分掉
					let _u = result.shift()
					let rato = parseFloat(_u.get('percentage') || 1)
					for(var i = 0 ;i < result.length;i++){
						rato = rato*100 * parseFloat(result[i].get('percentage') || 1) /100
					}
					//最后的管理员是取其余部分
					if(!result.length){
						rato = (100 - parseFloat(user.get('percentage')*100 || 0))/100
					}
					//营收 等于 岗位营收 * 多级分成 * 时间
					let hourRevenue = (jobRevenue*100 * rato*100 )/10000
					console.log('revenue:' + hourRevenue + '|rato:' + rato )

					let revenue_list = _u.get('hourRevenue') || {}
					revenue_list[userId] = hourRevenue
					// }
					console.log('----------------End------------')
					console.log('-------revenue_list------------')
					console.log(revenue_list)
					console.log('-------parent id ------------')
					console.log(_u.id)
					console.log('-------user id ------------')
					console.log(userId)
					console.log('----------------End------------')
					// newRevenue.set('hourRevenue',revenue_list)
					await _u.save({'hourRevenue':revenue_list},{useMasterKey:true})
					user = _u
				}
			}
			
		
}