import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export const Input = ({ type = 'text', placeholder = 'Enter value', onChange, value, className = "", label = '', ...props }) => {
    return (
        <FloatingLabel controlId={label} label={label} className={className}>
            <Form.Control
                type={type}
                placeholder={placeholder || label}
                onChange={onChange}
                value={value}
                {...props}
            />
        </FloatingLabel>
    )
}