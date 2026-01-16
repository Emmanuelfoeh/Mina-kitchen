'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AddUserModalProps {
  children: React.ReactNode;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
  password: string;
  confirmPassword: string;
}

export function AddUserModal({ children }: AddUserModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    isVerified: true,
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          isVerified: formData.isVerified,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form and close modal
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'CUSTOMER',
          isVerified: true,
          password: '',
          confirmPassword: '',
        });
        setErrors({});
        setOpen(false);

        // Refresh the page to show the new user
        window.location.reload();
      } else {
        if (data.error === 'Email is already taken') {
          setErrors({ email: 'This email is already registered' });
        } else {
          setErrors({ general: data.error || 'Failed to create user' });
        }
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setErrors({ general: 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      isVerified: true,
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with role assignment and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number (optional)"
              className={errors.phone ? 'border-red-300' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                className={errors.password ? 'border-red-300' : ''}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={e =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                placeholder="Confirm password"
                className={errors.confirmPassword ? 'border-red-300' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'CUSTOMER' | 'ADMIN') =>
                handleInputChange('role', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isVerified"
              checked={formData.isVerified}
              onCheckedChange={checked =>
                handleInputChange('isVerified', checked as boolean)
              }
            />
            <Label htmlFor="isVerified" className="text-sm">
              Activate account immediately
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#f97316] text-white hover:bg-[#ea580c]"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
