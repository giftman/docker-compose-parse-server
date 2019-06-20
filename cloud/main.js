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
	query.equalTo("parent", req.user);
	query.limit(1);
	try {
		var objs = await query.find({useMasterKey: true});
		//Todo  管理员及创建者才可以继续修改 否则返回非法操作
		await objs[0].save({...req.params},{useMasterKey:true})
	} catch(e) {
		return e.message
	}
	return 1
});

Parse.Cloud.define("clearUser", async (req,res) => {
    var allUser = new Parse.Query(Parse.User);
	// results has the list of users with a hometown team with a losing record
	const results = await allUser.find({useMasterKey: true});
	console.log(results.length)
	for(var i=0;i < results.length;i++){
		if(results[i].get('username') != 'admin'){
			await results[i].destroy({useMasterKey: true})
		}
	}
});

Parse.Cloud.define("mockDcard", async (req,res) => {
    var allUser = new Parse.Query(Parse.User);
    allUser.greaterThan("idcard","50000")
    allUser.limit(1)

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
			sleep(200);
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
	  const origin_user_id = user.id
	  const query = new Parse.Query("Record");
	  query.greaterThan("createdAt", getMonthStartDate());
	  query.equalTo("parent", user);
	  let uptimes = []
	  let listByDay = {}

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
				let calRevenue = (jobRevenue * rato * uphours).toFixed(2)

				console.log('revenue:' + jobRevenue + '|rato:' + rato + '|uphours:' + uphours)
				console.log('calRevenue:')
				console.log(calRevenue)
				

				let revenue = _u.get('revenue') || {}
				revenue[user.id] = {calRevenue,name:user.get('name'),uptimes:cal.uptimes,id:user.id}
				_u.set('revenue', revenue)
				await _u.save(null,{useMasterKey:true})

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
				let calData = {calRevenue,name:user.get('name'),id:user.id}
				if(user.id == origin_user_id){
					calData.uptimes = cal.uptimes
				}
				revenue_list[user.id] = calData
				newRevenue.set('list',revenue_list)
				await newRevenue.save(null,{useMasterKey:true})

				user = _u
			}
		} catch(e) {
			console.log(e.message)
		}
}
	console.log('end')
});

function calRevenue(result){
	let user = result.shift()

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

function getMonthTime(){
	var now = new Date(); //当前日期
// var nowDayOfWeek = now.getDay(); //今天本周的第几天
// var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getFullYear(); //当前年

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