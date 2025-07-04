import Form from 'react-bootstrap/Form';

export const Input = ({ type = 'text', placeholder = 'Enter value', onChange, value, ...props }) => {
    return (
        <Form.Control
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            {...props}
        />
    )
}