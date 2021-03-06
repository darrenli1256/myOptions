const { redisGet } = require("../../util/util_redis");



const getIndex = async (req, res) => {
	try {
		let bigIndexContainerValue = await redisGet("bigIndexContainer");
		let futureContainerValue = await redisGet("futureContainer");
		let realtimeOptValue = await redisGet("realtimeOpt");

		let transfer = {
			bigIndex: JSON.parse(bigIndexContainerValue),
			futureIndex: JSON.parse(futureContainerValue),
			optDis: JSON.parse(realtimeOptValue),
		};
		res.status(200).send(transfer);
	} catch {
		res.send({msg: "fail"});
	}
};



module.exports = {
	getIndex
};