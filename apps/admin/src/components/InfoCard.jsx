import { useState } from 'react';
import { X } from 'lucide-react';
import styled from 'styled-components';

// Styled components
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const PopupContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 50rem;
  margin: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-weight: 600;
  font-size: 2rem;
`;

const CloseButton = styled.button`
  color: #6b7280;
  &:hover {
    color: #374151;
  }
    
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem;
  height: 70vh;
`;

const DataItem = styled.div`
  margin-bottom: 0.75rem;
`;

const DataLabel = styled.h3`
  font-weight: 500;
  color: #4b5563;
  font-weight: bold;
  text-transform: capitalize;
`;

const DataValue = styled.p`
  color: #6b7280;
`;

export function InfoPopup({
  title = "Information",
  data = {},
  isOpen = false,
  onClose = () => { }
}) {
  if (!isOpen) return null;

  return (
    <Overlay>
      <PopupContainer>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          {Object.entries(data).map(([key, value]) => (
            <DataItem key={key}>
              <DataLabel>{key}:</DataLabel>
              <DataValue>{value}</DataValue>
            </DataItem>
          ))}
        </Content>
      </PopupContainer>
    </Overlay>
  );
}