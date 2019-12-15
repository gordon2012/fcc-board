const threadSchema = {
    board: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    reported: {
        type: Boolean,
        default: false,
    },
    deletepassword_: {
        type: String,
        required: true,
    },
    replies: [
        {
            text: {
                type: String,
                required: true,
            },
            createdon_: {
                type: Date,
                default: Date.now,
            },
            deletepassword_: {
                type: String,
                required: true,
            },
            reported: {
                type: Boolean,
                default: false,
            },
        },
    ],
};

module.exports = threadSchema;
