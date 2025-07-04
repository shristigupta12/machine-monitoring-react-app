import Form from 'react-bootstrap/Form';

function Select({ options = [], placeholder = "Select an option", onChange, value, ...props }) {
  return (
    <Form.Select 
      aria-label={placeholder}
      onChange={onChange}
      value={value}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.value}
        </option>
      ))}
    </Form.Select>
  );
}

export default Select;