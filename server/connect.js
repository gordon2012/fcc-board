const mongoose = require('mongoose');

const dbUrl =
    process.env.NODE_ENV !== 'production'
        ? 'mongodb://localhost:27017/fcc-board'
        : process.env.ATLAS_URI;

const omitVersion = (doc, obj) => {
    delete obj.__v;
    return obj;
};

const connect = async (model, schema) => {
    const connection = await mongoose.createConnection(dbUrl, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        bufferCommands: false,
        bufferMaxEntries: 0,
    });

    return connection.model(
        model,
        new mongoose.Schema(schema, {
            timestamps: {
                createdAt: 'created_on',
                updatedAt: 'bumped_on',
            },
            toJSON: {
                transform: omitVersion,
            },
        })
    );
};

module.exports = connect;
