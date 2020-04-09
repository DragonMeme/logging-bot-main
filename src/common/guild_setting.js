const { SettingValues } = require("../common/guild_setting.json");
const setLogParameters = generateSetLogParameters();

module.exports = {
	generateSetLogParameters : setLogParameters
};

// Generate setlog and quicksetlog accepted arguments.
function generateSetLogParameters(){
	const parameters = [];
	Object.values(SettingValues).forEach(
		settingValue => {
			const currentValue = settingValue.toLowerCase();
			const splitCurrentValue = currentValue.split(" ");
			let result = "";

			switch(splitCurrentValue.length){
				case 3:
				{
					if(currentValue.startsWith("user")){
						result = currentValue.replace("user ", "");
					}else if(currentValue.startsWith("voice chat")){
						result = currentValue.replace("voice chat", "vc");
					}
					break;
				}

				case 2:
				{
					if(currentValue.endsWith("role")) break;
					result = currentValue;
					break;
				}

				default:
			}
			if(result.endsWith("s")) result = result.slice(0, -1);
			if(result.length > 0) parameters.push(result.replace(" ", "_"));
		}
	);
	return parameters;
}
