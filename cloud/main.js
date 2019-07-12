
import auto from "./auto.js" //
Parse.Cloud.afterSave("Record", auto.afterRecord)
Parse.Cloud.beforeSave(Parse.User,auto.beforeUserSave)

import func from "./func.js" //

Parse.Cloud.define("updateUser", func.updateUser)
Parse.Cloud.define("getMyUser", func.getMyUser)
Parse.Cloud.define("changePassword",func.changePassword)

