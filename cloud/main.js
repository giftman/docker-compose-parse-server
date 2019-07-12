Parse.Cloud.define('hello', function(req, res) {
  return {
		"code": 200,
		"message": "hello man"
	}
});


Parse.Cloud.define("updateUser", async (req,res) => {
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
});

Parse.Cloud.define("getMyUser", async (req,res) => {
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
});

Parse.Cloud.define("changePassword", async (req,res) => {
	//params {'oldPassword','newPassWord'}
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
});

Parse.Cloud.define("request", async (req,res) => {
	var url = req.params.url
   var result =  await Parse.Cloud.httpRequest({
	  url: url
	})
   return result.text
});

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

Parse.Cloud.job("calRevenue", async (req,res) => {
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
			let reportDict = await getAllReportDict()
			let revenueDict = await getRevenueDict()
			let jobDict = await getJobDict()
			for(let user of allUser){
				let status = user.get('status')
				let worktime = user.get('worktime')
				let job = user.get('job')
				let time_span = worktime.split('|')
				// let is_working_time = time_range(time_span[0],time_span[1])
				if(status === true 
					// && is_working_time 
					&& job){
					console.log('-------user ------------')
					console.log(user)
					console.log('----------------Begin Update Report------------')
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
					let uphours = report.get('uphours') + 1
					let todayuphours = report.get('todayuphours') + 1
					console.log('----------------update Report Data------------')
					console.log({
						todayuphours,
						uphours,
						calIncome: uphours * job.get('dincome')/60,
						uphoursString:mssToHours(uphours)[0]
					})
					console.log('----------------Begin Update Report------------')
					report.save({
						todayuphours,
						uphours,
						calIncome: uphours * job.get('dincome')/60,
						uphoursString:mssToHours(uphours)[0]
					},{useMasterKey: true})


					let parentsId = user.get('parents')
					console.log('-------parentsId ------------')
					console.log(parentsId)
					console.log('----------------Begin Update Revenue------------')
					for(let p in parentsId){
						var _u = userDict[p]
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

						let calData = {dayRevenue,calRevenue,uptimes:report.get('uptimes')}
						if(!revenue_list[user.id]){
							revenue_list[user.id] = {}
						}
						let dayRevenue = _u.get('revenue')[user.id]*100000*todayuphours/100000
						let calRevenue = _u.get('revenue')[user.id]*100000*uphours/100000

						revenue_list[_u.id][user.id] = calData
						// }
						
						newRevenue.set('list',revenue_list)
						revenueDict[p] = newRevenue
					}
				}
			}
			console.log('-------after update Revenue ------------')
			console.log(revenueDict)
			console.log('----------------End------------')
			for (let r in revenueDict){
				await revenueDict[r].save(null,{useMasterKey:true})
			}

});

Parse.Cloud.job("updateRevenueOneHour", async (req,res) => {
	var allUserQuery = new Parse.Query(Parse.User);
    allUserQuery.limit(10000)
	// results has the list of users with a hometown team with a losing record
	const allUser = await allUserQuery.find({useMasterKey: true});

	let userDict = {}
	let revenueDict = {}
	let reportDict = {}

	for(let user in allUser){
		userDict[user.id] = user
	}

	var Revenue = Parse.Object.extend("Revenue");
	let newRevenue = new Revenue()
    let revenue_query = new Parse.Query(newRevenue);
	revenue_query.equalTo("month", getMonthTime());
	let revenue_record = await revenue_query.find({useMasterKey: true})

	for(let revenue in revenue_record){
		revenueDict[revenue.get('parent').id] = revenue
	}



	for(let user in allUser){
		if(user.get('status' == true)){
			let parentsId = user.get('parents')
			for(let p in parentsId){
				var _u = userDict[p]

				if(revenueDict[p]){
					newRevenue = revenueDict[p]
				}else{
					newRevenue = new Revenue()
					newRevenue.set('parent',_u)
					newRevenue.set('month',getMonthTime())
				}
				let revenue_list = newRevenue.get('list') || {}
				if(!revenue_list[user.id]){
					revenue_list[user.id] = {}
				}
				let calData = {dayRevenue,calRevenue,parentName:user.get('name'),parentId:user.id,id:origin_user.id,name:origin_user.get('name'),uptimes:cal.uptimes}
				if(user.id == origin_user.id){
					calData.uptimes = cal.uptimes
				}
				// 	revenue_list[user.id] = calData
				// }else{
				revenue_list[user.id][origin_user.id] = calData
				// }
				
				newRevenue.set('list',revenue_list)
				await newRevenue.save(null,{useMasterKey:true})
			}
		}
	}



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

function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

Parse.Cloud.afterSave("Record", async (req) => {
 var cal = {
		// "parent":Parse.User.current(),
		"uptimes":0,
		"downtimes":0,
		"uphours":0,
		"month":"",
		"calIncome":0
  }
  if(!req.object.get('action')){
	  let user = await req.object.get('parent').fetch()
	  const origin_user = user
	  const query = new Parse.Query("Record");
	  query.greaterThan("createdAt", getMonthStartDate());
	  query.equalTo("parent", user);
	  let uptimes = []
	  let listByDay = {}
	  let todayUpHours = 0

	  try {
			var results = await query.find({useMasterKey: true});
			// console.log('cal_work_hours' + results.length)
			for (let i = 0; i < results.length; i++) {
					let record = results[i]
					//上班打卡算一次，app是每天只给上班打一次卡
					if(record.get('action')){
						uptimes.push(1)
					}
						if(!listByDay[record.get('day')]){
							listByDay[record.get('day')] = []
						}
						listByDay[record.get('day')].push(record)
				}
			cal.uptimes = uptimes.length;
			cal.downtimes = new Date().getDate()  - cal.uptimes
			let sum = 0;

			for(let k in  listByDay){
				if(listByDay[k].length % 2 == 0){
					let time = listByDay[k][1].get('time') - listByDay[k][0].get('time')
					// console.log('cal_work_hours: add time|' + time)
					sum = sum + time
					if(k == new Date().getDate()){
						todayUpHours = time/(1000 * 60 * 60)
					}
				}
			}
			console.log('cal_work_hours: sum|' + sum)

			let hours = mssToHours(sum)
			cal.uphours= hours[0]
			cal.month = getMonthTime()
			let uphours = hours[1]/60
			//save report 
			// let user = req.user
			const job = user.get('job')
			if(job){
				await job.fetch();
				cal.calIncome= uphours * job.get('dincome')
				cal.calIncome = cal.calIncome.toFixed(2)
			}
			else
			{
				cal.calIncome = '请管理员设置工作岗位'
			}
			


			//先这样存 决断下月的有没有，没有就新建一份
			var Report = Parse.Object.extend("Report");
			let newReport = new Report()
			// Parse.Object.registerSubclass('Report', Report);

			let reports = new Parse.Query(newReport);
			reports.equalTo("parent", user);
			reports.equalTo("month", cal.month);
			let report = await reports.first({useMasterKey: true})
				if(report){
					newReport = report
				}else{
					newReport.set('parent',user)
				}

		    console.log(cal)
			await newReport.save({...cal},{useMasterKey:true})


			//Todo 算revenue
			let jobRevenue = job.get('revenue')
			let result = []
			result = await getUsers(result,user)
			console.log(result)

			//计算 revenue 并保存到父user,自己下面没有工人是没有Revenue的
			let xieyijifengcheng = 0;
			while(result.length){
				//中间级的收益需要把下家的分掉
				let _u = result.shift()
				let rato = parseFloat(_u.get('percentage') || 1)
				for(var i = 0 ;i < result.length;i++){
					rato = rato * parseFloat(result[i].get('percentage') || 1)
				}
				//最后的管理员是取其余部分
				if(!result.length){
					rato = 1 - parseFloat(user.get('percentage') || 0)
					rato = rato.toFixed(3)
				}else{
					rato = rato*(1 - parseFloat(user.get('percentage') || 0))
					rato = rato.toFixed(3)
				}
				//营收 等于 岗位营收 * 多级分成 * 时间
				let calRevenue = (jobRevenue * rato * uphours)
				let dayRevenue = (jobRevenue * rato * todayUpHours)
				console.log('revenue:' + jobRevenue + '|rato:' + rato + '|uphours:' + uphours)
				console.log('calRevenue:')
				console.log(calRevenue)
				

				// let revenue = _u.get('revenue') || {}
				// revenue[user.id] = {dayRevenue,calRevenue,name:user.get('name'),uptimes:cal.uptimes,id:user.id}
				// _u.set('revenue', revenue)
				// let workers_up = _u.get('uptimes') || 0
				// await _u.save({uptimes: workers_up + 1},{useMasterKey: true})
				// await _u.save(null,{useMasterKey:true})

				//换成存Revenue
				var Revenue = Parse.Object.extend("Revenue");
				let newRevenue = new Revenue()
				// Parse.Object.registerSubclass('Report', Report);

				let revenue_query = new Parse.Query(newRevenue);
				revenue_query.equalTo("parent", _u);
				revenue_query.equalTo("month", cal.month);
				let revenue_record = await revenue_query.first({useMasterKey: true})
					if(revenue_record){
						newRevenue = revenue_record
					}else{
						newRevenue.set('parent',_u)
						newRevenue.set('month',cal.month)
					}
				let revenue_list = newRevenue.get('list') || {}
				
				// if(revenue_list[user.id]){
				// 	calRevenue = ((parseFloat(revenue_list[user.id].calRevenue) || 0)+ calRevenue).toFixed(2)
				// 	dayRevenue = ((parseFloat(revenue_list[user.id].dayRevenue) || 0)+ dayRevenue).toFixed(2)
				// }else{
				calRevenue = calRevenue.toFixed(2)
				dayRevenue = dayRevenue.toFixed(2)
				// }
				if(!revenue_list[user.id]){
					revenue_list[user.id] = {}
				}
				let calData = {dayRevenue,calRevenue,parentName:user.get('name'),parentId:user.id,id:origin_user.id,name:origin_user.get('name'),uptimes:cal.uptimes}
				if(user.id == origin_user.id){
					calData.uptimes = cal.uptimes
				}
				// 	revenue_list[user.id] = calData
				// }else{
				revenue_list[user.id][origin_user.id] = calData
				// }
				
				newRevenue.set('list',revenue_list)
				await newRevenue.save(null,{useMasterKey:true})

				user = _u
			}
		} catch(e) {

		}
	//全部算完把上班状态改掉
  	await req.user.save({'status':false},{useMasterKey:true})
}else{
  	await req.user.save({'status':true},{useMasterKey:true})
}
});

Parse.Cloud.beforeSave(Parse.User, async (req) => {
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
  for (let i  of await getUsers(result,_user)){
  	parents.push(i.id)
  }
  req.object.set('parents',parents)
});

async function getAllReportDict(){
	var Report = Parse.Object.extend("Report");
	let newReport = new Report()
	let query_report = new Parse.Query(newReport);
	query_report.equalTo("month", getMonthTime());
	query_report.limit(1000)
	let reports = await reports.find({useMasterKey: true})

	let reportDict = {}
	for(let report of reports){
		reportDict[report.get('parent').id] = report
	}
	return reportDict
}

async function getRevenueDict(){
	let revenueDict = {}

	var Revenue = Parse.Object.extend("Revenue");
	let newRevenue = new Revenue()
    let revenue_query = new Parse.Query(newRevenue);
	revenue_query.equalTo("month", getMonthTime());
	let revenue_record = await revenue_query.find({useMasterKey: true})

	for(let revenue of revenue_record){
		revenueDict[revenue.get('parent').id] = revenue
	}
	return revenueDict
}

async function getJobDict(){
	let jobDict = {}
	var Vocation = Parse.Object.extend("Vocation");
	let job = new Vocation()
	let job_query = new Parse.Query(job);
	let jobs = await job_query.find({useMasterKey: true})
	for(let job of jobs){
		jobDict[job.id] = job
	}
	return jobDict
}

async function getAllUsersDict(){
	const allUser = await getAllUsers()

	let userDict = {}

	for(let user of allUser){
		userDict[user.id] = user
	}

	return userDict
}

async function getAllUsers(){
	var allUserQuery = new Parse.Query(Parse.User);
    allUserQuery.limit(10000)
	// results has the list of users with a hometown team with a losing record
	const allUser = await allUserQuery.find({useMasterKey: true});

	return allUser
}


async function getUsers(result,user){
	if(user.get('parent')){
		let parentUser = await user.get('parent').fetch()
		result.push(parentUser)
		return await getUsers(result,parentUser)
	}else{
		return result
	}
}

function time_range(beginTime, endTime) {
     var strb = beginTime.split (":");
     if (strb.length != 2) {
         return false;
     }

     var stre = endTime.split (":");
     if (stre.length != 2) {
         return false;
     }

     var b = new Date ();
     var e = new Date ();
     var n = new Date ();

     b.setHours (strb[0]);
     b.setMinutes (strb[1]);
     e.setHours (stre[0]);
     e.setMinutes (stre[1]);

     if (n.getTime () - b.getTime () > 0 && n.getTime () - e.getTime () < 0) {
         return true;
     } else {
         alert ("当前时间是：" + n.getHours () + ":" + n.getMinutes () + "，不在该时间范围内！");
         return false;
     }
}

async function getChildUser(user){
	var query = new Parse.Query(Parse.User);
	query.equalTo("parents", user.id);
	query.limit(10000)
	var child_user_list = await query.find({useMasterKey: true})
	return child_user_list
}


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

function getMonthTime(lastMonth){
	var now = new Date(); //当前日期
// var nowDayOfWeek = now.getDay(); //今天本周的第几天
// var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
if(!lastMonth){
	nowMonth = nowMonth + 1
}
var nowYear = now.getFullYear(); //当前年
if(lastMonth && nowMonth == 0){
	nowYear = nowYear - 1
	nowMonth = 12
}
return nowYear + "-" + nowMonth;
}

function mssToHours(mss){
	var hours = parseInt((mss) / (1000 * 60 * 60));
	var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
	return [hours + "小时" + minutes + "分钟",hours*60+minutes]
}

//获得本月的开端日期时间
function getMonthStartDate(){
	var now = new Date(); //当前日期
// var nowDayOfWeek = now.getDay(); //今天本周的第几天
// var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年

var monthStartDate = new Date(nowYear, nowMonth, 1);
return monthStartDate;
}