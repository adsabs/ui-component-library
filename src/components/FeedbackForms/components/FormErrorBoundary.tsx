import React, { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

class FormErrorBoundary extends React.Component<{ msg?: ReactNode }> {
  public state = {
    hasError: false,
  };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // console.error('[error]: ', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.msg) {
        return this.props.msg;
      }
      return (
        <Container>
          <h4>Sorry! there was an error, please reload the page.</h4>
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
