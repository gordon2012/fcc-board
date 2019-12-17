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

    const postThread = input => {
        // console.log({ board, ...input });

        console.log(input);
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

                {/* get board names from api */}
                {/* for now use 'general' */}
                {/* {['general'].map(board => (
                    <Card key={board}>
                        <h3>{board[0].toUpperCase() + board.substring(1)}</h3>
                    </Card>
                ))} */}

                {boards.map(board => (
                    <Card key={board}>
                        <Title>
                            {board[0].toUpperCase() + board.substring(1)}
                        </Title>

                        {previews[board] &&
                            previews[board].map(
                                ({ _id, text, createdon_, replies }) => (
                                    <Card key={_id} variant="light">
                                        {text}
                                        <br />
                                        <br />
                                        <Card>
                                            <ul>
                                                {replies.map(
                                                    ({ _id, text }) => (
                                                        <li key={_id}>
                                                            {text}{' '}
                                                            <small>
                                                                on {createdon_}
                                                            </small>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </Card>
                                    </Card>
                                )
                            )}

                        <Form onSubmit={postThread}>
                            <Input name="board" type="hidden" value={board} />
                            <Input name="text" title="Message" />
                            <Button>New Thread</Button>
                        </Form>
                    </Card>
                ))}

                {/* <Card>
                    <h3>General</h3>

                    <Card variant="light">
                        Thread
                        <br />
                        <br />
                        <Card>
                            <p>Replies:</p>
                            <Card variant="light">Reply</Card>
                            <Card variant="light">Reply</Card>
                            <Button>Add Reply</Button>
                        </Card>
                    </Card>

                    <Card variant="light">
                        <p>Another Thread</p>
                        <Card>
                            <p>Replies:</p>
                            <Card variant="light">Another Reply</Card>
                            <Button>Add Reply</Button>
                        </Card>
                    </Card>
                    <Form>
                        <Input type="text" name="text"></Input>
                        <Button>New Thread</Button>
                    </Form>
                </Card> */}

                <Card>
                    <h3>Debug</h3>

                    <Code box>{previews}</Code>
                </Card>

                {/* <Card>
                    <h3>Input</h3>

                    <Form debug onSubmit={getExample}>
                        <Input required name="name" title="Name" />
                        <Button type="submit">Submit</Button>
                    </Form>

                    {results.getExample && (
                        <>
                            <h3>Result</h3>
                            <Code box>{results.getExample}</Code>
                            <Button onClick={() => clearResult('getExample')}>
                                Clear
                            </Button>
                        </>
                    )}
                </Card> */}

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
