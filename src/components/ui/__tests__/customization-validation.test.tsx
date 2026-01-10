import { render, screen, fireEvent } from '@testing-library/react';
import { CustomizationInterface } from '../customization-interface';
import { useCartStore } from '../../../stores/cart-store';
import type { MenuItem } from '../../../types';

// Mock the cart store
jest.mock('../../../stores/cart-store');
const mockUseCartStore = useCartStore as jest.MockedFunction<
  typeof useCartStore
>;

// Mock utils
jest.mock('../../../utils', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  generateId: () => 'test-id',
}));

const mockMenuItem: MenuItem = {
  id: 'test-item',
  name: 'Test Item',
  description: 'Test description',
  basePrice: 10.99,
  category: {
    id: 'cat1',
    name: 'Test Category',
    description: 'Test',
    displayOrder: 1,
    isActive: true,
  },
  image: '/test-image.jpg',
  status: 'active',
  customizations: [
    {
      id: 'required-radio',
      name: 'Spice Level',
      type: 'radio',
      required: true,
      options: [
        { id: 'mild', name: 'Mild', priceModifier: 0, isAvailable: true },
        { id: 'hot', name: 'Hot', priceModifier: 1.5, isAvailable: true },
      ],
    },
  ],
  tags: ['test'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAddItem = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCartStore.mockReturnValue({
    items: [],
    isOpen: false,
    addItem: mockAddItem,
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    updateCustomizations: jest.fn(),
    clearCart: jest.fn(),
    toggleCart: jest.fn(),
    getTotalItems: jest.fn(() => 0),
    getSubtotal: jest.fn(() => 0),
    getTotal: jest.fn(() => 0),
  });
});

describe('CustomizationInterface Validation', () => {
  it('renders customization options correctly', () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    expect(screen.getByText('Spice Level')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Should show validation error for required field
    expect(screen.getAllByText('Spice Level is required')).toHaveLength(2); // One in field error, one in summary

    // Button should be disabled and show appropriate text
    const button = screen.getByRole('button', {
      name: /please complete required fields/i,
    });
    expect(button).toBeDisabled();
  });

  it('enables button when required field is selected', () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Select the mild option
    const mildRadio = screen.getByRole('radio', { name: /mild/i });
    fireEvent.click(mildRadio);

    // Button should now be enabled with correct price
    const button = screen.getByRole('button', { name: /add to cart.*10\.99/i });
    expect(button).not.toBeDisabled();
  });

  it('calculates price with modifiers correctly', () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Select the hot option (adds $1.50)
    const hotRadio = screen.getByRole('radio', { name: /hot.*1\.50/i });
    fireEvent.click(hotRadio);

    // Total should be $10.99 + $1.50 = $12.49
    expect(screen.getByText('$12.49')).toBeInTheDocument();
  });

  it('handles unavailable options correctly', () => {
    const itemWithUnavailableOption: MenuItem = {
      ...mockMenuItem,
      customizations: [
        {
          id: 'test-radio',
          name: 'Test Options',
          type: 'radio',
          required: true,
          options: [
            {
              id: 'available',
              name: 'Available Option',
              priceModifier: 0,
              isAvailable: true,
            },
            {
              id: 'unavailable',
              name: 'Unavailable Option',
              priceModifier: 0,
              isAvailable: false,
            },
          ],
        },
      ],
    };

    render(<CustomizationInterface item={itemWithUnavailableOption} />);

    expect(screen.getByText('Available Option')).toBeInTheDocument();
    expect(screen.getByText('Unavailable Option')).toBeInTheDocument();
    expect(screen.getByText('(Unavailable)')).toBeInTheDocument();

    // Unavailable option should be disabled
    const unavailableRadio = screen.getByRole('radio', {
      name: /unavailable option/i,
    });
    expect(unavailableRadio).toBeDisabled();
  });
});
