const threadSchema = {
    text: {
        type: String,
        required: true,
    },
    reported: Boolean,
    delete_password: {
        type: String,
        required: true,
    },
    replies: [
        {
            // text: String,
        },
    ],

    // issue_text: {
    //     type: String,
    //     required: true,
    // },
    // created_by: {
    //     type: String,
    //     required: true,
    // },
    // assigned_to: {
    //     type: String,
    //     required: false,
    // },
    // status_text: {
    //     type: String,
    //     required: false,
    // },
    // open: {
    //     type: Boolean,
    //     required: true,
    // },
    // projectname: {
    //     type: String,
    //     required: true,
    // },
};

module.exports = threadSchema;
