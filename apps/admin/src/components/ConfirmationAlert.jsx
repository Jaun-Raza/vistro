import React from 'react';
import styled from 'styled-components';

const ConfirmationAlert = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  type = 'danger' // danger, warning, info
}) => {
  if (!isOpen) return null;
  
  // Prevent background clicks from closing the modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine button color based on type
  const getButtonColor = () => {
    switch(type) {
      case 'danger':
        return '#ff3333';
      case 'warning':
        return '#ff9933';
      case 'info':
        return '#434ce6';
      default:
        return '#434ce6';
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <AlertContainer>
        <AlertHeader type={type}>
          <h3>{title}</h3>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </AlertHeader>
        
        <AlertBody>
          <p>{message}</p>
        </AlertBody>
        
        <AlertFooter>
          <CancelButton onClick={onClose}>{cancelText}</CancelButton>
          <ConfirmButton 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type={type}
            buttoncolor={getButtonColor()}
          >
            {confirmText}
          </ConfirmButton>
        </AlertFooter>
      </AlertContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const AlertContainer = styled.div`
  background-color: #ffffff;
  border-radius: 1rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e8e8e8;
  background-color: ${props => {
    switch(props.type) {
      case 'danger':
        return '#ffebeb';
      case 'warning':
        return '#fff5eb';
      case 'info':
        return '#e8e9fa';
      default:
        return '#e8e9fa';
    }
  }};
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
    color: ${props => {
      switch(props.type) {
        case 'danger':
          return '#d32f2f';
        case 'warning':
          return '#ed6c02';
        case 'info':
          return '#434ce6';
        default:
          return '#434ce6';
      }
    }};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2.4rem;
  cursor: pointer;
  color: #888;
  &:hover {
    color: #333;
  }
`;

const AlertBody = styled.div`
  padding: 2rem 1.5rem;
  
  p {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.5;
    color: #333;
  }
`;

const AlertFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  gap: 1rem;
  border-top: 1px solid #e8e8e8;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #555;
  
  &:hover {
    background-color: #e8e8e8;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${props => props.buttoncolor};
  border: none;
  color: white;
  
  &:hover {
    background-color: ${props => {
      // Darken the button color on hover
      const color = props.buttonColor;
      return color === '#434ce6' ? '#3038c9' : 
             color === '#ff3333' ? '#e02020' : 
             color === '#ff9933' ? '#e98a20' : '#3038c9';
    }};
  }
`;

export default ConfirmationAlert;