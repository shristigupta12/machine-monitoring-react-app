import Form from 'react-bootstrap/Form';

export const Input = ({ type = 'text', placeholder = 'Enter value', onChange, value, className = "", ...props }) => {
    return (
        <Form.Control
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            className={`form-control ${className}`}
            {...props}
        />
    )
}