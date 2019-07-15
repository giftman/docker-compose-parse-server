'use strict';

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

function sleep(delay) {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

function getLocalTime(dateString){
	var localDate = new Date(dateString);
	var localTime = localDate.getTime();
	var localOffset = localDate.getTimezoneOffset()*60*1000;
	new Date(localTime + localOffset);
}

module.exports = {
	"masterKey": {
		useMasterKey: true
	},
	"mssToHours": mssToHours, // 获取指定位数字
	"getMonthStartDate":getMonthStartDate,
	"getMonthTime":getMonthTime,
	"getAllReportDict":getAllReportDict,
	"getRevenueDict":getRevenueDict,
	"getJobDict":getJobDict,
	"getAllUsersDict":getAllUsersDict,
	"getAllUsers":getAllUsers,
	"getUsers":getUsers,
	"getChildUser":getChildUser,
	"time_range":time_range,
	"sleep":sleep,
}