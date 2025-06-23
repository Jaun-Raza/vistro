import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  border: 4px solid rgba(173, 40, 235, 0.3); 
  border-radius: 50%;
  border-top: 4px solid #434ce6;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin: auto;
  margin-top: 15rem;
`;

const Loader = () => {
  return (
    <Wrapper>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Spinner />
        <p style={{ color: '#434ce6', marginTop: '10px' }}>Loading...</p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  margin: auto;
`;

export default Loader;
