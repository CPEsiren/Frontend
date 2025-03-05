import React, { useState, useEffect } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

// Define interface extending TextFieldProps
interface NumberFormatTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const NumberFormatTextField: React.FC<NumberFormatTextFieldProps> = (props) => {
  const { onChange, value, ...otherProps } = props;
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format the initial value if it exists
  useEffect(() => {
    if (value) {
      const numValue = value.toString().replace(/,/g, '');
      const formattedValue = Number(numValue).toLocaleString('en-US');
      setDisplayValue(formattedValue);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the raw input value
    const inputValue = e.target.value;
    
    // Remove all non-digit characters
    const numericValue = inputValue.replace(/[^\d]/g, '');
    
    if (numericValue === '') {
      setDisplayValue('');
      
      // Pass the empty value to parent component
      if (onChange) {
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(newEvent);
      }
    } else {
      // Convert to number and format with commas
      const formattedValue = Number(numericValue).toLocaleString('en-US');
      setDisplayValue(formattedValue);
      
      // Pass the raw numeric value to parent component
      if (onChange) {
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: numericValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(newEvent);
      }
    }
  };

  return (
    <TextField
      {...otherProps}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

export default NumberFormatTextField;