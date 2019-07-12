
var auto = require("./auto.js"); // 用户
Parse.Cloud.afterSave("Record", auto.afterRecord)
Parse.Cloud.beforeSave(Parse.User,auto.beforeUserSave)

var func = require("./func.js"); // 用户

Parse.Cloud.define("updateUser", func.updateUser)
Parse.Cloud.define("getMyUser", func.getMyUser)
Parse.Cloud.define("changePassword",func.changePassword)
Parse.Cloud.define("request",func.request)

