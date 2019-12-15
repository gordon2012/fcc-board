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

// POST new thread
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

// POST new reply
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

// GET 10 latest threads (each with 3 latest replies)
app.get('/api/threads/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const threads = await Thread.find(
            { board },
            {
                reported: false,
                delete_password: false,
                'replies.reported': false,
                'replies.delete_password': false,
                replies: {
                    $slice: 3,
                },
            }
        )
            .sort('-bumped_on')
            .limit(10);

        res.status(200).json(threads);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET an entire thread
app.get('/api/replies/:board', async (req, res) => {
    try {
        const { board } = req.params;
        const { thread_id } = req.query;

        const Thread = await connect('thread', threadSchema);

        const threads = await Thread.findOne(
            { _id: thread_id, board },
            {
                reported: false,
                delete_password: false,
                'replies.reported': false,
                'replies.delete_password': false,
            }
        );

        res.status(200).json(threads);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a thread
app.delete('/api/threads/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.findOne({
            board,
            _id: req.body.thread_id,
        });

        if (!thread) {
            return res.status(200).json('not found');
        }
        if (thread.delete_password !== req.body.delete_password) {
            return res.status(200).json('incorrect password');
        }

        await Thread.deleteOne({ _id: req.body.thread_id });

        res.status(200).json('success');
    } catch (error) {
        res.status(200).json('not found');
    }
});

// DELETE a reply
app.delete('/api/replies/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.findOne({
            board,
            _id: req.body.thread_id,
        });

        if (!thread) {
            return res.status(200).json('not found');
        }

        for (let i = 0; i < thread.replies.length; i++) {
            const reply = thread.replies[i];
            if (reply._id.toString() === req.body.reply_id) {
                if (reply.delete_password === req.body.delete_password) {
                    reply.text = '[deleted]';
                    await thread.save();
                    return res.status(200).json('success');
                } else {
                    return res.status(200).json('incorrect password');
                }
            }
        }
        res.status(200).json('not found');
    } catch (error) {
        res.status(200).json('not found');
    }
});

// PUT report thread
app.put('/api/threads/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.findOneAndUpdate(
            {
                board,
                _id: req.body.thread_id,
            },
            {
                reported: true,
            }
        );

        if (!thread) {
            return res.status(200).json('not found');
        }

        res.status(200).json('success');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT report reply
app.put('/api/replies/:board', async (req, res) => {
    try {
        const { board } = req.params;

        const Thread = await connect('thread', threadSchema);
        const thread = await Thread.findOne({
            board,
            _id: req.body.thread_id,
        });

        if (!thread) {
            return res.status(200).json('not found');
        }

        for (let i = 0; i < thread.replies.length; i++) {
            const reply = thread.replies[i];
            if (reply._id.toString() === req.body.reply_id) {
                reply.reported = true;
                await thread.save();
                return res.status(200).json('success');
            }
        }
        res.status(200).json('not found');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const port = 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
