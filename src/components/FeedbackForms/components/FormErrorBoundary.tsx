import React, { ErrorInfo } from 'react';
import styled from 'styled-components';

class FormErrorBoundary extends React.Component {
  public state = {
    hasError: false,
  };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[error]: ', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container>
          <h1>Sorry! there was an error, please reload the page.</h1>
        </Container>
      );
    }

    return this.props.children;
  }
}

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

export default FormErrorBoundary;
