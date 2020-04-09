/*
    Template for use of making commands using the command handler.
    The bot can be obtained by using message.client if possible.
    otherArguments is there to allow for extracting parameters for the handler to use.
*/

module.exports = {
	name: "",
	description: ".",
	examples: [""],
	permissionLevel: 0,
	parameters: {
		parameter1: {
			requirement: true,
			description: ""
		},
		parameter2: {
			requirement: false,
			description: ""
		}
	},
	execute(message, otherArguments){
		switch(otherArguments.length){
			case 0:
			{

				break;
			}
			case 1:
			{

				break;
			}

			default:
		}
	}
};
