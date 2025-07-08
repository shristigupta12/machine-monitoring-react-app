import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

function Select({ options = [], placeholder = "Select an option", onChange, value, className = "", label = '', ...props }) {
  return (
    <FloatingLabel controlId={label} label={label} className={className}>
      <Form.Select 
        aria-label={placeholder}
        onChange={onChange}
        value={value}
        {...props}
      >
        {options.length === 0 ? (
          <option value="">{placeholder}</option>
        ) : (
          options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.value}
            </option>
          ))
        )}
      </Form.Select>
    </FloatingLabel>
  );
}

export default Select;