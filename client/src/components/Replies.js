import React from 'react';
import styled from 'styled-components';
import { BASE_URL } from '../index';

import Card from './Card';
import Button from './Button';
import Form from './Form';
import Input from './Input';

const Slider = styled(Button)`
    width: initial;
    padding: 0;
    float: right;
    font-size: 1.5em;
    background: transparent;
    border: none;
`;

const List = styled.ul`
    padding: 0;
    li {
        border: 1px solid white;
        list-style: none;
        padding: 0.5rem;

        margin-bottom: 0.5rem;

        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const Title = styled.h4`
    margin-top: 0;
    padding-bottom: 1rem;
`;

const Replies = ({ board, threadid_, replies, reload }) => {
    const [open, setOpen] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [allReplies, setAllReplies] = React.useState(null);
    const [incorrect, setIncorrect] = React.useState({});
    const [reported, setReported] = React.useState({});

    const handleOpen = async () => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);

            if (!loaded) {
                setLoaded(true);

                if (replies && replies.length > 0) {
                    const res = await fetch(
                        `${BASE_URL}/api/replies/${board}?threadid_=${threadid_}`
                    );
                    const data = await res.json();
                    setAllReplies(data.replies);
                }
            }
        }
    };

    const deleteReply = async ({ replyid_, ...input }) => {
        const res = await fetch(`${BASE_URL}/api/replies/${board}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadid_, replyid_, ...input }),
        });
        const data = await res.json();

        if (data === 'success') {
            const repliesRes = await fetch(
                `${BASE_URL}/api/replies/${board}?threadid_=${threadid_}`
            );
            const repliesData = await repliesRes.json();
            setAllReplies(repliesData.replies);
        } else {
            setIncorrect(prevState => ({
                ...prevState,
                [replyid_]: true,
            }));
            setTimeout(() => {
                setIncorrect(prevState => ({
                    ...prevState,
                    [replyid_]: false,
                }));
            }, 2000);
        }
        reload();
    };

    const reportReply = async ({ replyid_ }) => {
        const res = await fetch(`${BASE_URL}/api/replies/${board}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ threadid_, replyid_ }),
        });
        const data = await res.json();

        if (data === 'success') {
            setReported(prevState => ({
                ...prevState,
                [replyid_]: true,
            }));
        }
    };

    return (
        <>
            {replies && replies.length > 0 ? (
                <>
                    <Card>
                        <Title>
                            Replies:
                            <Slider onClick={handleOpen}>
                                {open ? '🔺' : '🔻'}
                            </Slider>
                        </Title>
                        <List>
                            {open && allReplies ? (
                                <>
                                    {allReplies.map(
                                        ({ _id, text, createdon_ }) => (
                                            <li key={_id}>
                                                <p>{text}</p>
                                                <small>on {createdon_}</small>
                                                <br />
                                                <br />
                                                {text !== '[deleted]' && (
                                                    <>
                                                        <Form
                                                            onSubmit={
                                                                deleteReply
                                                            }
                                                            data={{
                                                                replyid_: _id,
                                                            }}
                                                        >
                                                            <Input
                                                                required
                                                                name="deletepassword_"
                                                                title="Password"
                                                            />
                                                            <Button>
                                                                Delete
                                                            </Button>
                                                        </Form>
                                                        {incorrect[_id] && (
                                                            <h4>
                                                                Incorrect
                                                                Password
                                                            </h4>
                                                        )}

                                                        {reported[_id] ? (
                                                            <h4>
                                                                Reply Reported
                                                            </h4>
                                                        ) : (
                                                            <Form
                                                                onSubmit={
                                                                    reportReply
                                                                }
                                                                data={{
                                                                    replyid_: _id,
                                                                }}
                                                            >
                                                                <Button>
                                                                    Report Reply
                                                                </Button>
                                                            </Form>
                                                        )}
                                                    </>
                                                )}
                                            </li>
                                        )
                                    )}
                                </>
                            ) : (
                                <>
                                    {replies.map(
                                        ({ _id, text, createdon_ }) => (
                                            <li key={_id}>
                                                {text}{' '}
                                                <small>on {createdon_}</small>
                                            </li>
                                        )
                                    )}
                                    {open && <h4>Loading...</h4>}
                                </>
                            )}
                        </List>
                    </Card>
                </>
            ) : (
                <>No Replies</>
            )}
        </>
    );
};

export default Replies;
