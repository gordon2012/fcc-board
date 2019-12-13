const express = require('express');
const cors = require('cors');

const connect = require('./connect');
const exampleSchema = require('./models/example');
const threadSchema = require('./models/thread');

const app = express();
const origin =
    process.env.NODE_ENV !== 'production'
        ? 'http://localhost:3000'
        : 'https://board.gordondoskas.com';
app.use(cors({ origin }));
app.use(express.json());

app.get('/api/example/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        // const thread = await Thread.create({ board, ...req.body });

        console.log({ board, ...req.body });
        res.status(200).json({ board, ...req.body });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/threads/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.create({ board, ...req.body });

        res.status(200).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/replies/:board', async (req, res) => {
    try {
        const { board } = req.params;
        const { thread_id, ...body } = req.body;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.findOneAndUpdate(
            { _id: req.body.thread_id, board },
            {
                $push: {
                    replies: {
                        $each: [body],
                        $sort: { created_on: -1 },
                    },
                },
            },
            { new: true }
        );
        res.status(200).json(thread);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
GET /api/threads/{board}
* return:
most recent 10 bumped threads with most recent 3 replies from
- omit:
reported
delete_password
*/
app.get('/api/threads/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);

        // aggreate?
        const threads = await Thread.find(
            { board },
            '-reported -delete_password -replies.reported -replies.delete_password'
        ).sort('-bumped_on');

        // console.log({board, ...req.body})
        res.status(200).json(threads);

        // console.log({board, ...req.body})
        // res.status(200).json({board, ...req.body});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
GET /api/replies/{board}?thread_id={thread_id}
* return entire thread
- omit:
reported
delete_password
*/

/*
DELETE /api/threads/{board}
* form data:
thread_id
delete_password
* return:
'incorrect password' or 'success'
*/

/*
DELETE /api/replies/{board}
* form data:
thread_id
reply_id
delete_password
* return:
'incorrect password' or 'success'
(just changing the text to '[deleted]')
*/

/*
PUT /api/threads/{board}
* form data:
thread_id
* change:
reported -> true
* response:
'success'
*/

/*
PUT /api/replies/{board}
* form dats:
thread_id
reply_id
* change:
reported -> true
* response:
'success'
*/

const port = 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
