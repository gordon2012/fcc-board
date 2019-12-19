import React from 'react';
import styled from 'styled-components';

import Code from './Code';

const StyledForm = styled.form``;

const Form = ({ blank, children, debug, onSubmit, data, ...restProps }) => {
    let elements = React.Children.toArray(children);

    const [input, setRawInput] = React.useState(
        blank
            ? elements
                  .filter(e => e.props.name)
                  .map(e => e.props.name)
                  .reduce((a, c) => ({ ...a, [c]: '' }), {})
            : {}
    );

    const setInput = (name, value) => {
        if (blank) {
            setRawInput(prevState => ({ ...prevState, [name]: value }));
        } else {
            if (value) {
                setRawInput(prevState => ({ ...prevState, [name]: value }));
            } else {
                setRawInput(prevState => {
                    const { [name]: __, ...newState } = prevState;
                    return newState;
                });
            }
        }
    };

    elements = elements.map((ele, i) => {
        if (ele.props.name) {
            return React.cloneElement(ele, {
                onChange: setInput,
                value: input[ele.props.name],
            });
        } else if (ele.props.type === 'reset') {
            return React.cloneElement(ele, {
                onClick: () => setRawInput({}),
            });
        } else {
            return ele;
        }
    });

    const handleSubmit = event => {
        event.preventDefault();
        onSubmit({ ...data, ...input });
        setRawInput(
            blank
                ? elements
                      .filter(e => e.props.name)
                      .map(e => e.props.name)
                      .reduce((a, c) => ({ ...a, [c]: '' }), {})
                : {}
        );
    };

    return (
        <>
            <StyledForm onSubmit={handleSubmit} {...restProps}>
                {elements}
            </StyledForm>
            {debug && Object.keys(input).length > 0 && <Code box>{input}</Code>}
        </>
    );
};

export default Form;
