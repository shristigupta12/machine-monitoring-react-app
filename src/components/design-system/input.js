// src/components/design-system/input.js
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export const Input = ({ type = 'text', placeholder = 'Enter value', onChange, value, className = "", label = '', id, ...props }) => {
    return (
        // Use 'id' from props for controlId, which will then link to Form.Control
        <FloatingLabel controlId={id} label={label} className={className}>
            <Form.Control
                type={type}
                placeholder={placeholder || label}
                onChange={onChange}
                value={value}
                // Removed the 'id' prop from Form.Control itself to avoid the warning,
                // as it will be derived from FloatingLabel's controlId
                {...props}
            />
        </FloatingLabel>
    )
}