import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { BASE_URL } from './index';

import Layout from './components/Layout';
import Card from './components/Card';
import Code from './components/Code';
import Form from './components/Form';
import Input from './components/Input';
import Button from './components/Button';

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
    const [threads, setThreads] = React.useState({});

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

    const postThread = boards.reduce(
        (a, board) => ({
            ...a,
            [board]: async input => {
                const res = await fetch(`${BASE_URL}/api/threads/${board}`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(input),
                });
                const data = await res.json();

                setPreviews(prevState => ({
                    ...prevState,
                    [board]: [data, ...prevState[board]].slice(0, 10),
                }));
            },
        }),
        {}
    );

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
                        <Form onSubmit={postThread[board]}>
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
                                                {text}
                                                <br />
                                                <br />

                                                {replies &&
                                                replies.length > 0 ? (
                                                    <>
                                                        Replies:
                                                        <Card>
                                                            <ul>
                                                                {replies.map(
                                                                    ({
                                                                        _id,
                                                                        text,
                                                                    }) => (
                                                                        <li
                                                                            key={
                                                                                _id
                                                                            }
                                                                        >
                                                                            {
                                                                                text
                                                                            }{' '}
                                                                            <small>
                                                                                on{' '}
                                                                                {
                                                                                    createdon_
                                                                                }
                                                                            </small>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </Card>
                                                    </>
                                                ) : (
                                                    <>No Replies</>
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
