exports.select_settings = function(setting){
    switch(setting){
        // User activity
        case "UJ":
            return "user_joins";
        case "UL":
            return "user_leaves";
        case "UMD":
            return "user_msg_deletes";
        case "UME":
            return "user_msg_edits";
        case "UNC":
            return "user_nick_changes";
        case "URA":
            return "user_role_assigns";

        // Channel Activity
        case "BD":
            return "bulk_delete";
        case "VJ":
            return "vc_joins";
        case "VL":
            return "vc_leaves";

        // Moderator Activity
        case "UK":
            return "user_kicked";
        case "UM":
            return "user_muted";

        // Role Set
        case "MR":
            return "muted_role";

        default:
            return "guild_id";
    }
}

exports.list_settings = ["UJ", "UL", "UMD", "UME", "UNC", "URA", "BD", "VJ", "VL", "UK", "UM", "MR"];