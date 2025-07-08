// src/components/design-system/input.js
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export const Input = ({ type = 'text', placeholder = 'Enter value', onChange, value, className = "", label = '', id, ...props }) => {
    return (
        <FloatingLabel controlId={id} label={label} className={`${className} mb-3`}>
            <Form.Control
                type={type}
                placeholder={placeholder || label}
                onChange={onChange}
                value={value}
                className="form-control"
                {...props}
            />
        </FloatingLabel>
    )
}