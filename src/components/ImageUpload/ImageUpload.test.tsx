import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ImageUpload from './ImageUpload';

describe('<ImageUpload />', () => {
  test('it should mount', () => {
    render(<ImageUpload />);
    
    const imageUpload = screen.getByTestId('ImageUpload');

    expect(imageUpload).toBeInTheDocument();
  });
});