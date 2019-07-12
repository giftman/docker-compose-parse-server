
import {afterRecord,beforeUserSave} from "./auto.js" //
Parse.Cloud.afterSave("Record", afterRecord)
Parse.Cloud.beforeSave(Parse.User,beforeUserSave)

import {updateUser,getMyUser,changePassword} from "./func.js" //

Parse.Cloud.define("updateUser", updateUser)
Parse.Cloud.define("getMyUser", getMyUser)
Parse.Cloud.define("changePassword",changePassword)

