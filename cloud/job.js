

Parse.Cloud.job("clearUser", async (req,res) => {
    var allUser = new Parse.Query(Parse.User);
    allUser.limit(10000)
	// results has the list of users with a hometown team with a losing record
	const results = await allUser.find({useMasterKey: true});
	for(var i=0;i < results.length;i++){
		if(results[i].get('username') != 'admin'){
			await results[i].destroy({useMasterKey: true})
		}
	}
});

Parse.Cloud.job("clearTestData", async (req,res) => {
    var Record = Parse.Object.extend("Record");
    var Report = Parse.Object.extend("Report");
    var Revenue = Parse.Object.extend("Revenue");
    var _all = new Parse.Query(Record);
    _all.limit(10000)
	// results has the list of users with a hometown team with a losing record
	let results = await _all.find({useMasterKey: true});
	console.log('clear Record:' + results.length)
	for(var i=0;i < results.length;i++){
		await results[i].destroy({useMasterKey: true})
	}
	 _all = new Parse.Query(Report);
    _all.limit(10000)
	// results has the list of users with a hometown team with a losing record
	results = await _all.find({useMasterKey: true});
	console.log('clear Report:' + results.length)
	for(var i=0;i < results.length;i++){
		await results[i].destroy({useMasterKey: true})
	}
	 _all = new Parse.Query(Revenue);
    // _all.limit(10000)
	// results has the list of users with a hometown team with a losing record
	results = await _all.find({useMasterKey: true});
	console.log('clear Revenue:' + results.length)
	for(var i=0;i < results.length;i++){
		await results[i].destroy({useMasterKey: true})
	}

});

Parse.Cloud.job("mockDcard", async (req,res) => {
    var allUser = new Parse.Query(Parse.User);
    allUser.greaterThan("idcard","50000")
    // allUser.limit(2)

    var Record = Parse.Object.extend("Record");
    var day = new Date().getDate()
    var upString = new Date().getFullYear() +'/' +new Date().getMonth() + '/day 09:30:00' 
    var downString = new Date().getFullYear() +'/' +new Date().getMonth() + '/day 18:30:00' 
	// results has the list of users with a hometown team with a losing record
	const results = await allUser.find({useMasterKey: true});
	for(var i=0;i < results.length;i++){
		console.log(results[i].get('username'))
		for(let j = 1;j <= day;j++){
			let record = new Record()
			await record.save({
				'parent':results[i],
				'action':true,
				'time':new Date(upString.replace('day',day)),
				'timeString':'测试09:30',
				'day':j+""
			},{useMasterKey: true})
			//怕服务器受不了加个延时
			sleep(1000);
			let record2 = new Record()
			await record2.save({
				'action':false,
				'parent':results[i],
				'time':new Date(downString.replace('day',day)),
				'timeString':'测试18:30',
				'day':j+""
			},{useMasterKey: true})
		}
	}
});

Parse.Cloud.define("calRevenue", async (req,res) => {
    var Revenue = Parse.Object.extend("Revenue");
    var allRevenue = new Parse.Query(Revenue);
    //只算当月
    allRevenue.greaterThan("createdAt", getMonthStartDate());
    
    const results = await allRevenue.find({useMasterKey: true})
	for(var i=0;i < results.length;i++){
		// console.log(results[i])

		var _today = 0
		var _leiji = 0
		var _month = 0
		var _workers = 0
		var _list = results[i].get('list') || {}
		_workers = 0
		for(let k in _list){
			// console.log(_list[k])
			for (let l in _list[k]){
				_month = _month + parseFloat(_list[k][l].calRevenue)
				_today = _today + parseFloat(_list[k][l].dayRevenue)
				_workers = _workers + 1
			}
			
		}
		//Todo累计是加上一个月的比较方便
		var lastMonth = new Parse.Query(Revenue)
		lastMonth.equalTo('month', getMonthTime(true))
		lastMonth.equalTo('parent', results[i].get('parent'))
		lastMonthRevenue = await lastMonth.first({useMasterKey:true})
		if(lastMonthRevenue){
			_leiji = (parseFloat(lastMonthRevenue.get('total'))|| 0)+ _month

		}else{
			_leiji = _month
		}
		await results[i].save({total:_leiji.toFixed(2),monthTotal:_month.toFixed(2),today:_today,workers:_workers},{useMasterKey: true})
	}
});

Parse.Cloud.job("createRatoRevenue", async (req,res) => {
    var user = new Parse.User();
    user.id = 'DFjpXUZ6xd'
    await saveAllRato(user)
});

Parse.Cloud.job("updateReportWorkTimeOneMinute", async (req,res) => {
    		//先这样存 决断下月的有没有，没有就新建一份
			let allUser = await getAllUsers()
			let userDict = {}

			for(let user of allUser){
				userDict[user.id] = user
			}

			let reportDict = await getAllReportDict()
			let revenueDict = await getRevenueDict()
			let jobDict = await getJobDict()
			console.log('updateReportWorkTimeOneMinute')
			for(let user of allUser){
				let status = user.get('status') || false
				let worktime = user.get('worktime') 
				let job = user.get('job')
				// let time_span = worktime.split('|')
				// console.log(time_span)
				// let is_working_time = time_range(time_span[0],time_span[1])
				if(status === true 
					// && is_working_time 
					&& job){
					job = jobDict[job.id]
					let report
					if(reportDict[user.id]){
						report = reportDict[user.id]
					}else{
						var Report = Parse.Object.extend("Report");
						report = new Report()
						report.set('parent',user)
						report.set('month',getMonthTime())
					}
					//uphours 单位分钟
					let uphours = (report.get('uphours') || 0) + 1
					let todayuphours = (report.get('todayuphours')||0) + 1
					report.save({
						todayuphours,
						uphours,
						calIncome: (uphours * job.get('dincome')/60).toFixed(2),
						uphoursString:mssToHours(uphours*60000)[0]
					},{useMasterKey: true})


					let parentsId = user.get('parents')
					console.log(parentsId)
					for(let p of parentsId){
						console.log(p)
						var _u = userDict[p]
						console.log(_u)

						let newRevenue
						if(revenueDict[p]){
							newRevenue = revenueDict[p]
						}else{
							var Revenue = Parse.Object.extend("Revenue");
							newRevenue = new Revenue()
							newRevenue.set('parent',_u)
							newRevenue.set('month',getMonthTime())
						}
						let revenue_list = newRevenue.get('list') || {}
						// if(!revenue_list[_u.id]){
						// 	revenue_list[user.id] = {}
						// }
						let hourRevenue = _u.get('hourRevenue') || {}
						console.log('----------------update HourRevenue Data------------')
						console.log('hourRevenue:' + hourRevenue[user.id] + '|todayuphours:' + todayuphours + '|uphours:' + uphours)
						let dayRevenue = hourRevenue[user.id]*100000*todayuphours/(100000*60)
						let calRevenue = hourRevenue[user.id]*100000*uphours/(100000*60)
						let calData = {dayRevenue,calRevenue}
						console.log('----------------update HourRevenue Result------------')
						console.log(calData)
						console.log('----------------update HourRevenue Result End------------')
						revenue_list[user.id] = calData
						// }
						
						newRevenue.set('list',revenue_list)
						revenueDict[p] = newRevenue

					}
				}
			}
			for (let r in revenueDict){
				var _today = 0
				var _month = 0
				var _list = revenueDict[r].get('list') || {}
				for(let l in _list){
					_month = _month + _list[l].calRevenue
					_today = _today + _list[l].dayRevenue
				}
				// console.log('----------------update RevenueTotal Data------------')
				// console.log(_month,_today)
				// console.log('----------------After RevenueTotal ------------')
				await revenueDict[r].save({monthTotal:_month.toFixed(2),today:_today.toFixed(2)},{useMasterKey:true})
			}

});


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
