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

Parse.Cloud.afterSave("Record", async (req) => {
 var cal = {
		// "parent":Parse.User.current(),
		"uptimes":0,
		"downtimes":0,
		"uphours":0,
		"month":"",
		"calIncome":""
  }
  const query = new Parse.Query("Record");
  query.greaterThan("createdAt", getMonthStartDate());
  let uptimes = []
  let listByDay = {}

  try {
		var results = await query.find({useMasterKey: true});
		for (let i = 0; i < results.length; ++i) {
				let record = results[i]
				//上班打卡算一次，app是每天只给上班打一次卡
				if(record.get('action')){
					uptimes.push(record)
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
				sum = sum + time
			}
		}
		console.log(sum)
		let hours = mssToHours(sum)
		cal.uphours= hours[0]
		cal.month = getMonthTime()

		//save report 
		const user = req.user
		const job = user.get('job')
		await job.fetch();
		cal.calIncome= hours[1] * job.get('dincome')/60


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
		let revenue = 0;
		let jobRevenue = job.get('revenue')

		let users = getUsers(user)
		console.log(users)
	} catch(e) {
		console.log(e.message)
	}
	console.log('end')
});

async function getUsers(user){
	if(user.get('parent')){
		let parentUser = await user.get('parent').fetch()
		return [parentUser,...getUsers(parentUser)]
	}else{
		return nil
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
	var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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