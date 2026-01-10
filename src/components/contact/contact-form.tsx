'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: '',
    });

    setIsSubmitting(false);
    alert("Message sent successfully! We'll get back to you within 24 hours.");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full rounded-3xl border border-orange-100 bg-white p-8 shadow-lg md:p-12">
      <h3 className="mb-2 text-2xl font-bold">Send us a Message</h3>
      <p className="mb-8 text-gray-500">
        We'll get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="ml-1 text-sm font-bold text-gray-900">
              Full Name
            </Label>
            <Input
              className="h-12 w-full rounded-xl border-orange-100 bg-orange-50/30 px-4 transition-all focus:border-orange-600 focus:ring-orange-600"
              placeholder="John Doe"
              type="text"
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="ml-1 text-sm font-bold text-gray-900">
              Email Address
            </Label>
            <Input
              className="h-12 w-full rounded-xl border-orange-100 bg-orange-50/30 px-4 transition-all focus:border-orange-600 focus:ring-orange-600"
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-sm font-bold text-gray-900">
            Subject
          </Label>
          <select
            className="h-12 w-full rounded-xl border border-orange-100 bg-orange-50/30 px-4 transition-all focus:border-orange-600 focus:ring-orange-600"
            value={formData.subject}
            onChange={e => handleChange('subject', e.target.value)}
          >
            <option value="">General Inquiry</option>
            <option value="general">General Inquiry</option>
            <option value="catering">Catering Request</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Business Partnership</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="ml-1 text-sm font-bold text-gray-900">
            Your Message
          </Label>
          <Textarea
            className="w-full resize-none rounded-xl border-orange-100 bg-orange-50/30 p-4 transition-all focus:border-orange-600 focus:ring-orange-600"
            placeholder="How can we help you today?"
            rows={6}
            value={formData.message}
            onChange={e => handleChange('message', e.target.value)}
            required
          />
        </div>

        <Button
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-10 font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:-translate-y-0.5 hover:bg-orange-700 md:w-auto"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
          <span className="ml-1">→</span>
        </Button>
      </form>
    </div>
  );
}
