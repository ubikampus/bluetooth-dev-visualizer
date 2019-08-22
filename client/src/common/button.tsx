import styled from 'styled-components';

const Button = styled.button`
  border: none;
  margin: 5px;
  border-radius: 100px;
  padding: 7px 25px;
  color: white;

  cursor: pointer;
  font-weight: 700;
  background-color: #4287f5;
  font-family: inherit;

  &[disabled] {
    opacity: 0.2;
    cursor: auto;
  }

  &:not([disabled]):hover {
    color: #f0f0f0;
  }
`;

export const SecondaryButton = styled(Button)`
  background: white;
  color: #4287f5;
  border: 1px solid #4287f5;

  &:not([disabled]):hover {
    color: #72a0ea;
  }
`;

export const PrimaryButton = styled(Button)`
  background: #4287f5;
  color: white;

  &&:hover {
    color: #eee;
  }
`;

export default Button;

export const MapboxButton = styled.div`
  && {
    display: inline-block;
  }

  position: absolute;
  bottom: 160px;
  right: 10px;
  z-index: 1000;
`;
