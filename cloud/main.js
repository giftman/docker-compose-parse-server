Parse.Cloud.define('hello', function(req, res) {
  return {
		"code": 200,
		"message": "hello man"
	}
});


Parse.Cloud.define("averageStars", async (req,res) => {
   let userId = req.params.id
		// sessionToken = req.user.get("sessionToken");
	// if(!userId || !sessionToken) return {
	// 	"message": "参数不齐"
	// }

	let query = new Parse.Query(Parse.User);
	// query.equalTo("user", {
	// 	"__type": "Pointer",
	// 	"className": "_User",
	// 	"objectId": userId
	// })
	query.equalTo("objectId", userId);
	query.limit(1);
	try {
		var objs = await query.find({useMasterKey: true});

		objs[0].set('name',req.params.name)
		await objs[0].save({useMasterKey: true})
	} catch(e) {
		return e.message
	}
	return 1
});