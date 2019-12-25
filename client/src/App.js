import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BASE_URL } from './index';

import Layout from './components/Layout';
import Card from './components/Card';
import Code from './components/Code';
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
    const [responses, setResponses] = React.useState([]);

    const [results, setResults] = React.useState({});
    const clearResult = name =>
        setResults(prevState => {
            const { [name]: __, ...newState } = prevState;
            return newState;
        });

    const getExample = async () => {
        const response = await fetch(`${BASE_URL}/api/example`);
        const data = await response.json();
        setResponses(prevState => [data, ...prevState]);
        setResults(prevState => ({ ...prevState, getExample: data }));
    };

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
                <Title>
                    Information Security and Quality Assurance Boilerplate
                </Title>

                <Card>
                    <h3>User Stories</h3>
                    <List as="ol">
                        <li>I will have user stories.</li>
                    </List>
                </Card>

                <Card>
                    <h3>Example Usage</h3>
                    <Code>/api/test</Code>
                </Card>

                <Card>
                    <h3>Example Return</h3>
                    <Code box>
                        {{
                            hello: 'world',
                        }}
                    </Code>
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

                <Card>
                    <h3>Debug</h3>

                    <Code box>{previews}</Code>
                </Card>

                {responses.length > 0 && (
                    <>
                        <Title as="h2">Responses</Title>
                        <Card>
                            {responses.map((e, i) => (
                                <Code box key={i}>
                                    {e}
                                </Code>
                            ))}
                        </Card>
                    </>
                )}
            </Layout>
        </>
    );
};

export default App;
