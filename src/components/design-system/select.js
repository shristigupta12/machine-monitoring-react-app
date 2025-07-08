// src/components/design-system/select.js
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

function Select({ options = [], placeholder = "Select an option", onChange, value, className = "", label = '', id, ...props }) {
  return (
    <FloatingLabel controlId={id} label={label} className={`${className} mb-3`}>
      <Form.Select 
        aria-label={placeholder}
        onChange={onChange}
        value={value}
        className="form-select"
        {...props}
      >
        {options.length === 0 ? (
          <option value="">{placeholder}</option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label || option.value}
            </option>
          ))
        )}
      </Form.Select>
    </FloatingLabel>
  );
}

export default Select;