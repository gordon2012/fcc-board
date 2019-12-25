import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BASE_URL } from './index';

import Layout from './components/Layout';
import Card from './components/Card';
import Form from './components/Form';
import Input from './components/Input';
import Button from './components/Button';

import Replies from './components/Replies';

const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css?family=Ubuntu+Mono|Ubuntu:400,700&display=swap');

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 0 1rem;
        background: #fae8f5;
        font-family: "Ubuntu", "Helvetica", sans-serif;
    }
`;

const Title = styled.h1`
    text-align: center;
`;

const List = styled.ul``;

const boards = ['general', 'advanced', 'specialized'];

const App = () => {
    const [previews, setPreviews] = React.useState({});
    const [deleted, setDeleted] = React.useState({});
    const [reported, setReported] = React.useState({});

    React.useEffect(() => {
        (async () => {
            const previews = {};
            await Promise.all(
                boards.map(async board => {
                    const res = await fetch(`${BASE_URL}/api/threads/${board}`);
                    const data = await res.json();
                    previews[board] = data;
                })
            );
            setPreviews(previews);
        })();
    }, []);

    const getPreview = async board => {
        const res = await fetch(`${BASE_URL}/api/threads/${board}`);
        const data = await res.json();
        setPreviews(prevState => ({
            ...prevState,
            [board]: data,
        }));
    };

    const postThread = async ({ board, ...input }) => {
        await fetch(`${BASE_URL}/api/threads/${board}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });
        getPreview(board);
    };

    const postReply = async ({ board, threadid_, ...input }) => {
        await fetch(`${BASE_URL}/api/replies/${board}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadid_, ...input }),
        });
        getPreview(board);
    };

    const deleteThread = async ({ board, threadid_, ...input }) => {
        const res = await fetch(`${BASE_URL}/api/threads/${board}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadid_, ...input }),
        });
        const data = await res.json();

        setDeleted(prevState => ({
            ...prevState,
            [threadid_]: { success: data === 'success' },
        }));

        setTimeout(() => {
            setDeleted(prevState => ({
                ...prevState,
                [threadid_]: { success: false, done: true },
            }));
            if (data === 'success') {
                getPreview(board);
            }
        }, 2000);
    };

    const reportThread = async ({ board, threadid_ }) => {
        const res = await fetch(`${BASE_URL}/api/threads/${board}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadid_ }),
        });
        const data = await res.json();

        if (data === 'success') {
            setReported(prevState => ({
                ...prevState,
                [threadid_]: true,
            }));
        }
    };

    return (
        <>
            <GlobalStyle />
            <Layout>
                <Title>Anonymous Message Board</Title>

                <Card>
                    <h3>User Stories</h3>
                    <List>
                        {[
                            `Only allow your site to be loading in an iFrame on your own pages.`,
                            `Do not allow DNS prefetching.`,
                            `Only allow your site to send the referrer for your own pages.`,
                            `I can POST a thread to a specific message board by passing form data text and deletepassword_ to /api/threads/{board}. Saved will be at least _id, text, createdon_(date&time), bumpedon_(date&time, starts same as created_on), reported(boolean), deletepassword_, & replies(array).`,
                            `I can POST a reply to a thread on a specific board by passing form data text, deletepassword_, & threadid_ to /api/replies/{board} and it will also update the bumped_on date to the comments date. In the thread's replies array will be saved _id, text, createdon_, deletepassword_, & reported.`,
                            `I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies each from /api/threads/{board}. The reported and deletepasswords_ fields will not be sent to the client.`,
                            `I can GET an entire thread with all its replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields the client should be see.`,
                            `I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the threadid_ & deletepassword_. (Text response will be 'incorrect password' or 'success')`,
                            `I can delete a post(just changing the text to '[deleted]' instead of removing completely like a thread) if I send a DELETE request to /api/replies/{board} and pass along the threadid_, replyid_, & deletepassword_. (Text response will be 'incorrect password' or 'success')`,
                            `I can report a thread and change its reported value to true by sending a PUT request to /api/threads/{board} and pass along the threadid_. (Text response will be 'success')`,
                            `I can report a reply and change its reported value to true by sending a PUT request to /api/replies/{board} and pass along the threadid_ & replyid_. (Text response will be 'success')`,
                            `Complete functional tests that wholly test routes and pass.`,
                        ].map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </List>
                </Card>

                <Title as="h2">Front-End</Title>

                {boards.map(board => (
                    <Card key={board}>
                        <Title>
                            {board[0].toUpperCase() + board.substring(1)}
                        </Title>

                        <h4>New Thread</h4>
                        <Form
                            onSubmit={postThread}
                            data={{
                                board,
                            }}
                        >
                            <Input name="text" title="Text" />
                            <Input
                                name="deletepassword_"
                                title="Delete Password"
                            />
                            <Button>Submit</Button>
                        </Form>

                        {previews[board] ? (
                            previews[board].length > 0 ? (
                                <>
                                    <h4>Threads</h4>
                                    {previews[board].map(
                                        ({
                                            _id,
                                            text,
                                            createdon_,
                                            replies,
                                        }) => (
                                            <Card key={_id} variant="light">
                                                {deleted[_id] &&
                                                deleted[_id].success ? (
                                                    <>Deleted...</>
                                                ) : (
                                                    <>
                                                        {text}
                                                        <br />
                                                        <br />
                                                        <Replies
                                                            board={board}
                                                            threadid_={_id}
                                                            replies={replies}
                                                            reload={() => {
                                                                getPreview(
                                                                    board
                                                                );
                                                            }}
                                                        />
                                                        <h4>Add Reply</h4>
                                                        <Form
                                                            onSubmit={postReply}
                                                            data={{
                                                                board,
                                                                threadid_: _id,
                                                            }}
                                                        >
                                                            <Input
                                                                name="text"
                                                                title="Text"
                                                            />
                                                            <Input
                                                                name="deletepassword_"
                                                                title="Delete Password"
                                                            />
                                                            <Button>
                                                                Submit
                                                            </Button>
                                                        </Form>

                                                        <h4>Delete Thread</h4>
                                                        <Form
                                                            onSubmit={
                                                                deleteThread
                                                            }
                                                            data={{
                                                                board,
                                                                threadid_: _id,
                                                            }}
                                                        >
                                                            <Input
                                                                name="deletepassword_"
                                                                title="Delete Password"
                                                            />
                                                            <Button>
                                                                Submit
                                                            </Button>
                                                        </Form>
                                                        {deleted[_id] &&
                                                            !deleted[_id]
                                                                .success &&
                                                            !deleted[_id]
                                                                .done && (
                                                                <>
                                                                    Incorrect
                                                                    Password
                                                                </>
                                                            )}

                                                        {reported[_id] ? (
                                                            <h4>
                                                                Thread Reported
                                                            </h4>
                                                        ) : (
                                                            <Form
                                                                onSubmit={
                                                                    reportThread
                                                                }
                                                                data={{
                                                                    board,
                                                                    threadid_: _id,
                                                                }}
                                                            >
                                                                <Button>
                                                                    Report
                                                                    Thread
                                                                </Button>
                                                            </Form>
                                                        )}
                                                    </>
                                                )}
                                            </Card>
                                        )
                                    )}
                                </>
                            ) : (
                                <h4>No Threads</h4>
                            )
                        ) : (
                            <h4>Loading...</h4>
                        )}
                    </Card>
                ))}
            </Layout>
        </>
    );
};

export default App;
