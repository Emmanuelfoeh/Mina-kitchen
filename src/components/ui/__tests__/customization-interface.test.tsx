import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    {
      id: 'optional-checkbox',
      name: 'Add-ons',
      type: 'checkbox',
      required: false,
      maxSelections: 2,
      options: [
        {
          id: 'extra-sauce',
          name: 'Extra Sauce',
          priceModifier: 0.5,
          isAvailable: true,
        },
        {
          id: 'extra-rice',
          name: 'Extra Rice',
          priceModifier: 2.0,
          isAvailable: true,
        },
      ],
    },
    {
      id: 'required-text',
      name: 'Special Instructions',
      type: 'text',
      required: true,
      options: [],
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

describe('CustomizationInterface', () => {
  it('renders customization options correctly', () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    expect(screen.getByText('Spice Level')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Special Instructions')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    const addToCartButton = screen.getByRole('button', {
      name: /please complete required fields/i,
    });

    // Initially button should be disabled due to missing required fields
    expect(addToCartButton).toBeDisabled();
    expect(screen.getByText('Spice Level is required')).toBeInTheDocument();
    expect(
      screen.getByText('Special Instructions cannot be empty')
    ).toBeInTheDocument();
  });

  it('enables add to cart button when all required fields are filled', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Select required radio option
    const mildOption = screen.getByRole('radio', { name: /mild/i });
    fireEvent.click(mildOption);

    // Fill required text field
    const textInput = screen.getByPlaceholderText(
      /enter your special instructions/i
    );
    fireEvent.change(textInput, { target: { value: 'Test instructions' } });

    await waitFor(() => {
      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      expect(addToCartButton).not.toBeDisabled();
    });
  });

  it('calculates price correctly with customizations', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Select hot option (adds $1.50)
    const hotOption = screen.getByRole('radio', { name: /hot.*\$1\.50/i });
    fireEvent.click(hotOption);

    // Select extra sauce (adds $0.50)
    const extraSauceOption = screen.getByRole('checkbox', {
      name: /extra sauce.*\$0\.50/i,
    });
    fireEvent.click(extraSauceOption);

    // Fill required text field
    const textInput = screen.getByPlaceholderText(
      /enter your special instructions/i
    );
    fireEvent.change(textInput, { target: { value: 'Test instructions' } });

    await waitFor(() => {
      // Base price $10.99 + Hot $1.50 + Extra Sauce $0.50 = $12.99
      expect(screen.getByText('$12.99')).toBeInTheDocument();
    });
  });

  it('prevents adding to cart when validation fails', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    // Should show validation errors
    expect(
      screen.getByText('Please complete the following:')
    ).toBeInTheDocument();
    expect(screen.getByText('Spice Level is required')).toBeInTheDocument();
    expect(
      screen.getByText('Special Instructions cannot be empty')
    ).toBeInTheDocument();

    // Should not call addItem
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('successfully adds item to cart when validation passes', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Fill all required fields
    const mildOption = screen.getByLabelText('Mild');
    fireEvent.click(mildOption);

    const textInput = screen.getByPlaceholderText(
      /enter your special instructions/i
    );
    fireEvent.change(textInput, { target: { value: 'Test instructions' } });

    await waitFor(() => {
      const addToCartButton = screen.getByRole('button', {
        name: /add to cart/i,
      });
      expect(addToCartButton).not.toBeDisabled();
    });

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith({
        id: 'test-id',
        menuItemId: 'test-item',
        quantity: 1,
        selectedCustomizations: [
          {
            customizationId: 'required-radio',
            optionIds: ['mild'],
            textValue: undefined,
          },
          {
            customizationId: 'required-text',
            optionIds: [],
            textValue: 'Test instructions',
          },
        ],
        specialInstructions: undefined,
        unitPrice: 10.99,
        totalPrice: 10.99,
      });
    });
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
    const unavailableRadio = screen.getByDisplayValue('unavailable');
    expect(unavailableRadio).toBeDisabled();
  });

  it('enforces max selections for checkbox customizations', async () => {
    render(<CustomizationInterface item={mockMenuItem} />);

    // Select both checkbox options (max is 2)
    const extraSauceOption = screen.getByLabelText('Extra Sauce');
    const extraRiceOption = screen.getByLabelText('Extra Rice');

    fireEvent.click(extraSauceOption);
    fireEvent.click(extraRiceOption);

    // Both should be selected (within limit)
    expect(extraSauceOption).toBeChecked();
    expect(extraRiceOption).toBeChecked();

    // No validation error should appear for this customization
    expect(
      screen.queryByText(/maximum.*selections allowed/i)
    ).not.toBeInTheDocument();
  });
});
