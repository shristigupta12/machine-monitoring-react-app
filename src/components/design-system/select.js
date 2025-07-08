// src/components/design-system/select.js
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

function Select({ options = [], placeholder = "Select an option", onChange, value, className = "", label = '', id, ...props }) {
  // Use 'id' from props for controlId, which will then link to Form.Select
  return (
    <FloatingLabel controlId={id} label={label} className={className}>
      <Form.Select 
        aria-label={placeholder}
        onChange={onChange}
        value={value}
        // Remove the 'id' prop from Form.Select itself to avoid the warning,
        // as it will be derived from FloatingLabel's controlId
        {...props}
      >
        {options.length === 0 ? (
          <option value="">{placeholder}</option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}> {/* Added key prop */}
              {option.label || option.value} {/* Use option.label if available, else option.value */}
            </option>
          ))
        )}
      </Form.Select>
    </FloatingLabel>
  );
}

export default Select;