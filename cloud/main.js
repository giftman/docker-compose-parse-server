const crypto = require('crypto')

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

Parse.Cloud.define("delUser", async (req,res) => {
	let sessionToken = req.user.get("sessionToken");
	if( !sessionToken) return {
		"message": "参数不齐"
	}
	let query = new Parse.Query(Parse.User);
	query.equalTo("objectId", req.params.id);
	query.limit(1);
	try {
		var objs = await query.find({useMasterKey: true});
		//Todo  管理员及创建者才可以继续修改 否则返回非法操作
		await objs[0].destroy({useMasterKey:true})
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
	query.descending("createdAt");
	query.select("name","idcard","atten_uid","sex","age","phone","education","address","person_detail","des","target_job","night_job","target_salary","percentage","job","workers","jobName");
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
		// var _workers = 0
		var _list = results[i].get('list') || {}
		for(let k in _list){
			// console.log(_list[k])
			for (let l in _list[k]){
				_month = _month + parseFloat(_list[k][l].calRevenue)
				_today = _today + parseFloat(_list[k][l].dayRevenue)
				// _workers = _workers + 1
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
		await results[i].save({total:_leiji.toFixed(2),monthTotal:_month.toFixed(2),today:_today},{useMasterKey: true})
	}
});

var totalPage = 1
var curPage = 0
Parse.Cloud.job("addRecord", async (req,res) => {
	var url = 'http://yun.kqapi.com' + '/Api/Api/recordlog'
	var params = {}
	params['account'] = '42f9c3daee78a0ced9c5ad8f446a7c85'
	params['requesttime'] = (new Date().getTime()/1000).toFixed(0)
	//params['start'] = '2020-02-07' 
	// params['end'] = '2020-01-16' 
	if(curPage < totalPage){
		curPage += 1
	}
	params['page'] = curPage 
	params = sign(params)
	var result =  await Parse.Cloud.httpRequest({
	  url: url,
	  params:params
	})

	var j = JSON.parse(result.text)
	totalPage = parseInt(j.data.totalpage)
	if(curPage >= totalPage){
		curPage -= 1
	}
	
	var kqapiRecords = j.data.attendata
	var Record = Parse.Object.extend("Record");
	const monthRecords = await getRecordDict()
	const kqUser = await getKQUsersDict()
	
	for(var i=(kqapiRecords.length - 1);i >= 0;i--){
		//不存在就写入
		if(typeof(monthRecords[kqapiRecords[i].atten_id])=="undefined"){
			if(typeof(kqUser[kqapiRecords[i].atten_uid])=="undefined"){
			  continue
			}
			let user = await kqUser[kqapiRecords[i].atten_uid].fetch()
			let ti = new Date(parseInt(kqapiRecords[i].atten_time + "000"))
			let status = user.get('status')
			let lastRecord = await getLastRecord(user)
			if(lastRecord){
			   var timePass = ti - lastRecord.get('time') 
			   //相差五分钟打卡状态会改变
			   if(Math.abs(timePass) > 1000*60*5){
			   	status = !status	
			   } 
			}else{
				status = true
			}
			let record = new Record()
			await record.save({
				'parent':user,
				'action':status,
				'time':ti,
				'timeString':formatDate(ti),
				'day':ti.getDate()+"",
				'atten_id':kqapiRecords[i].atten_id,
				'atten_uid':kqapiRecords[i].atten_uid,
			},{useMasterKey: true})

			//更新用户状态
			if(user){
				console.log('update user status')
				console.log(status)
				if(!status){
					//全部算完把上班状态改掉
					await user.save({'status':false},{useMasterKey:true})
				}else{
					let uptimes_dict = user.get('uptimes') || {}
					let day = ti.getDate()
					if(!uptimes_dict[day]){
						uptimes_dict[day] = 1
					}
					  await user.save({'status':true,'uptimes':uptimes_dict},{useMasterKey:true})
				}
			}
			//怕服务器受不了加个延时
			// sleep(1000);
		}
			
	}


});

Parse.Cloud.job("createRatoRevenue", async (req,res) => {
    var user = new Parse.User();
    user.id = '08haeUpjaY'
    await saveAllRato(user)
});
Parse.Cloud.define("createRatoRevenue", async (req,res) => {
    var user = new Parse.User();
    user.id = '08haeUpjaY'
    await saveAllRato(user)
});

Parse.Cloud.job("everydayResetNum", async (req,res) => {
	
	totalPage = 1
	curPage = 0
	let reports = await getAllReportDict()
	//每天凌晨开始重算每天收益
    for(let r in reports){
    	await reports[r].save({
    		todayuphours:0,
    	},{useMasterKey:true})
    }

    //每天算一下累计收入
    var Revenue = Parse.Object.extend("Revenue");
    var allRevenue = new Parse.Query(Revenue);
    //只算当月
    allRevenue.greaterThan("createdAt", getMonthStartDate());
    allRevenue.equalTo("month", getMonthTime());
    let _leiji = 0
	const results = await allRevenue.find({useMasterKey: true})
	for(var i=0;i < results.length;i++){
		//Todo累计是加上一个月的比较方便
		let _month = results[i].get('monthTotal') || 0
		var lastMonth = new Parse.Query(Revenue)
		lastMonth.equalTo('month', getMonthTime(true))
		lastMonth.equalTo('parent', results[i].get('parent'))

		let lastMonthRevenue = await lastMonth.first({useMasterKey:true})
		if(lastMonthRevenue){
			_leiji = (parseFloat(lastMonthRevenue.get('total'))||0)+ parseFloat(_month)
		}else{
			_leiji = _month
		}
		_leiji = _leiji + ''
		let _list = results[i].get('list') || {}
		for(let l in _list){
			if(_list[l].calRevenue){
				_list[l].dayRevenue  = 0
			}
		} 
		await results[i].save({total:_leiji,today:'0',list:_list},{useMasterKey: true})
	}
	
});
Parse.Cloud.job("everydayResetNotSaveTest", async (req,res) => {
	let reports = await getAllReportDict()
	//每天凌晨开始重算每天收益
    for(let r in reports){
    	await reports[r].save({
    		todayuphours:0,
    	},{useMasterKey:true})
    }

    //每天算一下累计收入
    var Revenue = Parse.Object.extend("Revenue");
    var allRevenue = new Parse.Query(Revenue);
    //只算当月
    allRevenue.greaterThan("createdAt", getMonthStartDate());
    allRevenue.equalTo("month", getMonthTime());
    let _leiji = 0
	const results = await allRevenue.find({useMasterKey: true})
	for(var i=0;i < results.length;i++){
		// console.log(results[i])
		//Todo累计是加上一个月的比较方便

		let _month = results[i].get('monthTotal') || 0
		var lastMonth = new Parse.Query(Revenue)
		lastMonth.equalTo('month', getMonthTime(true))
		lastMonth.equalTo('parent', results[i].get('parent'))

		let lastMonthRevenue = await lastMonth.first({useMasterKey:true})
		if(lastMonthRevenue){
			_leiji = (parseFloat(lastMonthRevenue.get('total'))||0)+ parseFloat(_month)
		}else{
			_leiji = _month
		}
		_leiji = _leiji + ''
		let _list = results[i].get('list') || {}
		for(let l in _list){
			if(_list[l].calRevenue){
				_list[l].dayRevenue  = 0
			}
		} 
		//console.log('total: ' + _leiji)
		outputObj(_list)
		//await results[i].save({total:_leiji,today:'0',list:_list},{useMasterKey: true})
	}
	//console.log('everydayResetTestNum End')
});

Parse.Cloud.job("everyMonthReset", async (req,res) => {
	//nothing now
	console.log('everyMonthResetNum End')
	//重置上班天数
	let allUser = await getAllUsers()
	for(let user of allUser){
		await user.save({'uptimes':{}},{useMasterKey:true})
	}
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
					try {
					// console.log('now is :' + user.id)
					let status = user.get('status') || false
					let worktime = user.get('worktime') 
					let job = user.get('job')
					let is_working_time = true
					if(worktime){
						let time_span = worktime.split('|')
						is_working_time = time_range(time_span[0],time_span[1])
						if(user.get('worknight') == true){
							is_working_time = time_range(time_span[0],'24:00') || time_range('00:00',time_span[1])
						}
						//帮忘记打卡的员工自动下班
						if(status === true && !is_working_time){
							if(time_range_is_over_four_hour(time_span[1])){
								console.log(user.id)
								console.log("is over 4 hours,auto reset to downtime")
								await user.save({'status':false},{useMasterKey:true})
								status = false
							}
						}
					}else{
						is_working_time = false
					}
	
					if(status === true 
						&& is_working_time 
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
						let user_cal_uptimes = Object.keys(user.get('uptimes') || {}).length
						report.save({
							todayuphours,
							uphours,
							calIncome: (uphours * job.get('dincome')/60).toFixed(2),
							uphoursString:mssToHours(uphours*60000)[0],
							uptimes:user_cal_uptimes
						},{useMasterKey: true})
	
	
						let parentsId = user.get('parents')
						// console.log(parentsId)
						for(let p of parentsId){
							// console.log(p)
							var _u = userDict[p]
							// console.log(_u)
	
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
							// console.log('----------------update HourRevenue Data------------')
							// console.log('hourRevenue:' + hourRevenue[user.id] + '|todayuphours:' + todayuphours + '|uphours:' + uphours)
							let dayRevenue = hourRevenue[user.id]*100000*todayuphours/(100000*60)
							let calRevenue = hourRevenue[user.id]*100000*uphours/(100000*60)
							let calData = {dayRevenue,calRevenue,name:user.get('name'),uptimes:user_cal_uptimes,parents:user.get('parents'),status:user.get('status'),jobName:job.get('name')}
							// console.log('----------------update HourRevenue Result------------')
							// console.log(calData)
							// console.log('----------------update HourRevenue Result End------------')
							revenue_list[user.id] = calData
							// }
							
							newRevenue.set('list',revenue_list)
							revenueDict[p] = newRevenue
	
						}
					}else{
						let parentsId = user.get('parents')
						for(let p of parentsId){
							let newRevenue
							if(revenueDict[p]){
								newRevenue = revenueDict[p]
								let revenue_list = newRevenue.get('list') || {}
								calData = revenue_list[user.id]
								if(calData){
									calData['status'] = false
									revenue_list[user.id] = calData
									newRevenue.set('list',revenue_list)
									revenueDict[p] = newRevenue
								}
							}
						}
					}
				} catch (error) {
					//console.log('now is :' + user.id)
					console.log(error.message)
				}
			}
			
			
			for (let r in revenueDict){
				var _today = 0
				var _month = 0
				var _list = revenueDict[r].get('list') || {}
				var origin_today_revenune = parseFloat(revenueDict[r].get('today'))

				for(let l in _list){
					if(_list[l].calRevenue){
						_month = _month + _list[l].calRevenue
						_today = _today + _list[l].dayRevenue
					}
				}
				// console.log('----------------update RevenueTotal Data------------')
				// console.log(_month,_today)
				// console.log('----------------After RevenueTotal ------------')
				let diff = (_today*100 - origin_today_revenune*100)/100
				await revenueDict[r].save({monthTotal:_month.toFixed(2),today:_today.toFixed(2),diff},{useMasterKey:true})
			}

});


function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

Parse.Cloud.afterSave("Record", async (req) => {
// if(req.user){

	
// 	if(!req.object.get('action')){
// 		//全部算完把上班状态改掉
// 	  	await req.user.save({'status':false},{useMasterKey:true})
// 	}else{
// 		let uptimes_dict = req.user.get('uptimes') || {}
// 		let day = req.object.get('time').getDate()
// 		if(!uptimes_dict[day]){
// 			uptimes_dict[day] = 1
// 		}
// 	  	await req.user.save({'status':true,'uptimes':uptimes_dict},{useMasterKey:true})
// 	}
// }
});

Parse.Cloud.beforeSave(Parse.User, async (req) => {
  //console.log('beforeSave User')
  const _user = req.object
  // console.log(req.object)
  const userId = req.object.get('idcard')
  var result = []
  let parents = []
  try{
	  	for (let i  of await getUsers(result,_user)){
		  	parents.push(i.id)
		  	// if(i.id === _user.get('parent').id){
		  	// 	console.log(userId)
		  		let wDict = i.get('workers') || {}
		  		if(!wDict[userId]){
		  			wDict[userId] = 1
		  			await i.save({workers:wDict},{useMasterKey:true})
		  		}
			// }
		}
		req.object.set('parents',parents)
	}catch(e){
		console.log(e.message)
	}
 //console.log('End beforeSave User')
  
});

Parse.Cloud.beforeDelete(Parse.User, async (req) => {
  let _user = req.object
  let result = []
  try {
  		for (let i  of await getUsers(result,_user)){
		  	// if(i.id === _user.get('parent').id){
		  	// 	console.log(userId)
		  		let wDict = i.get('workers') || {}
		  		let idcard = _user.get('idcard')
		  		if(wDict[idcard]){
		  			delete wDict[idcard]
		  			await i.save({workers:wDict},{useMasterKey:true})
	  			}
			// }
		}
  }catch(e) {

  }
});

async function getAllReportDict(){
	var Report = Parse.Object.extend("Report");
	let newReport = new Report()
	let query_report = new Parse.Query(newReport);
	query_report.equalTo("month", getMonthTime());
	query_report.limit(1000)
	let reports = await query_report.find({useMasterKey: true})

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

async function getRecordDict(){
	let recordDict = {}

	var Record = Parse.Object.extend("Record");
	let newRecord = new Record()
    	let record_query = new Parse.Query(newRecord);
	record_query.greaterThan("time", getMonthStartDate());
	let records = await record_query.find({useMasterKey: true})

	for(let record of records){
		recordDict[record.get('atten_id')] = record
	}
	return recordDict
}
async function getLastRecord(user){
	let recordDict = {}

	var Record = Parse.Object.extend("Record");
	let newRecord = new Record()
    	let record_query = new Parse.Query(newRecord);
	record_query.greaterThan("time", getMonthStartDate());
	record_query.equalTo("parent", user);
	record_query.descending("time");
	let record = await record_query.first({useMasterKey: true})

	return record
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

async function getKQUsersDict(){
	const allUser = await getAllUsers()

	let userDict = {}

	for(let user of allUser){
		userDict[user.get('atten_uid')] = user
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

     var b = new Date()
     var e = new Date ();
     var n = new Date ();

     b.setHours (strb[0]);
     b.setMinutes (strb[1]);
     e.setHours (stre[0]);
     e.setMinutes (stre[1]);
     // console.log(b)
     // console.log(n)
     // console.log(e)
     if (n.getTime () - b.getTime () > 0 && n.getTime () - e.getTime () < 0) {
         return true;
     } else {
     	 
         // console.log("now time is " + n.getHours () + ":" + n.getMinutes () + ",not in the range");
         return false;
     }
}

function time_range_is_over_four_hour(endTime) {

     var stre = endTime.split (":");
     if (stre.length != 2) {
         return false;
     }
     var e = new Date ();
     var n = new Date ();
	 
     e.setHours (stre[0]);
	 e.setMinutes (stre[1]);
	 if(stre[0] == "24"){
		 e.setHours(0)
	 }
     //过半小时自动下班
     if (n.getTime () - e.getTime () - 1000*60*60/2 > 0) {
         return true;
     } else {
         // console.log("now time is " + n.getHours () + ":" + n.getMinutes () + ",not in the range");
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
	// console.log('----------------It have these workers------------')
	// console.log(child_user_list)
 //    console.log('createRatoRevenue')
	let jobs = await getJobDict()
	for(let i of child_user_list){
		// console.log('------user id ----' + i.id + '-------------user id------')
		if(i.get('job')){
			if(jobs[i.get('job').id]){
				let jobRevenue = jobs[i.get('job').id].get('revenue')
				await saveRato(i,jobRevenue)
			}else{
				console.log('err not job here')
			}
		}
	}
}

//user should be a worker
async function saveRato(user,jobRevenue){
			let result = []
			result = await getUsers(result,user)
			// console.log('-------user id ------------')
			// console.log(user.id)
			// console.log('----------------It have these parents------------')
			// console.log(result)
			// console.log('----------------Begin Cal------------')
			//计算 revenue 并保存到父user,自己下面没有工人是没有Revenue的
			const userId = user.id + ""
			//如果只有一个爷级是管理员
			if(result.length === 1){
				let revenue_list = result[0].get('hourRevenue') || {}
				revenue_list[userId] = jobRevenue
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
					// console.log('revenue:' + hourRevenue + '|rato:' + rato )

					let revenue_list = _u.get('hourRevenue') || {}
					revenue_list[userId] = hourRevenue
					// }
					// console.log('----------------End------------')
					// console.log('-------revenue_list------------')
					// console.log(revenue_list)
					// console.log('-------parent id ------------')
					// console.log(_u.id)
					// console.log('-------user id ------------')
					// console.log(userId)
					// console.log('----------------End------------')
					// newRevenue.set('hourRevenue',revenue_list)
					await _u.save({'hourRevenue':revenue_list},{useMasterKey:true})
					user = _u
				}
			}
			
		
}
function outputObj(obj) {
	var description = "";
	for (var i in obj) {
		description += i + " = " + obj[i]['calRevenue'] + "|" + obj[i]['name']+ "|" + obj[i]['uptimes']+ "|" + obj[i]['status'] + "\n";
	}
	console.log(description)
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

//获得本月的开端日期时间
function formatDate(date){
	var hours = padDate(date.getHours());
    var minutes = padDate(date.getMinutes());
    var seconds = padDate(date.getSeconds());
    //整理数据并返回
    return hours+':'+minutes+':'+seconds;
}

function padDate(value){
	return value<10?'0'+value:value;
}


function sign(params){
	var _signString = ""
	Object.keys(params).sort().forEach(function(key) {
	  _signString = _signString + params[key] 
	});
	_signString = _signString + "ygz123"
	params['sign'] = md5Hash(_signString)
	return params
}

function md5Hash(str) {

  return crypto.createHash('md5')
    .update(str)
    .digest('hex');
}
