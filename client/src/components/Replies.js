import React from 'react';
import styled from 'styled-components';
import { BASE_URL } from '../index';

import Card from './Card';
import Button from './Button';

const Slider = styled(Button)`
    width: initial;
    padding: 0;
    float: right;
    font-size: 1.5em;
    background: transparent;
    border: none;
`;

const Replies = ({ board, threadid_, replies }) => {
    const [open, setOpen] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    const [allReplies, setAllReplies] = React.useState(null);

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

    return (
        <>
            {replies && replies.length > 0 ? (
                <>
                    Replies:
                    <Card>
                        <Slider onClick={handleOpen}>
                            {open ? '🔺' : '🔻'}
                        </Slider>
                        <ul>
                            {open && allReplies ? (
                                <>
                                    {allReplies.map(
                                        ({ _id, text, createdon_ }) => (
                                            <li key={_id}>
                                                {text}{' '}
                                                <small>on {createdon_}</small>
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
                                </>
                            )}
                        </ul>
                    </Card>
                </>
            ) : (
                <>No Replies</>
            )}
        </>
    );
};

export default Replies;
